import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NotificationService } from './../../../services/notification.service';
import { TerminalService } from '../../../services/terminal.service';
import { GenericDataService } from '../../../services/generic-data.service';
import { EntityService } from '../../../services/entity.service';

@Component({
	selector: 'app-terminal-edit',
	templateUrl: './terminal-edit.component.html',
	styleUrls: ['./terminal-edit.component.scss'],
	providers: [
		TerminalService, EntityService, GenericDataService,
		{provide: 'entityServiceInstance1', useClass: EntityService },
	]
})
export class TerminalEditComponent implements OnInit {

	errorMessage: any;

	role = 'create';
	isEditMode = false;
	isLoading = false;
	isPromising = false;

	pageID: number;
	terminal: any;
	sourceTerminalUsers = [];
	terminalUsers = [];
	hasPreviousTerminalUsers: boolean;

	promises: {
		createFinished: boolean,
		updateFinished: boolean
	}

	private ipv4IsValid: boolean;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private changeDetector: ChangeDetectorRef,
		private notificationService: NotificationService,
		private terminalService: TerminalService,
		private terminalUserService: GenericDataService,
		private entityService: EntityService,
		@Inject('entityServiceInstance1') private entityTerminalUserService: EntityService,
	) {
		this.entityService.setCustomEndpoint('GetAll');
		this.entityTerminalUserService.setCustomEndpoint('GetAll');
		this.terminalUserService.setEndpoint('CTerminalUser');
	}

	ngOnInit() {
		this.role = this.route.snapshot.data['role'];
		this.isEditMode = this.role === 'edit';

		// Edit Mode -- Fetch terminal info
		if(this.isEditMode && this.route.snapshot.params && this.route.snapshot.params['id']) {
			let id = this.route.snapshot.params['id'];
			this.isLoading = true;

			this.entityService.fromEntity('CTerminal')
							  .where('Id', '=', id)
							  .take(1).page(1)
							  .executeQuery();

			this.entityService.data.subscribe(
				entities => {
					if (entities && entities[0]){
						this.terminal = entities[0];
						this.pageID = this.terminal.Id;
						this.isLoading = false;

						this.entityTerminalUserService.fromEntity('CTerminalUser')
													  .where('TerminalId', '=', id)
													  .expand(['User'])
													  .take(10000)
													  .page(1)
													  .executeQuery();

						this.entityTerminalUserService.data.subscribe(
							terminalUsers => {
								if (terminalUsers && terminalUsers.length > 0) {
									// Deep copy -- MT
									this.sourceTerminalUsers = terminalUsers.map(x => Object.assign({}, x));
									this.terminalUsers = terminalUsers.filter(x => (new Date(x.EndDate)).getTime() > (Date.now()));
									this.hasPreviousTerminalUsers = terminalUsers.some(x => new Date(x.EndDate).getTime() < (Date.now()));
								}
							},
							error => this.errorMessage = <any>error);
					}
				},
				error => this.errorMessage = <any>error);
		} else { // New Terminal -- Set default
			this.terminal = {
				Name: '',
				ShortName: '',
				IsActive: false,
			};
		};
	}

	get isValid(): boolean {
		if (this.terminal && this.terminal.Name
						  && this.terminal.IpAddress
						  && this.ipv4IsValid
						  && this.terminal.MacAddress) {
			return true;
		}
		return false;
	}

	inputChangeHandler(event, name: string, target:string="terminal") {
		if(!this.terminal) return;
		switch(name) {
			case "IpAddress":
				this.terminal.IpAddress = event.formattedValue;
				this.ipv4IsValid = event.valid;
			break;
			default: 
				this[target][name] = event;
			break;
		}
		this.changeDetector.detectChanges();
	}

	save() {
		this.isLoading = true;

		// Edit Mode -- Update terminal info & save users
		if (this.pageID) {
			this.terminal.Id = this.pageID;
			this.terminalService.update(this.terminal).subscribe(
				result => {
					this.saveUsers();
				},
				error => {
					this.isLoading = false;
					console.log('<-------error------->', error);
				});
		} else { // New terminal - add new terminal
			this.terminalService.save(this.terminal).subscribe(
				result => {
					this.isLoading = false;
					this.notificationService.add({type: 'success', text: 'Terminal başarıyla oluşturuldu.'});
					this.pageID = result;
					this.router.navigate(['/terminal', result, 'edit']);
				},
				error => {
					this.isLoading = false;
					this.notificationService.add({type: 'danger', text: 'Terminal oluşturulamadı.'});
					console.log('<-------error------->', error);
				}
			);
		}
	}

	saveUsers() {
		this.promises = {
			createFinished: false,
			updateFinished: false
		};

		// Update & Create Users -- MT
		let willUpdate = [];
		let willCreate = [];

		this.terminalUsers.forEach(terminalUser => {
			let existingUser = this.sourceTerminalUsers.find(u => u.UserId === terminalUser.UserId);
			if (existingUser) {
				if (terminalUser.BeginDate !== existingUser.BeginDate
				 || terminalUser.EndDate !== existingUser.EndDate
				 || terminalUser.IsActive !== existingUser.IsActive) {
					willUpdate.push(terminalUser);
				}
			} else {
				willCreate.push(terminalUser);
			}
		});

		// --------------------------- make requests ---------------------------
		if (willCreate.length) {
			let payload = [];
			willCreate.forEach(item => {
				payload.push({
					UserId: item.UserId,
					TerminalId: this.pageID,
					BeginDate: item.BeginDate,
					EndDate: item.EndDate,
					IsActive: item.IsActive
				});
			});
			this.terminalUserService.setCustomEndpoint('PostAll');
			this.terminalUserService.create(payload).subscribe(
				response => {
					this.promises.createFinished = true;
					this.saveFinished();
				},
				error => {
					console.log('error : ', error);
					this.notificationService.add({type: 'danger', text: 'Terminal güncellenirken bir hata oluştu.'});
				}
			);
		} else {
			this.promises.createFinished = true;
			this.saveFinished();
		}

		if (willUpdate.length > 0) {
			let payload = [];
			willUpdate.forEach(item => {
				payload.push({
					UserId: item.UserId,
					TerminalId: this.pageID,
					BeginDate: item.BeginDate,
					EndDate: item.EndDate,
					IsActive: item.IsActive
				});
			});

			this.terminalUserService.setCustomEndpoint('PutAll');
			this.terminalUserService.update(payload, 'put').subscribe(
				response => {
					this.promises.updateFinished = true;
					this.saveFinished();
				}, error => {
					this.notificationService.add({type: 'danger', text: 'Terminal güncellenirken bir hata oluştu.'});
					console.log(JSON.stringify(error));
				}
			);
		} else {
			this.promises.updateFinished = true;
			this.saveFinished();
		}
		// ---------------------------------------------------------------------
	}

	saveFinished() {
		if (this.promises.createFinished && this.promises.updateFinished) {
			this.isLoading = false;
			if (this.isEditMode) {
				this.notificationService.add({type: 'success', text: 'Terminal Başarı ile Güncellendi.'});
				this.router.navigate(['/terminals']);
			} else {
				this.notificationService.add({type: 'success', text: 'Yeni Terminal Başarı ile oluşturuldu.'});
				this.router.navigate(['/terminal', this.pageID, 'edit'], { queryParams: { 'refresh': 1 } });
			}
		}
	}

	exit(event) {
		this.router.navigate(['terminals']);
	}


}
