import { Component, OnInit, HostBinding, HostListener, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

// import { Terminal } from './../../../../models/terminal';
import { NotificationService } from './../../../../services/notification.service';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { WizardHeaderComponent } from './../../../common-module/components/wizard-header/wizard-header.component';
import { EntityService } from './../../../../services/entity.service';
import { GenericDataService } from './../../../../services/generic-data.service';


@Component({
	selector: 'app-add-sales-sub-channel-terminal',
	templateUrl: './add-sales-sub-channel-terminal.component.html',
	styleUrls: ['./add-sales-sub-channel-terminal.component.scss'],
	providers: [GenericDataService]
})
export class AddSalesSubChannelTerminalComponent implements OnInit {
	@ViewChild(WizardHeaderComponent) wizardHeader: WizardHeaderComponent;

	@HostListener('keyup.enter') enterHandler(){
		this.submitClickHandler(null);
	};

	@Input() title: string;
	@Input() isEditMode: boolean = false;
	@Input() salesSubChannelTerminal;
	@Input() salesSubChannel;
	@Input() existingTerminals;

	@Input() set terminal(terminal) {
		if(this.salesSubChannelTerminal) {
			this.salesSubChannelTerminal.TerminalId = terminal.Id;
			this.salesSubChannelTerminal.Terminal = terminal;
		}
	};
	get terminal() { return this.salesSubChannelTerminal ? this.salesSubChannelTerminal.Terminal : null };

	currentLevel: { key: string, title: string, hasScroll?: boolean, historyIsActive?: boolean, params?:any };
	currentLevelIndex: number = 0;
	levels: { key: string, title: string, hasScroll?: boolean, historyIsActive?: boolean, params?:any }[];

	@Input() terminalSelectSearchResults: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?:any}[] }[]>;

	isLoading: boolean;
	isPromising: boolean;
	today = new Date();

	public validation: {
		Terminal: { isValid: any, message: string },
		Settings: { isValid: any, message: string }
	} = {
		Terminal: {
			message: "Terminal seçimi zorunludur",
			isValid(): boolean {
				return this.salesSubChannelTerminal && this.salesSubChannelTerminal.Terminal;
			}
		},
		Settings: {
			message: "Zorunlu ayarlar doldurulmalıdır",
			isValid(): boolean {
				return this.currentLevel.key == "terminalSettings" ? this.salesSubChannelTerminal && this.salesSubChannelTerminal.BeginDate && this.salesSubChannelTerminal.EndDate : true;
			}
		}
	};

	public get isValid():boolean {
		if( this.validation
			&& this.validation.Terminal.isValid.call(this)
			&& this.validation.Settings.isValid.call(this)
		) {
			return true;
		} else {
			return false
		}
	};

	constructor(
		public changeDetector: ChangeDetectorRef,
		public tetherService: TetherDialog,
		private notificationService: NotificationService,
		private terminalService: EntityService,
		private salesSubChannelTerminalService: GenericDataService,
	) {
		this.salesSubChannelTerminalService.setEndpoint('CSalesSubChannelTerminal');
	}

	ngOnInit() {
		this.isEditMode = this.salesSubChannelTerminal != null;

		this.levels = [];
		this.levels.push({key: "terminalSelect", title: "TERMİNAL ARAYIN", hasScroll: false, historyIsActive: true, params: {}});
		this.levels.push({key: "terminalSettings", title: "TERMİNAL AYARLARI", hasScroll: true, historyIsActive: !this.isEditMode, params: {}});

		if(this.isEditMode) {
			if(!this.title) this.title = "Terminal Ayarları";
		} else {
			if(!this.title) this.title = "Terminal Ekle";
			this.salesSubChannelTerminal = {
				Terminal: null,
				BeginDate: null,
				EndDate: null,
				IsActive: false
			}

			this.terminalService.setCustomEndpoint("GetAll");
			this.terminalService.data.subscribe( terminals => {
				if(terminals) {
					let result:{}[] = [];
					terminals.forEach(terminal => {
						result.push({
							id: terminal["Id"],
							title: terminal["Name"],
							icon: "memory",
							// disabled: terminal["TerminalId"] != null,
							params: {terminal: terminal}
						})
					});

					this.terminalSelectSearchResults = Observable.of([{
						title: "ARAMA SONUÇLARI",
						list: result
					}]);
					this.isPromising = false;
				}
			});
		}

		this.gotoLevel(this.isEditMode ? 1 : 0);
		this.changeDetector.detectChanges();
	}

	wizardActionHandler(event:{action: string, params?: any}) {
		switch(event.action) {
			case "goBack":
				this.previousLevel();
				break;
		}
	}

	inputChangeHandler(event:any, name:string, target?:any) {
		target ? target[name] = event : this.salesSubChannelTerminal[name] = event;
	}

	levelHandler(event) {
		if(event.nextLevel == true) {
			this.nextLevel();
		}
	}

	nextLevel() {
		this.gotoLevel(Math.min(this.currentLevelIndex + 1, this.levels.length-1));
	}

	previousLevel() {
		this.gotoLevel(Math.max(this.currentLevelIndex - 1, 0));
		// if(this.currentLevelIndex == 0 || this.currentLevelIndex == 2) {}
	}

	gotoLevel(key: any) {
		let self = this;
		if(Number.isInteger(key)) {
			this.currentLevelIndex = key;
		} else {
			this.levels.forEach(function(item, index){
				if(item.key == key) {
					self.currentLevelIndex = index;
					return;
				}
			});
		}
		let targetLevel = this.levels[this.currentLevelIndex];
		if(targetLevel != this.currentLevel) {
			this.currentLevel = targetLevel;
		}

		switch (this.currentLevel.key) {
			case "terminalSelect":
				this.currentLevel.params.helperText = null;
				break;
			case "terminalSettings":
			if(this.terminal) this.currentLevel.params.helperText = `<b>${this.terminal.Name}</b> terminalinin ayarlarını yapıyorsunuz.`
				break;
		}
		setTimeout(function() {

		}, 150);

		this.tetherService.position();
		this.changeDetector.detectChanges();
	}

	terminalSelectSearchHandler(event) {
		this.isPromising = true;
		this.terminalService
			.fromEntity('CTerminal')
			.search('Name', event)
			.take(100)
			.page(0)
			.executeQuery();
	}

	terminalSelectResultHandler(event) {
		this.terminal = event.params.terminal;
	}

	terminalSelectActionHandler(event) {
	}

	terminalSelectDismissHandler(event) {
	}

	submitClickHandler(event){
		if(!this.currentLevel || !this.isValid) return;

		switch(this.currentLevel.key) {
			case "terminalSelect":
				this.nextLevel();
				break;
			case "terminalSettings":
				// ------------------------ fix payload ------------------------
				// delete this.salesSubChannelTerminal['Terminal'];
				// this.salesSubChannelTerminal['salesSubChannelId'] = this.salesSubChannel.Id;
				// -------------------------------------------------------------
				this.salesSubChannelTerminalService.setCustomEndpoint(`${this.salesSubChannel.Id}/${this.salesSubChannelTerminal.TerminalId}`)

				let existingTerminal = this.existingTerminals.find(u => u.TerminalId === this.salesSubChannelTerminal.TerminalId);

				let payload = {
					BeginDate: this.salesSubChannelTerminal.BeginDate,
					EndDate: this.salesSubChannelTerminal.EndDate,
					IsActive: this.salesSubChannelTerminal.IsActive,
					TerminalId: this.salesSubChannelTerminal.TerminalId,
					salesSubChannelId: this.salesSubChannel.Id
				}

				if (this.isEditMode || existingTerminal) {

					this.salesSubChannelTerminalService.update(payload).subscribe(
						result=>{
							this.isLoading = false;
							this.tetherService.close({action: "update"});
						},
						error =>{
							if (error && error['ErrorCode'] && error['ErrorCode'] === 'GNL0020') {
								this.notificationService.add({
									type: 'danger', 
									text: 'Bir terminal aynı anda yalnızca tek bir aktif alt satış kanalına eklenebilir.'
								});
							} else {
								this.notificationService.add({type: 'danger', text: error.Message});
							}
							// GNL0020
							this.isLoading = false;
						});
				} else {
					this.salesSubChannelTerminalService.save(payload).subscribe(
						result=> {
							this.isLoading = false;
							this.tetherService.close({action: "create"});
						},
						error=> {
							if (error && error['ErrorCode'] && error['ErrorCode'] === 'GNL0019') {
								this.notificationService.add({
									type: 'danger',
									text: 'Bir terminal aynı anda yalnızca tek bir aktif alt satış kanalına eklenebilir.'
								});
							} else {
								this.notificationService.add({type: 'danger', text: error.Message});
							}
							this.isLoading = false;
						}
					);
				}
				break;
			default:
				this.nextLevel();
				break;
		}
	}
}
