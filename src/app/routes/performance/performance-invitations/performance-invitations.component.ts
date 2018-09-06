import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { ContextMenuComponent } from './../../../modules/common-module/components/context-menu/context-menu.component';
import { AddInvitationComponent } from './../../../modules/backstage-module/common/add-invitation/add-invitation.component';
import { CustomerSeatCapacityEditorComponent } from './../../../modules/common-module/common/customer-seat-capacity-editor/customer-seat-capacity-editor.component';
import { Performance } from './../../../models/performance';
import { Component, OnInit, HostBinding, Injector, ComponentRef, ComponentFactoryResolver, Inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EntityService } from '../../../services/entity.service';
import { ReservationService } from '../../../services/reservation.service';
import { NotificationService } from '../../../services/notification.service';
import { InvitationType } from '../../../models/invitation-type.enum';
import { PerformanceStatus } from '../../../models/performance-status.enum';
import { RsvpType } from '../../../models/rsvp-type.enum';
import { SeatStatus } from "../../../models/seat-status.enum";

@Component({
	selector: 'app-performance-invitations',
	templateUrl: './performance-invitations.component.html',
	styleUrls: ['./performance-invitations.component.scss'],
	entryComponents: [ContextMenuComponent,AddInvitationComponent,CustomerSeatCapacityEditorComponent],
	providers:[
		EntityService, ReservationService,
		{provide: 'performanceEntityService', useClass: EntityService },
		{provide: 'entityServiceInstance1', useClass: EntityService },
		{provide: 'entityServiceInstance2', useClass: EntityService },
		{provide: 'entityServiceInstance3', useClass: EntityService },
		{provide: 'entityServiceInstance4', useClass: EntityService },
		{provide: 'entityServiceInstance5', useClass: EntityService },
	],
	changeDetection: ChangeDetectionStrategy.Default
})
export class PerformanceInvitationsComponent implements OnInit {
	subscription;
	errorMessage: any;
	invitationStatus = InvitationType;
	PerformanceStatus = PerformanceStatus;

	totalCapacity: number = 0;
	openCapacity: number = 0;

	SponsorInvitationCount: number = 0;
	IndividualInvitationCount: number = 0;
	TargetGroupInvitationCount: number = 0;

	invitations = [];
	count: number;

	pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
	pageSize: number = this.pageSizes[0]['value'];
	currentPage: number = 1;

	isLoading: boolean = false;
	noDataInContent: boolean = true;
	query;
	performanceId: number;
	performance: Performance;

	addInvitationBox: any;
	customerSeatCapacityEditor: CustomerSeatCapacityEditorComponent

	rsvpCreateData: {
		RsvpName: string,
		RsvpType: number,
		IsRsvp: boolean,
		RsvpCode?: string,
		PerformanceId: number,
		ProductId: number,
		Description: string,
		Count: number,
		Capacity: number,
		TicketPerUser: number,
		ExpirationType: number,
		ExpirationTime: number,
		IsBestAvailable: boolean,
		People?: {
			CrmMemberId: number,
			Phone: string,
			FirstName: string,
			LastName: string,
			Email: string
		}[],
		Seats?: {
			SeatId: number,
			RowId?: number,
			TargetSeatStatus?: number,
			PriceActionId?: number
		}[];
	}

	constructor(
		private entityService: EntityService,
		private route: ActivatedRoute,
		@Inject('performanceEntityService') private performanceEntityService: EntityService,
		@Inject('entityServiceInstance1') private capacityService: EntityService,
		@Inject('entityServiceInstance2') private OpenCapacityService: EntityService,
		@Inject('entityServiceInstance3') private SponsorInvitationService: EntityService,
		@Inject('entityServiceInstance4') private IndividualInvitationService: EntityService,
		@Inject('entityServiceInstance5') private TargetGroupInvitationService: EntityService,
		private reservationService: ReservationService,
		private notificationService: NotificationService,
		private resolver: ComponentFactoryResolver,
		private injector: Injector,
		private changeDetector: ChangeDetectorRef,
		public tetherService: TetherDialog,
	) {
		this.changePageSize(this.pageSize);
		this.entityService.setCustomEndpoint('GetAll');
	}

	ngOnInit() {
		this.subscription = this.route.parent.params.subscribe(params => {
			this.performanceId = parseInt(params["id"]);
			this.isLoading = true;
			this.performanceEntityService.data.subscribe( entities => {
				if(entities && entities[0]) this.performance = entities[0];
				console.log(this.performance);
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
			// this.invitations = [
			// 	{RsvpName: "Name", RsvpType: 1, Capacity: 3, Count: 4, TicketPerUser: 5},
			// 	{RsvpName: "Name", RsvpType: 2, Capacity: 3, Count: 4, TicketPerUser: 5},
			// 	{RsvpName: "Name", RsvpType: 3, Capacity: 3, Count: 4, TicketPerUser: 5},
			// ];
			this.invitations = entities;
			this.isLoading = false;
			if(this.invitations.length == 0) {
				this.noDataInContent = true;
			} else {
				this.noDataInContent = false;
			}
			this.changeDetector.detectChanges();
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

		this.SponsorInvitationService.getCount().subscribe(
			count => { this.SponsorInvitationCount = count; },
			error => this.errorMessage = <any>error
		);

		this.IndividualInvitationService.getCount().subscribe(
			count => { this.IndividualInvitationCount = count; },
			error => this.errorMessage = <any>error
		);

		this.TargetGroupInvitationService.getCount().subscribe(
			count => { this.TargetGroupInvitationCount = count; },
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
		this.query = this.entityService.fromEntity('BRsvp')
		.where('PerformanceId', '=', this.performanceId)

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

		this.SponsorInvitationService.setCustomEndpoint('GetAll');
		this.SponsorInvitationService.fromEntity('BRsvp')
		.where('PerformanceId', '=', this.performanceId)
		.and('RsvpType', '=', `cast('${this.invitationStatus['Sponsor']}', Nirvana.Shared.Enums.RsvpType)`)
		.take(1).page(0)
		.executeQuery();

		this.IndividualInvitationService.setCustomEndpoint('GetAll');
		this.IndividualInvitationService.fromEntity('BRsvp')
		.where('PerformanceId', '=', this.performanceId)
		.and('RsvpType', '=', `cast('${this.invitationStatus['Individual']}', Nirvana.Shared.Enums.RsvpType)`)
		.take(1).page(0)
		.executeQuery();

		this.TargetGroupInvitationService.setCustomEndpoint('GetAll');
		this.TargetGroupInvitationService.fromEntity('BRsvp')
		.where('PerformanceId', '=', this.performanceId)
		.and('RsvpType', '=', `cast('${this.invitationStatus['TargetGroup']}', Nirvana.Shared.Enums.RsvpType)`)
		.take(1).page(0)
		.executeQuery();

		this.transistPage(0);
	}

	onInputChange(value) {
		this.entityService.setSearch({ key: 'Code', value: value });
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

	openEventsContextMenu(e, invitation) {
		console.log(invitation);
	}

	openInvitationsMenu(event) {
		let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector);
		let instance: ContextMenuComponent = component.instance;
		instance.title = "EKLE";
        instance.data = [
            { label: 'Toplu Gönderim', action: "targetGroup"},
            { label: 'Kişiye özel davetiye', action: 'individual'},
        ];
		this.tetherService.context(component,
		{
			    overlay:{},
				target: event.target,
				attachment: "top left",
				targetAttachment: "top left",
			}
		).then(result =>  {
			switch(result['action']){
				case("targetGroup"):
					this.openInvitationBox(AddInvitationComponent.RsvpType.TargetGroup);
				break;
				case("individual"):
					this.openInvitationBox(AddInvitationComponent.RsvpType.Individual);
				break;
			}
		}).catch(reason => {
			console.log(reason);
		})

	}

	public openInvitationBox(rsvpType) {
		let component: any = this.resolver.resolveComponentFactory(AddInvitationComponent).create(this.injector);
		this.addInvitationBox = component.instance;
		this.addInvitationBox.performanceId = this.performanceId;
		this.addInvitationBox.rsvpType = rsvpType;

		this.tetherService.modal(component,{
			escapeKeyIsActive: true,
			dialog: {
				style: { maxWidth: "600px", width: "80vw", height: "55vh" }
			},
		}).then( result => {
			this.rsvpCreateData = {
				RsvpName: result["invitationOptions"]["RsvpName"],
				RsvpType: result["rsvpType"],
				IsRsvp: result["invitationOptions"]["IsRsvp"] || false,
				PerformanceId: this.performanceId,
				ProductId: result["product"] ? result["product"]["id"] : null,
				ExpirationType: result["invitationOptions"]["ExpirationType"] || 0,
				ExpirationTime: result["invitationOptions"]["ExpirationTime"] || 0,
				IsBestAvailable: result["invitationOptions"]["BestAvailable"] || false,
				Description: result["invitationOptions"]["Description"] || null,
				Count: result["invitationOptions"]["Count"] || 0,
				Capacity: result["invitationOptions"]["Capacity"] || 0,
				TicketPerUser: result["invitationOptions"]["TicketPerUser"] || 1
			};
			if(result["invitationOptions"]["BestAvailable"]){
				this.rsvpCreateData.Seats = result.seats;
				this.rsvpCreate();
			}else{
				if(result["rsvpType"] == AddInvitationComponent.RsvpType.Individual){
					result["csv"] ? this.openVenueEditor(null, RsvpType.Individual, result["csv"]) : this.openVenueEditor(result["customer"], RsvpType.Individual);
					if(!this.rsvpCreateData.Description) this.rsvpCreateData.Description = result["customer"]["FirstName"] + " " + result["customer"]["LastName"];
				}else{
					this.openVenueEditor(null, RsvpType.TargetGroup);
				}
			}
		}).catch( reason => {});
	}

	openVenueEditor(customer?:any, invitationType?: number, csv?:any) {
		let component: ComponentRef<CustomerSeatCapacityEditorComponent> = this.resolver.resolveComponentFactory(CustomerSeatCapacityEditorComponent).create(this.injector);
		this.customerSeatCapacityEditor = component.instance;
		this.customerSeatCapacityEditor.productId = this.rsvpCreateData.ProductId;
		switch(invitationType) {
			case RsvpType.Individual:
				this.customerSeatCapacityEditor.title = "Kişiye Özel Davetiye";
			break;
			case RsvpType.TargetGroup:
				this.customerSeatCapacityEditor.title = "Toplu Gönderim";
			break;
		}
		if(csv) {
			this.customerSeatCapacityEditor.csv = csv;
		}else{
			if(customer) {
				this.customerSeatCapacityEditor.maxCustomerCount = 1;
				this.customerSeatCapacityEditor.customers = [customer]
				this.customerSeatCapacityEditor.minSeatCount = this.customerSeatCapacityEditor.maxSeatCount = this.rsvpCreateData.Count;
				this.rsvpCreateData.TicketPerUser = this.rsvpCreateData.Count;
			}else {
				this.customerSeatCapacityEditor.csvAvailable = true;
				this.customerSeatCapacityEditor.matchSeatsAndCustomers = false; //this.rsvpCreateData.RsvpType == RsvpType.TargetGroup && !this.rsvpCreateData.IsRsvp;
				this.customerSeatCapacityEditor.minCustomerCount = this.rsvpCreateData.RsvpType == RsvpType.TargetGroup && !this.rsvpCreateData.IsRsvp ?  Math.floor(this.rsvpCreateData.Count / this.rsvpCreateData.TicketPerUser) : Math.floor(this.rsvpCreateData.Count / this.rsvpCreateData.TicketPerUser);
				this.customerSeatCapacityEditor.maxCustomerCount = this.rsvpCreateData.RsvpType == RsvpType.TargetGroup && !this.rsvpCreateData.IsRsvp ?  Math.floor(this.rsvpCreateData.Count / this.rsvpCreateData.TicketPerUser) : 0;
				this.customerSeatCapacityEditor.minSeatCount = this.customerSeatCapacityEditor.maxSeatCount = this.rsvpCreateData.Count;
			}
		}
		
		this.tetherService.content(component).then( result => {
			this.rsvpCreateData.Seats = [];
			result.seats.forEach( item => this.rsvpCreateData.Seats.push({
				SeatId: item["name"],
				RowId: item.params.seat["RowId"],
				TargetSeatStatus: item.params.seat["Status"]
			}));
			//todo temprory data
			this.rsvpCreateData.Capacity = this.rsvpCreateData.Seats.length;
			this.rsvpCreateData.Count = this.rsvpCreateData.Seats.length;
			if(result.customers) {
				this.rsvpCreateData.People = [];
				result.customers.forEach( item => {
					this.rsvpCreateData.People.push({
						CrmMemberId: item["MemberId"],
						FirstName: item["Name"],
						LastName: item["Surname"],
						Email: item["Email"],
						Phone: item["PhoneNumber"]
					});
				});
			}
			this.rsvpCreate();
		}).catch( reason => {});
	}

	rsvpCreate(){
		this.isLoading = true;
		//todo burası düzenlenmeli
		this.reservationService.setCustomEndpoint(`RsvpCreate`, true);
		this.reservationService.create(this.rsvpCreateData).subscribe( result => {
			this.isLoading = false;
			this.notificationService.add( {type: 'success', text: "Davetiye başarıyla oluşturuldu"});
			this.resetQueries();
		}, error => {
			this.isLoading = false;
			this.notificationService.add( {type: 'danger', text: "Davetiye kaydı yapılamadı: " + error.Message});
		})
	}

}
