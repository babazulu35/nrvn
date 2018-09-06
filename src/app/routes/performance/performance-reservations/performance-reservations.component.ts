import { AddReservationComponent } from './../../../modules/backstage-module/common/add-reservation/add-reservation.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { ContextMenuComponent } from './../../../modules/common-module/components/context-menu/context-menu.component';
import { CustomerSeatCapacityEditorComponent } from './../../../modules/common-module/common/customer-seat-capacity-editor/customer-seat-capacity-editor.component';
import { Component, OnInit, HostBinding, Inject, Injector, ComponentRef, ComponentFactoryResolver, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppSettingsService } from '../../../services/app-settings.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { EntityService } from '../../../services/entity.service';
import { ReservationService } from '../../../services/reservation.service';
import { NotificationService } from '../../../services/notification.service';
import { CrmMemberService } from './../../../services/crm-member.service';
import { ReservationStatus } from '../../../models/reservation-status.enum';
import { PerformanceStatus } from '../../../models/performance-status.enum';
import { Performance } from '../../../models/performance';
import { SeatStatus } from "../../../models/seat-status.enum";

@Component({
	selector: 'app-performance-reservations',
	templateUrl: './performance-reservations.component.html',
	styleUrls: ['./performance-reservations.component.scss'],
	entryComponents: [ContextMenuComponent,AddReservationComponent,CustomerSeatCapacityEditorComponent],
	providers:[
		EntityService, ReservationService, AppSettingsService, CrmMemberService,
		{provide: 'performanceEntityService', useClass: EntityService },
		{provide: 'entityServiceInstance1', useClass: EntityService },
		{provide: 'entityServiceInstance2', useClass: EntityService },
		{provide: 'entityServiceInstance3', useClass: EntityService },
		{provide: 'entityServiceInstance4', useClass: EntityService },
		{provide: 'entityServiceInstance5', useClass: EntityService },
	],
	changeDetection: ChangeDetectionStrategy.Default
})
export class PerformanceReservationsComponent implements OnInit {
	subscription;
	errorMessage: any;
	reservationStatus = ReservationStatus;
	PerformanceStatus = PerformanceStatus;

	totalCapacity: number = 0;
	openCapacity: number = 0;

	openReservationCount: number = 0;
	CancelledReservationCount: number = 0;
	ExpiredReservationCount: number = 0;

	reservations = [];
	count: number;
	selectedItems: Array<Object> = [];
	isAllSelected: boolean = false;

	pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
	pageSize: number = this.pageSizes[0]['value'];
	currentPage: number = 1;

	isLoading: boolean = false;
	noDataInContent: boolean = true;
	query;
	performanceId: number;
	performance: Performance;

	addreservationBox: AddReservationComponent;
	customerSeatCapacityEditor: CustomerSeatCapacityEditorComponent

	createPromoterReservationData: {
		PerformanceId: number,
		ProductId: number,
		ExpirationType: number,
		ExpirationTime: number,
		MemberId?: number,
		IsBestAvailable?: boolean,
		CrmAnonymousUser?: {
			PhoneNumber: string,
			Name: string,
			Surname: string,
			Email: string
		},
		Seats?: {
			Id: number,
			RowId?: number,
			SeatStatus?: number
		}[]
	}

	reservationDelayTimes: any[];
	actionButtons = [
		{label: 'Ertele', icon: 'timelapse', action: 'delay'},
		{label: 'İptal Et', icon: 'cancel', action: 'cancel'}
	];
	multiselectionContextMenuData: any[];
	contextMenuData: any[];

	constructor(
		private resolver: ComponentFactoryResolver,
		private injector: Injector,
		public tetherService: TetherDialog,
		private route: ActivatedRoute,
		private router: Router,
		private notificationService: NotificationService,
		private appSettings: AppSettingsService,
		private entityService: EntityService,
		private reservationService: ReservationService,
		private authenticationService: AuthenticationService,
		private crmMemberService: CrmMemberService,
		@Inject('performanceEntityService') private performanceEntityService: EntityService,
		@Inject('entityServiceInstance1') private capacityService: EntityService,
		@Inject('entityServiceInstance2') private OpenCapacityService: EntityService,
		@Inject('entityServiceInstance3') private OpenReservationService: EntityService,
		@Inject('entityServiceInstance4') private CancelledReservationService: EntityService,
		@Inject('entityServiceInstance5') private ExpiredReservationService: EntityService,
		// @Inject('instance2') _pearEditorService: EntityService
	) {
		this.changePageSize(this.pageSize);
		this.crmMemberService.setCustomEndpoint('GetAll', true);
	}

	ngOnInit() {

		this.reservationDelayTimes = this.appSettings.getLocalSettings('reservationDelayTimes');
		this.contextMenuData = [];
		this.multiselectionContextMenuData = [];
		this.reservationDelayTimes.forEach(i => {
			this.multiselectionContextMenuData.push({action: 'delay', icon: 'timelapse', label: i.label, delayTime: i.time})
		});
		this.contextMenuData = this.multiselectionContextMenuData.map(i => Object.assign({}, i));
		this.contextMenuData.push({ label: 'İptal Et', icon: 'cancel', action: 'cancel', type: 'aside'});

		this.subscription = this.route.parent.params.subscribe(params => {
			this.performanceId = parseInt(params["id"]);
			this.isLoading = true;
			this.performanceEntityService.data.subscribe( entities => {
				if(entities && entities[0]) this.performance = entities[0];
			});
			this.performanceEntityService.setCustomEndpoint("GetAll");
			this.performanceEntityService
				.fromEntity('EPerformance')
				.where('Id', '=',  this.performanceId)
				.take(1)
				.page(0)
				.executeQuery();
			this.resetQueries();
		});

		this.subscription = this.entityService.queryParamSubject.subscribe(
			params => {
				this.isLoading = true;
				this.updateLocalParams(params);

				let sort = params["sort"] ? (typeof params["sort"] == 'string'  ? JSON.parse(params["sort"]) : params["sort"]) : null;
				let query = this.query
				.take(params['pageSize'])
				.page(params['page']);

				if(sort && sort[0]){
					query.orderBy(sort[0]["sortBy"],sort[0]["type"])
				}
				if(params["search"]){
					query.search(params["search"]["key"], params["search"]["value"]);
				}
				query.executeQuery();
			},
			error => this.errorMessage = <any>error
		);

		this.entityService.data.subscribe(entities => {
			this.reservations = entities;

			// -------------- get member info ----------------------------------
			this.reservations.forEach(item=>{
				let MemberId = item['CrmMemberId'] || item['CrmAnonymousUserId']

				if (item['CrmMemberId']) {
					this.getMemberInfo(item['CrmMemberId'], item);
				} else if(item['CrmAnonymousUser']) {
					let response = item['CrmAnonymousUser'];
					if (response['CrmMemberId']) {
						this.getMemberInfo(response['CrmMemberId'], item);
					} else {
						item.memberInfo = {
							Name: response.FirstName,
							Surname: response.LastName,
							Phone: response.PhoneNumber,
							Email: response.Email,
							Address: "",
						}
					}
				}
			});
			// -----------------------------------------------------------------

			this.isLoading = false;
			this.noDataInContent = this.reservations.length == 0;
		});

		this.entityService.getCount().subscribe(
			count => { this.count = count; },
			error => this.errorMessage = <any>error
		);

		this.capacityService.getCount().subscribe(
			count => { this.totalCapacity = count; },
			error => this.errorMessage = <any>error
		);

		this.OpenCapacityService.getCount().subscribe(
			count => { this.openCapacity = count; },
			error => this.errorMessage = <any>error
		);

		this.OpenReservationService.getCount().subscribe(
			count => { this.openReservationCount = count; },
			error => this.errorMessage = <any>error
		);

		this.CancelledReservationService.getCount().subscribe(
			count => { this.CancelledReservationCount = count; },
			error => this.errorMessage = <any>error
		);

		this.ExpiredReservationService.getCount().subscribe(
			count => { this.ExpiredReservationCount = count; },
			error => this.errorMessage = <any>error
		);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	updateLocalParams(params: Object = {}) {
		this.currentPage = params['page'] ? params['page'] : 1;
		this.pageSize = params['pageSize'] ? params['pageSize'] : this.pageSizes[0]['value'];
	}

	resetQueries(){
		this.isLoading = true;
		this.entityService.setCustomEndpoint('GetAll');
		this.query = this.entityService.fromEntity('BReservation')
		.where('PerformanceId', '=', this.performanceId)
		.and('Type', '=', "cast('2', Nirvana.Shared.Enums.ReservationType)")
		.expand(['CrmAnonymousUser'])
		.expand(['RsvpItem']);
		// .expand(['Performance'])

		this.capacityService.setCustomEndpoint('GetAll');
		this.capacityService.fromEntity('EVenueSeat')
		.where('VenueRow/PerformanceId', '=', this.performanceId)
		.and('Status', '!=', SeatStatus.Deleted, 'SeatStatus')
		.and('Status', '!=', SeatStatus.Failed, 'SeatStatus')
		.take(1).page(0)
		.executeQuery();

		this.OpenCapacityService.setCustomEndpoint('GetAll');
		this.OpenCapacityService.fromEntity('EVenueSeat')
		.where('VenueRow/PerformanceId', '=', this.performanceId)
		.and('Status', '=', "cast('1', Nirvana.Shared.Enums.SeatStatus)")
		.take(1).page(0)
		.executeQuery();

		this.OpenReservationService.setCustomEndpoint('GetAll');
		this.OpenReservationService.fromEntity('BReservation')
		.where('PerformanceId', '=', this.performanceId)
		.and('Status', '=', `cast('${this.reservationStatus['Open']}', Nirvana.Shared.Enums.ReservationStatus)`)
		.take(1).page(0)
		.executeQuery();

		this.CancelledReservationService.setCustomEndpoint('GetAll');
		this.CancelledReservationService.fromEntity('BReservation')
		.where('PerformanceId', '=', this.performanceId)
		.and('Status', '=', `cast('${this.reservationStatus['Cancelled']}', Nirvana.Shared.Enums.ReservationStatus)`)
		.take(1).page(0)
		.executeQuery();

		this.ExpiredReservationService.setCustomEndpoint('GetAll');
		this.ExpiredReservationService.fromEntity('BReservation')
		.where('PerformanceId', '=', this.performanceId)
		.and('Status', '=', `cast('${this.reservationStatus['Expired']}', Nirvana.Shared.Enums.ReservationStatus)`)
		.take(1).page(0)
		.executeQuery();

		this.transistPage(0);
	}

	getMemberInfo(memberId, item) {
		this.crmMemberService.fromEntity('Member')
			.where('Id', '=', memberId)
			.expand(['MemberEmails'])
			.expand(['MemberAddresses'])
			.expand(['MemberPhones'])
			// .filterOnExpand('IsDefault', '=', true, 0)
			// .filterOnExpand('IsDefault', '=', true, 1)
			.take(1).page(0).executeQuery().subscribe(resp=>{
				if (resp && resp.Status && resp.EntityModel.Items.length > 0) {
					let info = resp.EntityModel.Items[0];

					item.memberInfo = {
						Name: info.Name,
						Surname: info.Surname,
						Phone: "",
						Email: "",
						Address: "",
					}

					if(info.MemberPhones && info.MemberPhones.length > 0){
						item.memberInfo.Phone = info.MemberPhones[0].PhoneNumber;
					}

					if(info.MemberEmails && info.MemberEmails.length > 0){
						item.memberInfo.Email = info.MemberEmails[0].EmailAddress;
					}

					if(info.MemberAddresses && info.MemberAddresses.length > 0){
						item.memberInfo.Address = info.MemberAddresses[0].FullAddress;
					}
				}
			}, error => this.errorMessage = <any>error);
	}

	selectAllItems(selectAll: boolean): void {
		if (selectAll && this.selectedItems.length < this.reservations.length) {
			this.selectedItems = [];
			this.reservations.forEach(item => {
				this.selectedItems.push(item);
			});
			this.isAllSelected = true;
		}
		if (!selectAll) {
			this.isAllSelected = false;
			this.selectedItems = [];
		}
	}

	selectItem(isSelected: boolean, reservation: Event): void {
		if (isSelected) {
			this.selectedItems.push(reservation);
		} else {
			let selectedEvent = this.selectedItems.filter(item => {
				return (reservation === item);
			})[0];
			this.selectedItems.splice(this.selectedItems.indexOf(selectedEvent), 1);
		}
	}

	get isMultiSelectionActive(): boolean {
		return this.selectedItems.length > 0;
	}

	callSelectedItemsAction(action) {
		switch (action) {
			case 'delay':
				this.openEventsContextMenu(action, this.selectedItems, true);
				break;
			case 'cancel':
				this.cancelReservation(this.selectedItems);
				break;
			default:
				break;
		}
	}

	onInputChange(value) {
		this.entityService.setSearch({ key: 'UserId', value: value });
	}

	toggleSortTitle(sort) {
		if(sort){
			this.entityService.setOrder(sort, true);
		} else {
			this.entityService.flushOrder();
		}
	}

	changePageSize(pageSize) {
		this.entityService.setPageSize(pageSize);
	}

	transistPage(page) {
		this.entityService.setPage(page);
	}

	cancelReservation(reservations) {
		reservations = reservations.filter(r => r.Status !== this.reservationStatus['Cancelled']);
		if (reservations.length === 0) {
			this.notificationService.add({text: 'Seçili rezervasyonlar iptal edilmiş.', type: 'danger'});
			return;
		}
		this.isLoading = true;
		this.reservationService.flushCustomEndpoint();
		this.reservationService.setCustomEndpoint('ReservationCancel', true);

		for (let i = 0; i < reservations.length; i++) {
			this.reservationService.create({ReservationCode: reservations[i].Code}).subscribe(
				response => {
					if (i === reservations.length - 1) {
						this.entityService.reload();
						this.notificationService.add({text: 'Rezervasyon İptal edildi.', type: 'success'});
						this.selectedItems = [];
						this.isLoading = false;
					}
				},
				error => {
					this.notificationService.add({text: error['Message'], type: 'danger'});
					this.isLoading = false;
					i = reservations.length;
				}
			);
		}
	}

	delayReservation(reservations, result) {
		reservations = reservations.filter(r => r.Status !== this.reservationStatus['Cancelled']);
		if (reservations.length === 0) {
			this.notificationService.add({text: 'İptal edilmiş rezervasyonun tarihi ertelenemez.', type: 'danger'});
			return;
		}

		this.isLoading = true;

		let willDelay = [];
		let delayTime = result['delayTime'] * 60 * 60 * 1000;

		reservations.forEach(r => {
			let expDate = new Date(r.ExpirationDate).getTime() + delayTime;
			let time = new Date(expDate).toISOString();
			willDelay.push({
				Id: r.Id,
				ExpirationDate: time
			});
		});

		this.reservationService.flushCustomEndpoint();
		this.reservationService.setCustomEndpoint('PatchAll');
		this.reservationService.update(willDelay).subscribe(
			response => {
				this.notificationService.add({text: 'Rezervasyon Ertelendi.', type: 'success'});
				 this.entityService.reload();
				 this.selectedItems = [];
				 this.isLoading = false;
			},
			error => {
				this.notificationService.add({text: error['Message'], type: 'danger'});
				this.isLoading = false;
			}
		);
	}

	openEventsContextMenu(e, reservations, isMultiSelectionBar = false) {
		let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector);
		let instance: ContextMenuComponent = component.instance;

		instance.title = "REZERVASYON İŞLEMLERİ";
		instance.data = isMultiSelectionBar ? this.multiselectionContextMenuData : this.contextMenuData;

		this.tetherService.context(component,
			{
				overlay:{},
				target: event.target,
				attachment: "top right",
				targetAttachment: "top right",
			}
		).then(result => {
			if (result) {
				switch (result['action']) {
					case "cancel":
					if (!isMultiSelectionBar) reservations = [reservations];
						this.cancelReservation(reservations);
						break;
					case "delay":
					if (!isMultiSelectionBar) reservations = [reservations];
						this.delayReservation(reservations, result);
						break;
				}
			}
		}).catch(reason => {
			console.log("dismiss reason : ", reason);
		});
	}

  public openReservationModal() {
    let component: ComponentRef<AddReservationComponent> = this.resolver.resolveComponentFactory(AddReservationComponent).create(this.injector);
    this.addreservationBox = component.instance;
	this.addreservationBox.performanceId = this.performanceId;

    this.tetherService.modal(component,{
      escapeKeyIsActive: true,
      dialog: {
          style: { maxWidth: "600px", width: "80vw", height: "55vh" }
      },
    }).then( result => {
		this.createPromoterReservationData = {
			PerformanceId: this.performanceId,
			ProductId: result["product"] ? result["product"]["id"] : null,
			ExpirationType: result["reservationOptions"]["ExpirationType"] ? result["reservationOptions"]["ExpirationType"] : 0,
			ExpirationTime: result["reservationOptions"]["ExpirationTime"] ? result["reservationOptions"]["ExpirationTime"] : 0,
			MemberId: result["customer"]["MemberId"] ? result["customer"]["MemberId"] : null,
			IsBestAvailable: result["reservationOptions"]["BestAvailable"] ? result["reservationOptions"]["BestAvailable"] : false,
			CrmAnonymousUser: result["customer"]["MemberId"]  ? null : {
				PhoneNumber: result["customer"]["PhoneNumber"],
				Name: result["customer"]["Name"],
				Surname: result["customer"]["Surname"],
				Email: result["customer"]["Email"]
			}
		};
		if(result["reservationOptions"]["BestAvailable"]){
			this.reservationService.create({
				PerformanceId: this.performanceId,
				SeatCount: result["reservationOptions"]["Count"]
			}).subscribe(
			result => {
				this.createPromoterReservationData.Seats = result.seats;
				this.createPromoterReservation();
			}, error => {
				console.log(error);
			});
		}else{
			this.openVenueEditor(result["customer"], result["reservationOptions"]["Count"]);
		}
	}).catch( reason => {});
  }

	openVenueEditor(customer?:any, capacity?:number) {
		let component: ComponentRef<CustomerSeatCapacityEditorComponent> = this.resolver.resolveComponentFactory(CustomerSeatCapacityEditorComponent).create(this.injector);
		this.customerSeatCapacityEditor = component.instance;
		this.customerSeatCapacityEditor.productId = this.createPromoterReservationData.ProductId;
		this.customerSeatCapacityEditor.customers = [customer]
		this.customerSeatCapacityEditor.title = "Rezervasyon";
		this.customerSeatCapacityEditor.maxCustomerCount = 1;
		this.customerSeatCapacityEditor.minSeatCount = this.customerSeatCapacityEditor.maxSeatCount = capacity || 1;

		this.tetherService.content(component).then( result => {
			// Update Seats -------------
			this.createPromoterReservationData.Seats = [];
			result.seats.forEach(item => this.createPromoterReservationData.Seats.push({Id: item["name"], RowId: item["params"]["seat"]["RowId"], SeatStatus: item["params"]["seat"]["Status"]}));
			// --------------------------

			// Update Customers ---------
			if (result.customers && result.customers.length) {
				let customer = result.customers[0];
				this.createPromoterReservationData.MemberId = customer["MemberId"] ? customer["MemberId"] : null;
				this.createPromoterReservationData.CrmAnonymousUser = customer["MemberId"]  ? null : {
					PhoneNumber: customer["PhoneNumber"],
					Name: customer["Name"],
					Surname: customer["Surname"],
					Email: customer["Email"]
				}
			}
			// --------------------------

			this.createPromoterReservation();
		}).catch( reason => {});
	}

	createPromoterReservation(){
		//if(this.createPromoterReservationData.MemberId) this.createPromoterReservationData.CrmAnonymousUser = null;
		this.isLoading = true;
		//todo burası düzenlenmeli
		this.reservationService.setCustomEndpoint(`CreatePromoterReservation`, true);
		this.reservationService.create(this.createPromoterReservationData).subscribe( result => {
			this.isLoading = false;
			this.notificationService.add( {type: 'success', text: "Rezervasyon başarıyla kaydedildi"});
			this.resetQueries();
		}, error => {
			this.isLoading = false;
			this.notificationService.add( {type: 'danger', text: "Rezervasyon kaydı yapılamadı"});
		});
	}
}
