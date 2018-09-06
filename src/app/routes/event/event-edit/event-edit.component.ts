import { ModalSearchBoxComponent } from './../../../modules/common-module/components/modal-search-box/modal-search-box.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { ContextMenuComponent } from './../../../modules/common-module/components/context-menu/context-menu.component';
import { AttributesSelectAddBarComponent } from './../../../modules/backstage-module/components/attributes-select-add-bar/attributes-select-add-bar.component';
import { PerformanceSearchSelectComponent } from './../../../modules/backstage-module/components/performance-search-select/performance-search-select.component';
import { MultiSelectGroupComponent } from './../../../modules/common-module/components/multi-select-group/multi-select-group.component';
import { EventSearchSelectComponent } from './../../../modules/backstage-module/components/event-search-select/event-search-select.component';
import { PerformanceService } from './../../../services/performance.service';
import { EntityTypeService } from './../../../services/entity-type.service';
import { EntityService } from './../../../services/entity.service';
import { AuthenticationService } from './../../../services/authentication.service';
import { User } from './../../../models/user';
import { VenuesByPerformancesPipe } from './../../../pipes/venues-by-performances.pipe';
import { Venue } from './../../../models/venue';
import { VenueService } from './../../../services/venue.service';
import { TemplateService } from './../../../services/template.service';
import { PerformanceCreateComponent } from '../../performance-create/performance-create.component';
import { EnumTranslatorPipe } from '../../../pipes/enum-translator.pipe';
import { RelativeDatePipe } from '../../../pipes/relative-date.pipe';
import { HeaderTitleService } from '../../../services/header-title.service';
import { NotificationService } from '../../../services/notification.service';
import { Firm } from '../../../models/firm';
import { EntityFirm } from '../../../models/entity-firm';
import { EntityFirmService } from '../../../services/entity-firm.service';
import { FirmService } from '../../../services/firm.service';
import { EntityAttribute } from '../../../models/entity-attribute';
import { EntityAttributeService } from '../../../services/entity-attribute.service';
import { AttributeTypeService } from '../../../services/attribute-type.service';
import { AttributeType } from '../../../models/attribute-type';
import { AttributeService } from '../../../services/attribute.service';
import { Attribute } from '../../../models/attribute';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../models/event';
import { EventStatus } from '../../../models/event-status.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { Performance } from '../../../models/performance';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { Component, OnInit, ChangeDetectorRef, ComponentFactoryResolver, Injector, ComponentRef, ViewChild,Type, ElementRef,Inject } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import { EventType } from '../../../models/event-type.enum';


@Component({
	selector: 'app-event-edit',
	templateUrl: './event-edit.component.html',
	styleUrls: ['./event-edit.component.scss'],
	entryComponents:[ModalSearchBoxComponent, ContextMenuComponent, PerformanceCreateComponent],
	providers: [
		{ provide: 'entityTypeEntityService', useClass: EntityService },
		{ provide: 'eventEntityService', useClass: EntityService },
		{ provide: 'performanceEntityService', useClass: EntityService },
		{ provide: 'eventsEntityService', useClass: EntityService },
		EntityTypeService, EventService, PerformanceService, AttributeTypeService, EntityAttributeService, AttributeService, FirmService, EntityFirmService]
})
export class EventEditComponent implements OnInit {
	@ViewChild(MultiSelectGroupComponent) typeSelector: MultiSelectGroupComponent;
	@ViewChild(PerformanceSearchSelectComponent) performanceSearchSelect: PerformanceSearchSelectComponent;
	@ViewChild('markdown') textarea: ElementRef;
	@ViewChild(EventSearchSelectComponent) eventSearchSelect: EventSearchSelectComponent;

	user: User;
	entityTypeId: number;
	promoterId:number;
	event: Event;

	events: Event[];

	performances: Performance[];
	performanceSubscription: any;

	attributeTypes: {name:string, label: string, params:{attributeType: AttributeType}}[];
	attributes: {name: string, label: string, type:{name: string}, params: {attribute: Attribute}}[] = [];

	sponsors: {id: any, name: string, type?: any, params?: any}[];
	promoters: {id: any, name: string, type?: any, params?: any}[];

	public defaultTextAreaValue:string;

	firmPresets: {title: string, list: any[]}[];
	firmSearchResult: Observable<{title: string, list: any[]}[]>;
	firmTypes: Array<{text: string, value: any}> = [
		{ 'value': 0, text: 'Seçiniz'},
		{ 'value': 1, text: 'Ana Sponsor' },
		{ 'value': 2, text: 'Medya Sponsoru' },
		{ 'value': 3, text: 'Etkinlik Sponsoru' },
		{ 'value': 4, text: 'Alt Sponsoru' },
		{ 'value': 5, text: 'Diğer' },
	];

	salesDateRange: { begin?: {min: any, max: any}, end?: {min: any, max: any}, performancesStartDate?: any, eventsStartDate?: any, eventsEndtDate?:any } = { begin: {min: null, max: null}, end: {min: null, max: null}};
	statusList: {value: any, text: string}[];
	formattedVenues: string;
	formattedDate: string;
	onSaveComplete: any;
	relativeDatePipe: RelativeDatePipe = new RelativeDatePipe();
	role = 'create';
	isEditMode = false;
	isMainEvent = false;
	isLoading: boolean;
	isPromising: boolean;
	title: string;

	flags: {PublishDateFieldOn: boolean} = {
		PublishDateFieldOn: false
	};

	hoursRange: {value: any, text: string, disabled?: boolean} [];
	expirationTypes: {text: string, value: any}[] = [
		{ value: '-1', text: 'Seçiniz' },
		{ value: 1, text: 'Performanstan Önce' },
		{ value: 2, text: 'Rezervasyondan Sonra' }
	];

	eventTypeList: {text: string, value: EventType} [] = [
		{text: 'Varsayılan', value: EventType.Default},
		{text: 'Sinema', value: EventType.Cinema}
	];

	promises: {
		event: { name:string, old: any, new: any, saved: {performances: boolean, events: boolean, attributes: boolean, sponsors: boolean, promoters: boolean} },
		performances: { name: string, old: Performance[], new: Performance[], saved: {create: boolean, update: boolean, delete: boolean} },
		events: { name: string, old: Event[], new: Event[], saved: {create: boolean, update: boolean, delete: boolean} },
		attributes: { name: string, old: EntityAttribute[], new: EntityAttribute[], saved: {create: boolean, update: boolean, delete: boolean}  },
		sponsors: { name: string, old: EntityFirm[], new: EntityFirm[], saved: {create: boolean, update: boolean, delete: boolean} },
		promoters: { name: string, old: EntityFirm[], new: EntityFirm[], saved: {create: boolean, update: boolean, delete: boolean} } } = {

		event: { name: 'event', old: [], new: [], saved: {performances: false, events: false, attributes: false, sponsors: false, promoters: false}},
		performances: { name: 'performances', old: [], new: [], saved: {create: false, update: false, delete: false} },
		events: { name: 'events', old: [], new: [], saved: {create: false, update: false, delete: false} },
		attributes: { name: 'attributes', old: [], new: [], saved: {create: false, update: false, delete: false} },
		sponsors: { name: 'sponsors', old: [], new: [], saved: {create: false, update: false, delete: false} },
		promoters: { name: 'promoters', old: [], new: [], saved: {create: false, update: false, delete: false} }
	}

	validation: {
		EventName: { isValid: any, message: string },
		EventType: { isValid: any, message: string },
		PublishDate: { isValid: any, message: string },
		PromoterName: {isValid: any, message: string},
		IsInviteFriendAvailable: {isValid: any, message: string},
		ReservationAvailable: {isValid: any, message: string},
		ChildEvents: {isValid: any, message: string},
	} = {
		EventName: {
			message: 'Etkinlik adı zorunludur.',
			isValid(): boolean {
				return this.event && this.event.isValid('Name', true);
			}
		},
		EventType: {
			message: 'Tip seçimi zorunludur.',
			isValid():boolean {
				return this.promises && this.promises.attributes && this.promises.attributes.new && this.promises.attributes.new.length > 0;
			}
		},
		PublishDate: {
			message: 'Yayın tarihi zorunludur.',
			isValid():boolean {
				return !this.flags.PublishDateFieldOn ? true : this.event && this.event.PublishDate && moment(this.event.PublishDate).isValid();
			}
		},
		PromoterName: {
			message: 'En az bir adet organizatör eklenmelidir.',
			isValid():boolean {
				return this.promises && this.promises.promoters && this.promises.promoters.new && this.promises.promoters.new.length > 0;
			}
		},
		IsInviteFriendAvailable: {
			message: '<b>Arkadaş davet edilebilir</b> seçildi. Ancak bir süre seçimi yapılmadı!',
			isValid():boolean {
				return this.event && this.event.IsInviteFriendAvailable ?  this.event.InviteFriendExpirationTime > 0 : true;
			}
		},
		ReservationAvailable: {
			message: '<b>Rezervasyon yapılabilir</b> seçildi. Ancak bir süre seçimi yapılmadı!',
			isValid():boolean {
				return this.event && this.event.ReservationAvailable ?  this.event.ReservationExpirationTime > 0 : true;
			}
		},
		ChildEvents: {
			message: '<b>Bu bir çatı etkinlik!</b> En az bir adet etkinlik eklenmelidir!',
			isValid():boolean {
				return this.isMainEvent ? this.promises && this.promises.events && this.promises.events.new && this.promises.events.new.length > 0 : true;
			}
		}
	};

	get isValid(): boolean {
		if (this.event && this.validation
			&& this.event.Status !== 5
			// && this.event.Status != 6
			&& this.validation.EventName.isValid.call(this)
			&& this.validation.EventType.isValid.call(this)
			&& this.validation.PublishDate.isValid.call(this)
			&& this.validation.PromoterName.isValid.call(this)
			&& this.validation.IsInviteFriendAvailable.isValid.call(this)
			&& this.validation.ReservationAvailable.isValid.call(this)
			&& this.validation.ChildEvents.isValid.call(this) ) {
			return true;
		}else{
			// if(this.validation && this.event){
			// 	console.log(
			// 		this.validation.EventName.isValid.call(this),
			// 		this.validation.EventType.isValid.call(this),
			// 		this.validation.PublishDate.isValid.call(this),
			// 		this.validation.PromoterName.isValid.call(this),
			// 		this.validation.ChildEvents.isValid.call(this)
			// 	);
			// }
			return false
		}
	};

	showValidationError(): boolean {
		let hasError  = false;
		let timeout = 3000;
		if(!this.validation.IsInviteFriendAvailable.isValid.call(this)) {
			hasError = true; timeout += 2000;
			this.onErrorHandler({type: 'warning', text: this.validation.IsInviteFriendAvailable.message, timeOut: timeout});
		}
		if(!this.validation.ReservationAvailable.isValid.call(this)) {
			hasError = true; timeout += 2000;
			this.onErrorHandler({type: 'warning', text: this.validation.ReservationAvailable.message, timeOut: timeout});
		}
		return hasError;
	}

	onErrorHandler(notification: {id ?: string, isNew ?: boolean, type:string, text:string, timeOut?: number}) {
		this.notificationService.add(notification);
		this.isPromising = false;
	}

	constructor(
			@Inject('entityTypeEntityService') private entityTypeEntityService: EntityService,
			@Inject('eventEntityService') private eventEntityService: EntityService,
			@Inject('eventsEntityService') private eventsEntityService: EntityService,
			private entityTypeService: EntityTypeService,
			private eventService: EventService,
			@Inject('performanceEntityService') private performanceEntityService: EntityService,
			private performanceService: PerformanceService,
			private attributeService: AttributeService,
			private attributeTypeService: AttributeTypeService,
			private entityAttributeService: EntityAttributeService,
			private firmService: FirmService,
			private entityFirmService: EntityFirmService,

			private router: Router,
			private route: ActivatedRoute,
			private changeDetector: ChangeDetectorRef,
			private resolver: ComponentFactoryResolver,
			private injector: Injector,
			public tetherService: TetherDialog,
			private notificationService: NotificationService,
        	private headerTitleService: HeaderTitleService,
			private authenticationService: AuthenticationService
	) { }

	ngOnInit() {

		this.user = this.authenticationService.getAuthenticatedUser();
		this.role = this.route.snapshot.data['role'];
		this.isMainEvent = this.route.snapshot.data['isMainEvent'];
		this.promoterId = this.authenticationService.getAuthenticatedUser().PromoterFirmId;

		console.log("This PromoterId",this.promoterId);
		

		if (this.isMainEvent) {
			this.headerTitleService.setTitle('Etkinlik Grupları');
			this.headerTitleService.setLink('/event-groups');
		} else {
			this.headerTitleService.setTitle('Etkinlikler');
			this.headerTitleService.setLink('/events');
		}

		this.isEditMode = this.role === 'edit';
		let enumTranslatorPipe = new EnumTranslatorPipe();
		let statusKeys = Object.keys(EventStatus);
		statusKeys = statusKeys.splice(0, statusKeys.length / 2);
		this.statusList = [];
		for (let key of statusKeys){
			this.statusList.push({value: parseInt(key), text: enumTranslatorPipe.transform(EventStatus[key])});
		}

		this.entityTypeDataHandler();

		this.hoursRange = [];
		this.hoursRange.push({value: 0, text: 'Süre seçin', disabled: true});
		this.hoursRange.push({value: 4 * 60, text: '4 saat'});
		this.hoursRange.push({value: 12 * 60, text: '12 saat'});
		this.hoursRange.push({value: 24 * 60, text: '1 gün'});
		this.hoursRange.push({value: 2 * 24 * 60, text: '2 gün'});
		this.hoursRange.push({value: 4 * 24 * 60, text: '4 gün'});
		this.hoursRange.push({value: 7 * 24 * 60, text: '1 hafta'});
	}

	isValidDate(value: string):boolean {
		return moment(value).isValid();
	}

	setFormattedVenue() {
		let cityDic: {} = {};
		let cities = [];
		let city, venue;
		let formattedVenues: string[] = [];
		this.promises.performances.new.forEach( performance => {
			city = performance['VenueTemplate']['Venue']['Town']['City']['Name'];
			if(!cityDic[city]) {
				cityDic[city] = {name: city, dic: {}, venues:[], districts: []};
				cities.push(cityDic[city]);
			}
			venue = performance['VenueTemplate']['Venue']['Localization']['Name'];
			if(!cityDic[city].dic[venue]){
				cityDic[city].dic[venue] = venue;
				cityDic[city].venues.push(venue);
				cityDic[city].districts.push(performance['VenueTemplate']['Venue']['Town']['Name']);
			}
		});
		switch(cities.length) {
			case 0:
				this.formattedVenues = '';
			break;
			case 1:
				this.formattedVenues = `${cities[0].districts.join(', ')}, ${cities[0].name}`;
			break;
			default:
				this.formattedVenues = 'Birçok Mekan';
			break;
		}
	}

	setFormattedDate(){
		let minDate;
		let maxDate;
		let date;

		this.salesDateRange = { begin: {min: null, max: null}, end: {min: null, max: null}, performancesStartDate: null, eventsStartDate: null, eventsEndtDate:null };

		if (this.isMainEvent) {
			if(this.promises.events.new) {
				this.promises.events.new.forEach( event => {
					if(event['Performances']) {
						event['Performances'].forEach ( performance => {
							date = moment(performance['Date']);
							if(!minDate) minDate = date;
							if(!maxDate) maxDate = date;
							if(date.isSameOrBefore(minDate)) minDate = date;
							if(date.isAfter(maxDate)) maxDate = date;
						});
					}
				});
			}
		}else{
			if(this.promises.performances.new) {
				this.promises.performances.new.forEach( performance => {
					date = moment(performance['Date']);
					if(!minDate) minDate = date;
					if(!maxDate) maxDate = date;
					if(date.isSameOrBefore(minDate)) minDate = date;
					if(date.isAfter(maxDate)) maxDate = date;
				});
			}
		}

		this.formattedDate = this.relativeDatePipe.transform(minDate != maxDate ? [minDate, maxDate] : [minDate]);
		if(this.isMainEvent) {
			// this.event.SalesBeginDate = minDate;
			// this.event.SalesEndDate = maxDate;
			this.salesDateRange.eventsStartDate = minDate;
			this.salesDateRange.eventsEndtDate = maxDate;
		}else {
			this.salesDateRange.performancesStartDate = minDate;
		}
	}

	entityTypeDataHandler() {
		this.entityTypeEntityService.data.subscribe( result => {
			if(result && result[0]) {
				this.entityTypeId = result[0].Id;

				this.attributeTypesServiceDataHandler();
				this.firmServiceDataHandler();
				this.setEvent();
			}
		});

		this.entityTypeEntityService.setCustomEndpoint('GetAll');
		this.entityTypeEntityService.fromEntity('AEntityType').where('EntityTypeCode', '=', '\'EVT\'').page(0).take(1).executeQuery();
	}

	setEvent() {
		if(this.isEditMode && this.route.snapshot.params && this.route.snapshot.params && this.route.snapshot.params['id']){
			let id = this.route.snapshot.params['id'];
			this.isLoading = true;
			this.eventEntityService.data.subscribe( events => {
				if(events && events[0]) {
					this.event = new Event(events[0]);
					this.promises.event.old = new Event(events[0]);
					console.log(this.event);
					if(!this.event) return;
					
					this.isMainEvent = this.event.ChildEventCount > 0;

					this.flags.PublishDateFieldOn = this.event.PublishDate != null;
					if(this.event.ReservationAvailable && this.event.ReservationExpirationType == 0) this.event.ReservationExpirationType = 1;
					if(this.event.IsInviteFriendAvailable && this.event.InviteFriendExpirationType == 0) this.event.InviteFriendExpirationType = 1;
					this.getLocalization();

					if(this.isMainEvent) {
						if(this.promoterId > 0)
						{
							this.enitiyFirmServiceDataHandlerForPromoter();
						}
						else {
							this.eventsEntityServiceDataHandler();
							this.resetEvents(true);							
						}

					}else{
						this.performanceEntityServiceDataHandler();
						this.resetPerformances(true);
					}

					this.attributeServiceDataHandler();
					this.resetAttributes(true);

					this.entityFirmServiceDataHandler();
					this.resetPromoters();
					this.resetSponsors(true);

					this.changeDetector.detectChanges();
					this.isLoading = false;
				}
			});

			this.eventEntityService.setCustomEndpoint('GetAll');
			this.eventEntityService.fromEntity('EEvent').where('Id', '=', id).expand(['Localization']).take(1).page(0).executeQuery();

		}else{
			this.event = new Event({
				//"Code": "AB4",
				//"Type": 0,
				//"EmployeeId": 0,
				//"MerchantTemplateId": 0,
				//"PublishDate": moment().toISOString(),
				// "SalesBeginDate": null,
				// "SalesEndDate": null,
				// "IsSortPriceMinMax": true,
				'Status': 4,
				// "SeatPlan": "string",
				// "Vat": 0,
				// "Logo": "string",
				// "Logo2": "string",
				 'Images': null,
				// "VideoUrl": "string",
				 'ReservationAvailable': false,
				// "NoExpire": true,
				'ReservationExpirationType': 0,
				'ReservationExpirationTime': 0,
				'IsInviteFriendAvailable': false,
				'InviteFriendExpirationType': 0,
				'InviteFriendExpirationTime': 0,
				'SuspensionReason': null,
				'CancellationReason': null,
				// "ParentId": 0,
				// "Localization": {
				// 	Tr: {
				// 		Name: null,
				// 		ShortName: null,
				// 		Description: null,
				// 		Info: null,
				// 		PriceInfo: null,
				// 		Rules: null,
				// 		SpotText: null,
				// 		StatusText: null,
				// 		GroupSaleDetail: null,
				// 		PdfInfo: null,
				// 		FacebookText: null,
				// 		TwitterText: null
				// 	},
				// 	En: {
				// 		Name: null,
				// 		ShortName: null,
				// 		Description: null,
				// 		Info: null,
				// 		PriceInfo: null,
				// 		Rules: null,
				// 		SpotText: null,
				// 		StatusText: null,
				// 		GroupSaleDetail: null,
				// 		PdfInfo: null,
				// 		FacebookText: null,
				// 		TwitterText: null
				// 	}
				// }
			});
			if(this.promoterId > 0)
			{
				console.log("Auto aDd Prmoter Mode");
				this.enitiyFirmServiceDataHandlerForPromoter();
			}

			this.promises.event.old = new Event(this.event);
			this.flags.PublishDateFieldOn = this.event.PublishDate != null;
			if(this.title) this.titleChangeHandler(this.title);
			this.changeDetector.detectChanges();
		}

		this.changeDetector.detectChanges();
	}

	getLocalization() {
		if(this.event) {
			this.eventService.flushCustomEndpoint();
			this.eventService.find(this.event.Id, true);
			this.eventService.data.subscribe( result => {
				if(result && result[0]) {
					this.event.setLocalization(result[0]['Localization']);
					this.titleChangeHandler(this.event.Localization['Name']);
					this.descriptionChangeHandler(this.event.Localization['Description']);
				}
			});
		}
	}

	eventsEntityServiceDataHandler() {
		this.eventsEntityService.setCustomEndpoint('GetAll');
		this.eventsEntityService.data.subscribe(entities => {
			if(entities) {
				entities.forEach( entityItem => {
					this.promises.events.old = [];
					this.promises.events.new = [];
					this.events = [];

					let event: Event;
					entities.forEach( eventData => {
						event = new Event(eventData);
						this.promises.events.old.push(event);
						this.promises.events.new.push(event);
						this.events.push(event);
					});
				});
			}
			this.setFormattedDate();
			this.setFormattedVenue();
		})
	}

	resetEvents(flushQuery = false) {
		if(this.promises.events.saved.create && this.promises.events.saved.update && this.promises.events.saved.delete) {
			this.promises.events.saved = {create: false, update: false, delete: false};
			this.promises.event.saved.events = true;
			this.checkSaved();
			flushQuery = true;
		}
		if(flushQuery) {
			if(this.event && this.event.Id) {
				this.eventsEntityService.setCustomEndpoint('GetAll');
				this.eventsEntityService
					.fromEntity('EEvent')
					.where('ParentId', '=', this.event.Id)
					.expand(['Localization'])
					.expand(['Performances'])
					.take(50)
					.page(0)
					.executeQuery();
			}
		}
	}

	performanceEntityServiceDataHandler() {
		if(!this.event || !this.event.Id) return;

		this.performanceEntityService.data.subscribe( result => {
			if(result) {
				this.promises.performances.old = [];
				this.promises.performances.new = [];
				this.performances = [];

				let performance: Performance;
				result.forEach( performanceData => {
					performance = new Performance(performanceData);
					this.promises.performances.old.push(performance);
					this.promises.performances.new.push(performance);
					this.performances.push(performance);
				});
				this.setFormattedDate();
				this.setFormattedVenue();
			}
		});
	}

	resetPerformances(flushQuery = false) {
		if(this.promises.performances.saved.create && this.promises.performances.saved.update && this.promises.performances.saved.delete) {
			this.promises.performances.saved = {create: false, update: false, delete: false};
			this.promises.event.saved.performances = true;
			this.checkSaved();
			flushQuery = true;
		}
		if(flushQuery) {
			if(this.event && this.event.Id) {
				this.performanceEntityService.setCustomEndpoint('GetAll');
				this.performanceEntityService
					.fromEntity('EPerformance')
					.where('EventId', '=', this.event.Id)
					.expand(['Localization'])
					.expand(['VenueTemplate', 'Localization'])
					.expand(['VenueTemplate', 'Venue', 'Localization'])
					.expand(['VenueTemplate', 'Venue', 'Town', 'City', 'Country', 'Localization'])
					.take(1000)
					.page(0)
					.executeQuery();
			}
		}
	}

	attributeTypesServiceDataHandler() {
		this.attributeTypeService.setCustomEndpoint('List');
		this.attributeTypeService.query({pageSize:20, page:0});
		this.attributeTypeService.data.subscribe(payload => {
			let attributeTypes = [];
			if(payload && payload.length > 0){
				payload.forEach(item => {
					if(item.IsActive){
						attributeTypes.push({name:item.Id.toString(), label: item.Name, params:{attributeType: item}});
					}
				});
				this.attributeTypes = attributeTypes;
			}
		});
	}

	attributeServiceDataHandler() {
		if(!this.event || !this.event.Id) return;

		this.entityAttributeService.data.subscribe(entityAttributes => {

			if(entityAttributes && entityAttributes.length > 0){

				this.promises.attributes.old = [];
				this.promises.attributes.new = [];
				this.attributes = [];

				let attribute,
					attributeData,
					entityAttribute;

				entityAttributes.forEach( entityAttributeData => {

					entityAttribute = new EntityAttribute({
						Id: entityAttributeData.Id,
						AttributeId: entityAttributeData.AttributeId,
						EntityId: entityAttributeData.EntityId,
						EntityTypeId: entityAttributeData.EntityTypeId,
						Value: entityAttributeData.Value,
						IsActive: entityAttributeData.IsActive,
						StartDate: entityAttributeData.StartDate,
						ExpireDate: entityAttributeData.ExpireDate
					});

					this.promises.attributes.old.push(entityAttribute);
					this.promises.attributes.new.push(entityAttribute);

					attributeData = entityAttributeData['AAttribute'];
					attribute = {
						name:attributeData.Id.toString(),
						label: attributeData.Name,
						type: {name: attributeData.AttributeTypeId.toString()},
						extraFieldType: entityAttributeData && entityAttributeData.Value ? 'fuzzy' : null,
						extraFieldValue: entityAttributeData && entityAttributeData.Value ? entityAttributeData.Value : 0,
						params: {entityAttribute: entityAttribute, attribute: new Attribute(attributeData)}
					};
					if(attribute['extraFieldValue']) attribute['label'] += ' [ <i>f:</i><span>' + attribute['extraFieldValue'] + '</span>]'

					this.attributes.push(attribute);
				});
			}
		});
	}

	resetAttributes(flushQuery = false) {
		if(this.promises.attributes.saved.create && this.promises.attributes.saved.update && this.promises.attributes.saved.delete) {
			this.promises.attributes.saved = {create: false, update: false, delete: false};
			this.promises.event.saved.attributes = true;
			this.checkSaved();
			flushQuery = true;
		}
		if(flushQuery) {
			if(this.event && this.event.Id) {
				this.entityAttributeService.setCustomEndpoint('GetEntityAttributeList');
				this.entityAttributeService.query({pageSize: 100, filter: [{filter:'EntityId eq ' + this.event.Id + ' and EntityTypeId eq ' + this.entityTypeId + ' and IsActive eq true'}]});
			}
		}
	}

	firmServiceDataHandler() {

		this.firmPresets = null;
		this.firmService.data.subscribe(response => {
			if (response.length > 0) {
				let result = []
				for (let firm of response) {
					console.log(firm);
					result.push({
						id: firm['Id'],
						title: firm['Name'],
						icon: 'vpn_key',
						params: {firm: firm}
					});
				};
				this.firmSearchResult = Observable.of([{
					title: 'ARAMA SONUÇLARI', list: result
				}]);
			} else {
				this.firmSearchResult = Observable.of([]);
			}
		});
	}

	enitiyFirmServiceDataHandlerForPromoter() {
		let promoterFirm:EntityFirm;
		let firm: {id: any, name: string, shortName: string};
		this.entityFirmService.setCustomEndpoint('GetEntityFirmList');
		this.entityFirmService.query({page:0, pageSize:1,take:1, filter: [{ filter: 'OwnerFirmId eq ' + this.promoterId }] });
		this.entityFirmService.data.subscribe(result => {
			console.log("The Promoter Result",result);
			this.promoters = [];
			this.promises.promoters.old = [];
			this.promises.promoters.new = [];
			if(result && result[0]) {
				promoterFirm = new EntityFirm(result[0]);
				firm = {
					id: result[0].OwnerFirmId,
					name: result[0].OwnerFirmDetail.Name,
					shortName: result[0].OwnerFirmDetail.Name
				}

					this.promises.promoters.old.push(result[0]);
					this.promises.promoters.new.push(result[0]);
					this.promoters.push({
						id: firm.id,
						name: firm.name,
						type: result[0].SubType,
						params: {entityFirm: result[0], firm: firm}
					});	
							
			}
		}) 		

	}

	entityFirmServiceDataHandler() {

		if (!this.event || !this.event.Id) return;

		let entityFirm: EntityFirm;
		let firm: {id: any, name: string, shortName: string};
		this.entityFirmService.data.subscribe(result => {
			console.log("Entity firm service handlere uğradım",result);
			this.sponsors = [];
			this.promises.sponsors.old = [];
			this.promises.sponsors.new = [];

			this.promoters = [];
			this.promises.promoters.old = [];
			this.promises.promoters.new = [];

			result.forEach( entityFirmData => {
				entityFirm = new EntityFirm(entityFirmData);
				firm = {
					id: entityFirm.OwnerFirmId,
					name: entityFirm.OwnerFirmDetail.Name,
					shortName: entityFirm.OwnerFirmDetail.ShortName
				};
				
				if (entityFirm.Type == 2){
					this.promises.promoters.old.push(entityFirm);
					this.promises.promoters.new.push(entityFirm);
					this.promoters.push({
						id: firm.id,
						name: firm.name,
						type: entityFirm.SubType,
						params: {entityFirm: entityFirm, firm: firm}
					});
				}else if (entityFirm.Type == 3) {
					this.promises.sponsors.old.push(entityFirm);
					this.promises.sponsors.new.push(entityFirm);
					this.sponsors.push({
						id: firm.id,
						name: firm.name,
						type: entityFirm.SubType,
						params: {entityFirm: entityFirm, firm: firm}
					});
				}

			})
		});
	}

	resetSponsors(flushQuery = false) {
		if (this.promises.sponsors.saved.create && this.promises.sponsors.saved.update && this.promises.sponsors.saved.delete) {
			this.promises.sponsors.saved = {create: false, update: false, delete: false};
			this.promises.event.saved.sponsors = true;
			this.checkSaved();
			flushQuery = true;
		}
		if (flushQuery) {
			if (this.event && this.event.Id) {
				this.entityFirmService.setCustomEndpoint('GetEntityFirmList');
				this.entityFirmService.query({page: 0, pageSize: 100, filter: [{ filter: 'EventId eq ' + this.event.Id }] });
			}
		}
	}

	resetPromoters(flushQuery = false) {
		if (this.promises.promoters.saved.create && this.promises.promoters.saved.update && this.promises.promoters.saved.delete) {
			this.promises.promoters.saved = {create: false, update: false, delete: false};
			this.promises.event.saved.promoters = true;
			this.checkSaved();
			flushQuery = true;
		}
		if (flushQuery) {
			if (this.event && this.event.Id) {
				this.entityFirmService.setCustomEndpoint('GetEntityFirmList');
				this.entityFirmService.query({page: 0, pageSize: 100, filter: [{ filter: 'EventId eq ' + this.event.Id }] });
			}
		}
	}

	titleChangeHandler(value) {
		if (!this.event) return;
		this.title = value;
		this.event.set('Name', value, true);
		this.event.set('ShortName', value, true);
	}

	// tabChangeHandler(event) {
	// 	switch (event.value) {
	// 		case 'event':
	// 			this.tetherService.confirm({
	// 				title: 'Etkinlik türünü değiştiriyorsunuz!',
	// 				description: 'Çatı etkinlik oluşturma işleminden ayrılmak istediğinize emin misiniz?',
	// 				confirmButton: {label: 'EVET'},
	// 				dismissButton: {label: 'VAZGEÇ'}
	// 			}).then( result => {
	// 				this.isMainEvent = false;
	// 				this.setEvent();
	// 			}).catch(reason => {
	// 				this.typeSelector.selectedValues = ['mainEvent'];
	// 			});
	// 		break;
	// 		case 'mainEvent':
	// 			this.tetherService.confirm({
	// 				title: 'Etkinlik türünü değiştiriyorsunuz!',
	// 				description: 'Etkinlik oluşturma işleminden ayrılmak istediğinize emin misiniz?',
	// 				confirmButton: {label: 'EVET'},
	// 				dismissButton: {label: 'VAZGEÇ'}
	// 			}).then( result => {
	// 				this.isMainEvent = true;
	// 				this.setEvent();
	// 			}).catch(reason => {
	// 				this.typeSelector.selectedValues = ['event'];
	// 			});
	// 		break;
	// 	}
	// }

	gotoEventCreate(){
		this.router.navigate(['event', 'create']);
	}

	gotoPerformanceCreate(){
		this.router.navigate(['performance', 'create']);
	}

	eventsActionHandler(event) {
		switch (event.action) {
			case 'openSearchBox':

			break;
			case 'createEvent':
				if (!this.isValid){
					this.tetherService.dismiss();
					this.tetherService.confirm({
						title: 'Etkinlik Henüz Kaydedilmedi!',
						description: 'Gerekli alanlar doldurulmadığı için kayıt işlemi yapılamadı. Yine de etkinliği kaydetmeden bir başka etkinlik oluşturmak istyor musunuz?',
						confirmButton: {label: 'EVET'},
						dismissButton: {label: 'VAZGEÇ'}
					}).then( result => {
						this.gotoEventCreate();
					}).catch(reason => {
						this.eventSearchSelect.openSearchBox();
					});
				}else{
					this.onSaveComplete = this.gotoEventCreate;
					this.saveEvent();
				}
			break;
		}
	}

	eventsChangeHandler(e) {
		if (!e && e.length == 0) return;
		this.promises.events.new = [];
		let event: Event;

		e.forEach(item => {
			event = this.promises.events.old.find( eventItem => item.Id == eventItem.Id);
			if (!event) {
				event = item;
				event.ParentId = this.event.Id;
			}
			this.promises.events.new.push(event);
		});
		this.setFormattedDate();
	}

	performancesActionHandler(event) {
		switch (event.action) {
			case 'openSearchBox':

			break;
			case 'createPerformance':
				if (!this.isValid){
					this.tetherService.dismiss();
					this.tetherService.confirm({
						title: 'Etkinlik Henüz Kaydedilmedi!',
						description: 'Gerekli alanlar doldurulmadığı için kayıt işlemi yapılamadı. Yine de etkinliği kaydetmeden yeni performans oluşturmak istyor musunuz?',
						confirmButton: {label: 'EVET'},
						dismissButton: {label: 'VAZGEÇ'}
					}).then( result => {
						this.gotoPerformanceCreate();
					}).catch(reason => {
						this.performanceSearchSelect.openSearchBox();
					});
				}else{
					this.onSaveComplete = this.gotoPerformanceCreate;
					this.saveEvent();
				}
			break;
		}
	}

	performancesChangeHandler(event) {
		if (!event && event.length == 0) return;
		this.promises.performances.new = [];
		let performance: Performance;

		event.forEach(item => {
			performance = this.promises.performances.old.find( performanceItem => item.Id == performanceItem.Id);
			if (!performance) {
				performance = item;
				performance.EventId = this.event.Id;
			}
			this.promises.performances.new.push(performance);
		});
		this.setFormattedDate();
		this.setFormattedVenue();
	}

	checkHandler(value, name: string, target = 'event') {
		this[target][name] = value;
		if (!this.event) return;
		switch (name) {
			case 'PublishDateFieldOn':
				 this.event.PublishDate = value ? moment().toISOString() : null;
			break;
			case 'ReservationAvailable':
				if (this.event) {
					this.event.set('ReservationExpirationType', value ? 1 : 0);
					if (!value) this.event.set('ReservationExpirationTime', 0);
				}
			break;
			case 'IsInviteFriendAvailable':
				if (this.event) {
					this.event.set('InviteFriendExpirationType', value ? 1 : 0);
					if (!value) this.event.set('InviteFriendExpirationTime', 0);
				}
			break;
		}
	}

	dateChangeHandler(value, name){
		if (!this.event) return;
		this.event[name] = value;
	}

	selectChangeHandler(value, name) {
		if (this.event) this.event.set(name, parseInt(value));
	}

	photoChangeHandler(event) {
		if (this.event) this.event.set('Images', event.data || '');
	}

	attributesChangeHandler(event: {name: string, params: {entityAttribute?: EntityAttribute, attribute?: Attribute}}[]) {
		if (event) {
			this.promises.attributes.new = [];
			let entityAttribute: EntityAttribute;
			event.forEach( attributeData => {
				entityAttribute = this.promises.attributes.old.find( item => item.AttributeId.toString() == attributeData.name);
				if (!entityAttribute) {
					entityAttribute = new EntityAttribute({
						AttributeId: attributeData.params.attribute.Id || attributeData.params.attribute['key'],
						EntityTypeId: this.entityTypeId,
						EntityId: this.event.Id,
						Value: attributeData['extraFieldValue'] ? parseInt(attributeData['extraFieldValue']) : 0,
						StartDate: '2017-02-17T18:02:47.381Z',
						ExpireDate: '2017-02-28T18:02:47.381Z',
						IsActive: true
					});
				}
				//entityAttribute.Value = attributeData["extraFieldValue"] ? parseInt(attributeData["extraFieldValue"]) : 0;
				this.promises.attributes.new.push(entityAttribute);
			});
		}
	}

	attributesActionHandler(event) {
		switch (event.action) {
			case 'remove':
				this.attributesChangeHandler(this.attributes);
			break;
		}
	}

	sponsorChangeHandler(event: {params: {entityFirm?: EntityFirm, firm?: Firm}}[]) {
		if (!event && event.length == 0) return;
		this.promises.sponsors.new = [];
		let entityFirm: EntityFirm;
		event.forEach(item => {
			entityFirm = this.promises.sponsors.old.find( entityFirmItem => item['id'] == entityFirmItem.OwnerFirmId);
			if (!entityFirm) {
				entityFirm = new EntityFirm( {
					Type: item.params.firm['FirmType'] || 3,
					SubType: Math.max(item['type'], 0),
					EventId: this.event.Id,
					OwnerFirmId: item.params.firm['Id']
				});
			}
			this.promises.sponsors.new.push(entityFirm);
		});
	}

	sponsorActionHandler(event: {action: string, data: any[]}) {
		switch (event.action) {
			case 'search':
				if (event.data && event.data.length > 0){
					this.firmService.setCustomEndpoint('GetFirmList');
					this.firmService.query({ page: 0, pageSize: 10, search: { key: 'Name', value: event.data } }, [{ key: 'isEvent', value: false }]);
				}
			break;
			case 'createNewSponsor':
				alert('Bu bölüm henüz aktif değildir');
			break;
			case 'patch':
				let entityFirm = this.promises.sponsors.new.find( item => item.OwnerFirmId == event.data['id']);
				if (entityFirm) entityFirm.SubType = Math.max(0, event.data['type']);
			break;
			case 'exist':
				this.notificationService.add({text: '<b>' + event.data['name'] + '</b> daha önce eklendi!', type: 'danger'});
			break;
		}
	}

	promoterChangeHandler(event: {params: {entityFirm?: EntityFirm, firm?: Firm}}[]) {
		if (!event && event.length == 0) return;
		this.promises.promoters.new = [];
		let entityFirm: EntityFirm;
		event.forEach(item => {
			entityFirm = this.promises.promoters.old.find( entityFirmItem => item['id'] == entityFirmItem.OwnerFirmId);
			if (!entityFirm) {
				entityFirm = new EntityFirm( {
					Type: item.params.firm['FirmType'] || 2,
					SubType: 0,
					EventId: this.event.Id,
					OwnerFirmId: item.params.firm['Id']
				});
			}
			this.promises.promoters.new.push(entityFirm);
		});
	}

	promoterActionHandler(event: {action: string, data: any[]}) {
		switch (event.action) {
			case 'search':
				if (event.data && event.data.length > 0){
					this.firmService.setCustomEndpoint('GetFirmList');
					this.firmService.query({ page: 0, pageSize: 10, search: { key: 'Name', value: event.data } }, [{ key: 'isEvent', value: false }]);
				}
			break;
			case 'createNewSponsor':
				alert('Bu bölüm henüz aktif değildir');
			break;
			case 'patch':
				let entityFirm = this.promises.promoters.new.find( item => item.OwnerFirmId == event.data['id']);
				if (entityFirm) entityFirm.SubType = 0;
			break;
			case 'exist':
				this.notificationService.add({text: '<b>' + event.data['name'] + '</b> daha önce eklendi!', type: 'danger'});
			break;
		}
	}

	descriptionChangeHandler(event) {
		if (!this.event) return;
		this.event.set('Description', event, true);
	}

	actionHandler(event) {
		switch (event.action) {
			case 'unsuspend':
				this.event.SuspensionReason = null;
				this.event.Status = 2;
				this.changeDetector.detectChanges();
			break;
		}
	}

	suspendEvent(){
		this.tetherService.confirm({
			title: 'Etkinliği ertelemek istediğinizden emin misiniz?',
			description: 'Bu işlem geri alınabilir bir işlemdir.',
			feedback: {label: 'ERTELEME SEBEBİ', required: true},
			confirmButton: {label: 'ERTELE', theme: 'light'},
			dismissButton: {label: 'VAZGEÇ'}
		}).then(result => {
			this.event.SuspensionReason = result['feedback'];
			this.event.Status = 6;
		}).catch(reoson => {});
	}

	cancelEvent(){
		this.tetherService.confirm({
			title: 'Etkinliği iptal etmek istediğinizden emin misiniz?',
			description: '<b>DİKKAT!</b> Bu işlem geri alınamaz.',
			feedback: {label: 'İPTAL SEBEBİ', required: true},
			confirmButton: {label: 'İPTAL'},
			dismissButton: {label: 'VAZGEÇ'}
		}).then(result => {
			this.event.CancellationReason = result['feedback'];
			this.event.Status = 5;
			this.saveEvent();
		}).catch(reoson => {});
	}

	submitEvent(event) {
		if (!this.showValidationError()) this.saveEvent();
	}

	exit(event) {
		if (this.isMainEvent) {
			this.router.navigate(['event-groups']);
		} else {
			this.router.navigate(['events']);
		}
	}

	saveEvent() {
		//if(this.event.Status != 6 && this.event.Status != 5) this.event.Status = 4;
		this.isPromising = true;
		this.promises.event.new = this.event;
		if (this.event.Id) {
			this.eventService.flushCustomEndpoint();
			this.eventService.update(this.event.getRawData()).subscribe(
				result => {
					this.saveRelations();
				},
				error => {
					this.onErrorHandler({text: `<b>Etkinlik kaydedilemedi</b> Lütfen bütün gerekli alanları doldurun.<br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				},
				complete => {

				}
			)
		}else{
			
			this.event.PromoterId = this.promises.promoters.new.map(promoter => promoter.OwnerFirmId)[0];
			this.eventService.setCustomEndpoint('CreateEvent');
			this.eventService.create(this.event.getRawData()).subscribe(
				result => {
					this.event.Id = result;
					this.saveRelations(true);
				},
				error => {
					this.onErrorHandler({text: `<b>Etkinlik kaydedilemedi</b> Lütfen bütün gerekli alanları doldurun.<br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				},
				complete => {

				}
			)
		}
	}

	saveRelations(isNew = false) {
		if (this.isMainEvent) this.saveEvents(isNew);
		if (!this.isMainEvent) this.savePerformances(isNew);
		this.saveAttributes(isNew);
		this.saveSponsors(isNew);
		this.savePromoters(isNew);
	}

	saveEvents(isNew = false){
		if (isNew && this.event) { this.promises.events.new.map( item => item.ParentId = this.event.Id) };
		let willUpdate: Event[] = [];
		let willDelete: Event[] = [].concat(this.promises.events.old);
		let willCreate: Event[] = [].concat(this.promises.events.new);
		let sourceList: Event[] = [].concat(this.promises.events.new);

		let item: Event;
		let matchedItem: Event;
		let action: string;
		while (sourceList.length > 0) {
			item = sourceList.shift();
			matchedItem = willDelete.find( event => item.Id == event.Id);
			if (matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(matchedItem), 1);
				willUpdate.push(item);
			}
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);

		if (willCreate.length > 0) {
			willCreate.map( item => item.ParentId = this.event.Id);
			this.eventService.setCustomEndpoint('PutAll');
			this.eventService.update(willCreate, 'put').subscribe(
				response => {
					this.promises.events.saved.create = true;
					this.resetEvents();
				},
				error => {
					this.onErrorHandler({text: `<b>Alt etkinlikler kaydedilemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else{
			this.promises.events.saved.create = true;
			this.resetEvents();
		}

		if (willUpdate.length > 0) {
			this.eventService.setCustomEndpoint('PutAll');
			this.eventService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.events.saved.update = true;
					this.resetEvents();
				}, error => {
					this.onErrorHandler({text: `<b>Alt etkinlikler kaydedilemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else {
			this.promises.events.saved.update = true;
			this.resetEvents();
		}

		if (willDelete.length > 0) {
			willDelete.map( item => item.ParentId = null);
			this.eventService.setCustomEndpoint('PutAll');
			this.eventService.update(willDelete, 'put').subscribe(
				response => {
					this.promises.events.saved.delete = true;
					this.resetEvents();
				}, error => {
					this.onErrorHandler({text: `<b>Alt etkinlikler kaydedilemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else{
			this.promises.events.saved.delete = true;
			this.resetEvents();
		}
	}

	savePerformances(isNew = false){
		if (isNew && this.event) { this.promises.performances.new.map( item => item.EventId = this.event.Id) };
		let willUpdate: Performance[] = [];
		let willDelete: Performance[] = [].concat(this.promises.performances.old);
		let willCreate: Performance[] = [].concat(this.promises.performances.new);
		let sourceList: Performance[] = [].concat(this.promises.performances.new);

		let item: Performance;
		let matchedItem: Performance;
		let action: string;
		while (sourceList.length > 0) {
			item = sourceList.shift();
			matchedItem = willDelete.find( performance => item.Id == performance.Id);
			if (matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(matchedItem), 1);
				willUpdate.push(item);
			}
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);

		if (willCreate.length > 0) {
			willCreate.map( item => item.EventId = this.event.Id);
			this.performanceService.setCustomEndpoint('PutAll');
			this.performanceService.update(willCreate, 'put').subscribe(
				response => {
					this.promises.performances.saved.create = true;
					this.resetPerformances();
				},
				error => {
					this.onErrorHandler({text: `<b>Performanslar kaydedilemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else{
			this.promises.performances.saved.create = true;
			this.resetPerformances();
		}

		if (willUpdate.length > 0) {
			this.performanceService.setCustomEndpoint('PutAll');
			this.performanceService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.performances.saved.update = true;
					this.resetPerformances();
				}, error => {
					this.onErrorHandler({text: `<b>Performanslar kaydedilemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else {
			this.promises.performances.saved.update = true;
			this.resetPerformances();
		}

		if (willDelete.length > 0) {
			willDelete.map( item => item.EventId = null);
			this.performanceService.setCustomEndpoint('PutAll');
			this.performanceService.update(willDelete, 'put').subscribe(
				response => {
					this.promises.performances.saved.delete = true;
					this.resetPerformances();
				}, error => {
					this.onErrorHandler({text: `<b>Performanslar kaydedilemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else{
			this.promises.performances.saved.delete = true;
			this.resetPerformances();
		}
	}

	saveAttributes(isNew = false) {
		if (isNew && this.event) { this.promises.attributes.new.map( item => item.EntityId = this.event.Id) };
		let willUpdate: EntityAttribute[] = [];
		let willDelete: EntityAttribute[] = [].concat(this.promises.attributes.old);
		let willCreate: EntityAttribute[] = [].concat(this.promises.attributes.new);
		let sourceList: EntityAttribute[] = [].concat(this.promises.attributes.new);
		let item: EntityAttribute;
		let matchedItem: EntityAttribute;
		let action: string;

		while (sourceList.length > 0) {
			item = sourceList.shift();

			matchedItem = willDelete.find( entityAttribute => {
				return item.AttributeId == entityAttribute.AttributeId;
			});
			if (matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(willCreate.find(createItem => matchedItem.AttributeId == createItem.AttributeId)), 1);
				willUpdate.push(item);
			}
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);

		if (willCreate.length > 0) {
			this.entityAttributeService.setCustomEndpoint('PostAll');
			this.entityAttributeService.create(willCreate).subscribe(
				response => {
					this.promises.attributes.saved.create = true;
					this.resetAttributes();
				},
				error => {
					this.onErrorHandler({text: `<b>Etkinlik tipleri kaydedilemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else {
			this.promises.attributes.saved.create = true;
			this.resetAttributes();
		}

		if (willUpdate.length > 0) {
			this.entityAttributeService.setCustomEndpoint('PutAll');
			this.entityAttributeService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.attributes.saved.update = true;
					this.resetAttributes();
				}, error => {
					this.onErrorHandler({text: `<b>Etkinlik tipleri kaydedilemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else {
			this.promises.attributes.saved.update = true;
			this.resetAttributes();
		}

		if (willDelete.length > 0) {
			willDelete.map( item => item.IsActive = false);
			this.entityAttributeService.setCustomEndpoint('PutAll');
			this.entityAttributeService.update(willDelete, 'put').subscribe(
				response => {
					this.promises.attributes.saved.delete = true;
					this.resetAttributes();
				}, error => {
					this.onErrorHandler({text: `<b>Etkinlik tipleri silinemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else{
			this.promises.attributes.saved.delete = true;
			this.resetAttributes();
		}
	}

	saveSponsors(isNew = false) {
		if (isNew && this.event) { this.promises.sponsors.new.map( item => item.EventId = this.event.Id) };
		let willUpdate: EntityFirm[] = [];
		let willDelete: EntityFirm[] = [].concat(this.promises.sponsors.old);
		let willCreate: EntityFirm[] = [].concat(this.promises.sponsors.new);
		let sourceList: EntityFirm[] = [].concat(this.promises.sponsors.new);

		let item: EntityFirm;
		let matchedItem: EntityFirm;
		while (sourceList.length > 0) {
			item = sourceList.shift();
			matchedItem = willDelete.find( entityFirm => { return item.Id == entityFirm.Id });
			if (matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(willCreate.find(createItem => matchedItem.OwnerFirmId == createItem.OwnerFirmId)), 1);
				willUpdate.push(item);
			};
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);


		if (willCreate.length > 0) {
			this.entityFirmService.setCustomEndpoint('PostAll');
			this.entityFirmService.create(willCreate).subscribe(
				response => {
					this.promises.sponsors.saved.create = true;
					this.resetSponsors();
				},
				error => {
					this.onErrorHandler({text: `<b>Sponsorlar kaydedilemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else {
			this.promises.sponsors.saved.create = true;
			this.resetSponsors();
		}

		if (willUpdate.length > 0) {
			this.entityFirmService.setCustomEndpoint('PutAll');
			this.entityFirmService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.sponsors.saved.update = true;
					this.resetSponsors();
				}, error => {
					this.onErrorHandler({text: `<b>Sponsorlar kaydedilemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else {
			this.promises.sponsors.saved.update = true;
			this.resetSponsors();
		}

		if (willDelete.length > 0) {
			willDelete.forEach( entityFirm => {
				this.entityFirmService.setCustomEndpoint('');
				this.entityFirmService.delete(entityFirm.Id).subscribe(
					response => {

					},
					error => {
						console.log(error);
					}
				)
			});
			this.promises.sponsors.saved.delete = true;
			this.resetSponsors();
		}else {
			this.promises.sponsors.saved.delete = true;
			this.resetSponsors();
		}

	}

	savePromoters(isNew = false) {
		if (isNew && this.event) { this.promises.promoters.new.map( item => item.EventId = this.event.Id) };
		let willUpdate: EntityFirm[] = [];
		let willDelete: EntityFirm[] = [].concat(this.promises.promoters.old);
		let willCreate: EntityFirm[] = [].concat(this.promises.promoters.new);
		let sourceList: EntityFirm[] = [].concat(this.promises.promoters.new);

		let item: EntityFirm;
		let matchedItem: EntityFirm;
		while (sourceList.length > 0) {
			item = sourceList.shift();
			matchedItem = willDelete.find( entityFirm => { return item.Id == entityFirm.Id });
			if (matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(willCreate.find(createItem => matchedItem.OwnerFirmId == createItem.OwnerFirmId)), 1);
				willUpdate.push(item);
			};
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);


		if (willCreate.length > 0) {
			this.entityFirmService.setCustomEndpoint('PostAll');
			this.entityFirmService.create(willCreate).subscribe(
				response => {
					this.promises.promoters.saved.create = true;
					this.resetPromoters();
				},
				error => {
					this.onErrorHandler({text: `<b>Organizatörler kaydedilemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else {
			this.promises.promoters.saved.create = true;
			this.resetPromoters();
		}

		if (willUpdate.length > 0) {
			this.entityFirmService.setCustomEndpoint('PutAll');
			this.entityFirmService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.promoters.saved.update = true;
					this.resetPromoters();
				}, error => {
					this.onErrorHandler({text: `<b>Organizatörler kaydedilemedi</b><br/><small>${error.Message}</small>`, type: 'warning', timeOut: 8000});
				}
			);
		}else {
			this.promises.promoters.saved.update = true;
			this.resetPromoters();
		}

		if (willDelete.length > 0) {
			willDelete.forEach( entityFirm => {
				this.entityFirmService.setCustomEndpoint('');
				this.entityFirmService.delete(entityFirm.Id).subscribe(
					response => {

					},
					error => {
						console.log(error);
					}
				)
			});
			this.promises.promoters.saved.delete = true;
			this.resetPromoters();
		}else {
			this.promises.promoters.saved.delete = true;
			this.resetPromoters();
		}

	}

	checkSaved(){
		if (this.isMainEvent) {
			if (this.promises.event.saved.events && this.promises.event.saved.attributes && this.promises.event.saved.sponsors && this.promises.event.saved.promoters) {
				this.promises.event.saved = {performances: false, events: false, attributes: false, sponsors: false, promoters: false};
				this.notificationService.add({text: `<b>${this.event.get('Name', true)}</b> çatı etkinliği başarıyla kaydedildi.`, type: 'success'});
				this.isPromising = false;
				if (this.onSaveComplete != null) {
					this.onSaveComplete();
				}else{
					this.router.navigate(['event', this.event.Id]);
				}
			}
		}else {
			if (this.promises.event.saved.performances && this.promises.event.saved.attributes && this.promises.event.saved.sponsors && this.promises.event.saved.promoters) {
				this.promises.event.saved = {performances: false, events: false, attributes: false, sponsors: false, promoters: false};
				this.notificationService.add({text: `<b>${this.event.get('Name', true)}</b> etkinliği başarıyla kaydedildi.`, type: 'success'});
				this.isPromising = false;
				if (this.onSaveComplete != null) {
					this.onSaveComplete();
				}else{
					this.router.navigate(['event', this.event.Id]);
				}
			}
		}
	}
}
