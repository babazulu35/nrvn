import { AccessIntegrationType } from './../../models/access-integration-type';
import { ModalSearchBoxComponent } from './../../modules/common-module/components/modal-search-box/modal-search-box.component';
import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { ContextMenuComponent } from './../../modules/common-module/components/context-menu/context-menu.component';
import { AttributesSelectAddBarComponent } from './../../modules/backstage-module/components/attributes-select-add-bar/attributes-select-add-bar.component';
import { PerformerCreateComponent } from './../../modules/backstage-module/common/performer-create/performer-create.component';
import { VenueSelectBarComponent } from './../../modules/backstage-module/components/venue-select-bar/venue-select-bar.component';
import { TemplateService } from './../../services/template.service';
import { EntityTypeService } from './../../services/entity-type.service';
import { Event } from './../../models/event';
import { EntityService } from './../../services/entity.service';
import { EnumTranslatorPipe } from './../../pipes/enum-translator.pipe';
import { RelativeDatePipe } from './../../pipes/relative-date.pipe';
import { HeaderTitleService } from './../../services/header-title.service';
import { NotificationService } from './../../services/notification.service';
import { PerformancePerformer } from './../../models/performance-performer';
import { Firm } from './../../models/firm';
import { Template } from './../../models/template';
import { Venue } from './../../models/venue';
import { EntityFirm } from './../../models/entity-firm';
import { EntityFirmService } from './../../services/entity-firm.service';
import { FirmService } from './../../services/firm.service';
import { EntityAttribute } from './../../models/entity-attribute';
import { EntityAttributeService } from './../../services/entity-attribute.service';
import { AttributeTypeService } from './../../services/attribute-type.service';
import { AttributeType } from './../../models/attribute-type';
import { AttributeService } from './../../services/attribute.service';
import { Attribute } from './../../models/attribute';
import { PerformancePerformerService } from './../../services/performance-performer.service';
import { PerformanceService } from './../../services/performance.service';
import { Performance } from './../../models/performance';
import { PerformanceStatus } from './../../models/performance-status.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { Performer } from './../../models/performer';
import { PerformerService } from './../../services/performer.service';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { Component, OnInit, ChangeDetectorRef, ComponentFactoryResolver, Injector, ComponentRef, ViewChild, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as moment from 'moment';

@Component({
  selector: 'app-performance-create',
  templateUrl: './performance-create.component.html',
  styleUrls: ['./performance-create.component.scss'],
	entryComponents:[ModalSearchBoxComponent, ContextMenuComponent, PerformerCreateComponent],
	providers: [
		{ provide: 'entityTypeEntityService', useClass: EntityService },
		{ provide: 'performanceEntityService', useClass: EntityService },
		{ provide: 'eventEntityService', useClass: EntityService },
		{ provide: 'accessIntegrationTypeService', useClass: EntityService },
		{ provide: 'deleteTemplateByPerformance', useClass: TemplateService },
		{ provide: 'copyVenueTemplateService', useClass: PerformanceService },
		EntityTypeService, EntityService, PerformanceService, PerformerService, PerformancePerformerService, AttributeTypeService, EntityAttributeService, AttributeService, FirmService, EntityFirmService]
})
export class PerformanceCreateComponent implements OnInit {
	@ViewChild(VenueSelectBarComponent) venueSelectBar: VenueSelectBarComponent;

	role: string = "create";

	entityTypeId: number;
	performance: Performance;
	performanceStatus = PerformanceStatus;

	performers: Performer[];


	attributeTypes: {name:string, label: string, params:{attributeType: AttributeType}}[];
	attributes: {name: string, label: string, type:{name: string}, params: {attribute: Attribute}}[] = [];

	venueInfo: {id: any, name: string, template?: string, image?: string}
	venue: Venue;
	template: Template;

	sponsors: {id: any, name: string, type?: any, params?: any}[];
	promoters: {id: any, name: string, type?: any, params?: any}[];



	firmPresets: {title: string, list: any[]}[];
	firmSearchResult: Observable<{title: string, list: any[]}[]>;
	firmTypes: Array<{text: string, value: any}> = [
		{ 'value': 0, text: "Seçiniz"},
		{ 'value': 1, text: 'Ana Sponsor' },
		{ 'value': 2, text: 'Medya Sponsoru' },
		{ 'value': 3, text: 'Etkinlik Sponsoru' },
		{ 'value': 4, text: 'Alt Sponsoru' },
		{ 'value': 5, text: 'Diğer' },
	];

	get isEditMode():boolean { return this.role == "edit" };
	isLoading: boolean;
	isPromising: boolean;
	isTemplateSelected: boolean;
	barcodePromising:boolean = false;

	eventSearchBox: ModalSearchBoxComponent;
	eventSearchSubscription: any;

	relativeDatePipe: RelativeDatePipe = new RelativeDatePipe();
	flags: {PublishDateFieldOn: boolean} = {
		PublishDateFieldOn: false
	};

	hoursRange: {value: any, text: string, disabled?: boolean} [];
	expirationTypes: {text: string, value: any}[] = [
		{ value: '-1', text: "Seçiniz" },
		{ value: 1, text: "Performanstan Önce" },
		{ value: 2, text: "Rezervasyondan Sonra" }
	];

	accessIntegrationTypes: {value: any, text: string}[];

	statusList: {value: any, text: string}[];

	promises: {
		performance: { name:string, old: any, new: any, saved: {performers: boolean, attributes: boolean, sponsors: boolean, promoters: boolean, copyVenueTemplate: boolean} },
		performers: { name: string, old: PerformancePerformer[], new: PerformancePerformer[], saved: {create: boolean, update: boolean, delete: boolean} },
		attributes: { name: string, old: EntityAttribute[], new: EntityAttribute[], saved: {create: boolean, update: boolean, delete: boolean}  },
		sponsors: { name: string, old: EntityFirm[], new: EntityFirm[], saved: {create: boolean, update: boolean, delete: boolean} },
		promoters: { name: string, old: EntityFirm[], new: EntityFirm[], saved: {create: boolean, update: boolean, delete: boolean} } } = {

		performance: { name: "performance", old: [], new: [], saved: {performers: false, attributes: false, sponsors: false, promoters: false, copyVenueTemplate: false}},
		performers: { name: "performers", old: [], new: [], saved: {create: false, update: false, delete: false} },
		attributes: { name: "attributes", old: [], new: [], saved: {create: false, update: false, delete: false} },
		sponsors: { name: "sponsors", old: [], new: [], saved: {create: false, update: false, delete: false} },
		promoters: { name: "promoters", old: [], new: [], saved: {create: false, update: false, delete: false} }
	}

	validation: {
		PerformanceName: { isValid: any, message: string },
		Images: { isValid: any, message: string },
		Date: { isValid: any, message: string },
		EndDate: { isValid: any, message: string },
		Description: { isValid: any, message: string },
		VenueTemplateId: {isValid: any, message: string},
		PromoterName: {isValid: any, message: string},
		IsInviteFriendAvailable: {isValid: any, message: string},
		ReservationAvailable: {isValid: any, message: string}
	} = {
		PerformanceName: {
			message: "Performans adı zorunludur.",
			isValid(): boolean {
				return this.performance && this.performance.isValid("Name", true);
			}
		},
		Images: {
			message: "İmaj eklemek zorunludur.",
			isValid():boolean {
				return this.performance && this.performance.Images && this.performance.Images.length > 0;
			}
		},
		Date: {
			message: "Performans tarihi zorunludur.",
			isValid():boolean {
				return this.performance && this.performance.Date && moment(this.performance.Date).isValid();
			}
		},
		EndDate: {
			message: "Performans tarihi zorunludur.",
			isValid():boolean {
				return this.performance && this.performance.EndDate && moment(this.performance.EndDate).isValid();
			}
		},
		Description: {
			message: "Notlar alanı zorunludur.",
			isValid():boolean {
				return this.performance && this.performance.isValid("Description", true);
			}
		},
		VenueTemplateId: {
			message: "Mekan seçimi zorunludur.",
			isValid():boolean {
				return this.performance && this.performance.VenueTemplateId;
			}
		},
		PromoterName: {
			message: "En az bir adet organizatör eklenmelidir.",
			isValid():boolean {
				return this.promises && this.promises.promoters && this.promises.promoters.new && this.promises.promoters.new.length > 0;
			}
		},
		IsInviteFriendAvailable: {
			message: "<b>Arkadaş davet edilebilir</b> seçildi. Ancak bir süre seçimi yapılmadı!",
			isValid():boolean {
				return this.performance && this.performance.IsInviteFriendAvailable ?  this.performance.InviteFriendExpirationTime > 0 : true;
			}
		},
		ReservationAvailable: {
			message: "<b>Rezervasyon yapılabilir</b> seçildi. Ancak bir süre seçimi yapılmadı!",
			isValid():boolean {
				return this.performance && this.performance.ReservationAvailable ?  this.performance.ReservationExpirationTime > 0 : true;
			}
		}
	};

	get isValid():boolean {
		if( this.performance && this.validation
			&& this.performance.Status != 5
			// && this.performance.Status != 6
			&& this.validation.PerformanceName.isValid.call(this)
			//&& this.validation.Images.isValid.call(this)
			&& this.validation.Date.isValid.call(this)
			&& this.validation.EndDate.isValid.call(this)
			&& this.validation.Description.isValid.call(this)
			&& this.validation.VenueTemplateId.isValid.call(this)
			&& this.validation.PromoterName.isValid.call(this)
			&& this.validation.IsInviteFriendAvailable.isValid.call(this)
			&& this.validation.ReservationAvailable.isValid.call(this) ){
			return true;
		}else{
			return false
		}
	};

	showValidationError():boolean {
		let hasError: boolean  = false;
		let timeout: number = 3000;
		if(!this.validation.IsInviteFriendAvailable.isValid.call(this)) {
			hasError = true; timeout += 2000;
			this.onErrorHandler({type: "warning", text: this.validation.IsInviteFriendAvailable.message, timeOut: timeout});
		}
		if(!this.validation.ReservationAvailable.isValid.call(this)) {
			hasError = true; timeout += 2000;
			this.onErrorHandler({type: "warning", text: this.validation.ReservationAvailable.message, timeOut: timeout});
		}
		return hasError;
	}

	onErrorHandler(notification : {id ?: string, isNew ?: boolean, type:string, text:string, timeOut?: number}) {
		this.notificationService.add(notification);
		this.isPromising = false;
	}

	onSaveComplete: any;

	constructor(
			@Inject('entityTypeEntityService') private entityTypeEntityService: EntityTypeService,
			@Inject('deleteTemplateByPerformance') private deleteTemplateByPerformance: TemplateService,
			@Inject('copyVenueTemplateService') private copyVenueTemplateService: PerformanceService,
			@Inject('performanceEntityService') private performanceEntityService: EntityService,
			@Inject('eventEntityService') private eventEntityService: EntityService,
			@Inject('accessIntegrationTypeService') private accessIntegrationTypeService: EntityService,
			private entityTypeService: EntityTypeService,
			private entityService: EntityService,
			private performanceService: PerformanceService,
			private performancePerformerService: PerformancePerformerService,
			private performerService: PerformerService,
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
        	private headerTitleService: HeaderTitleService
	) { }

	ngOnInit() {
		this.headerTitleService.setTitle('Performanslar');
		let role: string = this.route.snapshot.data["role"];
		if(role) this.role = role;

		let enumTranslatorPipe = new EnumTranslatorPipe();
		let statusKeys = Object.keys(PerformanceStatus);
		statusKeys = statusKeys.splice(0, statusKeys.length/2);
		this.statusList = [];
		for(let key of statusKeys){
			this.statusList.push({value: parseInt(key), text: enumTranslatorPipe.transform(PerformanceStatus[key])});
		}

		this.entityTypeDataHandler();

		this.hoursRange = [];
		this.hoursRange.push({value: 0, text: "Süre Seçin", disabled:true});
		this.hoursRange.push({value: 4*60, text: "4 saat"});
		this.hoursRange.push({value: 12*60, text: "12 saat"});
		this.hoursRange.push({value: 24*60, text: "1 gün"});
		this.hoursRange.push({value: 2*24*60, text: "2 gün"});
		this.hoursRange.push({value: 4*24*60, text: "4 gün"});
		this.hoursRange.push({value: 7*24*60, text: "1 hafta"});

		// for(var i: number = 0; i < 25; i++) {
		// 	this.hoursRange.push({value: i*60, text: i + " Saat"}); //Dakika üzerinden hesaplanıyor
		// }
	}

	isValidDate(value: string):boolean {
		return moment(value).isValid();
	}

	entityTypeDataHandler() {
		this.entityTypeEntityService.data.subscribe( result => {
			if(result && result[0]) {
				this.entityTypeId = result[0].Id;

				this.attributeTypesServiceDataHandler();
				this.firmServiceDataHandler();
				this.accessIntegrationTypeServiceDataHandler();
				this.setPerformance();
			}
		});

		this.entityTypeEntityService.setCustomEndpoint('GetAll');
		this.entityTypeEntityService.fromEntity('AEntityType').where('EntityTypeCode', '=', "'PER'").page(0).take(1).executeQuery();
	}

	setPerformance() {
		this.eventEntityService.setCustomEndpoint('GetAll');
		this.eventEntityService.data.subscribe( entities => {
			if(this.eventSearchBox) {
				let result:{}[] = [];
				entities.forEach( event => {
					result.push({
						id: event.Id,
						title: event.Localization.Name,
						icon: "event",
						params: {event: event}
					})
				});

				this.eventSearchBox.searchResults = Observable.of([{
					title: "ARAMA SONUÇLARI",
					list: result
				}]);
			}
		});

		this.performanceEntityService.setCustomEndpoint('GetAll');
		this.performanceEntityService.data.subscribe(entities => {
			if(entities && entities[0]) {
				if(!this.performance) this.performance = new Performance(entities[0]);
				this.promises.performance.old = new Performance(entities[0]);
				console.log(this.performance);
				if(!this.performance) return;

				this.template = this.performance.VenueTemplate;
				if(this.template) this.venue = this.template.Venue;

				this.flags.PublishDateFieldOn = this.performance.PublishDate != null;
				if(this.performance.ReservationAvailable && this.performance.ReservationExpirationType == 0) this.performance.ReservationExpirationType = 1;
				if(this.performance.IsInviteFriendAvailable && this.performance.InviteFriendExpirationType == 0) this.performance.InviteFriendExpirationType = 1;
				if(this.performance.AccessIntegrationTypeId == null) this.performance.AccessIntegrationTypeId = 0;
				
				this.getLocalization();
				this.dateChangeHandler(this.performance.Date, "Date");
				this.dateChangeHandler(this.performance.EndDate, "EndDate");

				this.performancePerformersServiceDataHandler();
				this.resetPerformers(true);

				this.attributeServiceDataHandler();
				this.resetAttributes(true);

				this.entityFirmServiceDataHandler();
				this.resetSponsors(true);

				this.isLoading = false;
				this.changeDetector.detectChanges();
			}
		});

		if(this.isEditMode && this.route.snapshot.params && this.route.snapshot.params && this.route.snapshot.params["id"]){
			let id = this.route.snapshot.params["id"];
			this.isLoading = true;
			this.performanceEntityService
				.fromEntity('EPerformance')
				.where('Id', '=',  id)
				.expand(['Localization'])
				.expand(['VenueTemplate', 'Localization'])
				.expand(['VenueTemplate', 'Venue', 'Localization'])
				.expand(['VenueTemplate', 'Venue', 'Town', 'City', 'Country', 'Localization'])
				.expand(['Event', 'Localization'])
				.expand(['Products'])
				.take(1)
				.page(0)
				.executeQuery();
		}else{
			this.performance = new Performance({
				//"VenueTemplateId": 0,
				"Status": 4,
				//"PublishDate": moment().toISOString(),
				//"SalesBeginDate": "2017-02-28T19:45:20.292Z",
				//"SalesEndDate": "2017-02-28T19:45:20.292Z",
				"Code": "001",
				//"Date": "2017-02-28T19:45:20.292Z",
				"IsEnabled": true,
				"PurchaseTimeSeconds": 300,
				"IsSeatSelectionEnabled": true,
				"IsSeason": false,
				//"SeasonalPerformanceId": 0,
				//"Images": "string",
				"ReservationAvailable": false,
				//"NoExpire": true,
				"ReservationExpirationType": 0,
				// "ReservationExpirationTime": 0,
				"PerformanceId": null,
				"IsInviteFriendAvailable": false,
				"InviteFriendExpirationType": 0,
				"AccessIntegrationTypeId": 0,
				"IsAccessIntegrationActive": false,
				"IsTicketForwardingAvailable": true,
				"IsGenerateBarcodeAvailable": true,
				//"SuspensionReason": "",
				//"CancellationReason": "",
				// "Localization": {
				// 	"Tr": {
				// 	//"Name": "string",
				// 	//"ShortName": "string",
				// 	// "Description": "",
				// 	// "StatusText": ""
				// 	},
				// 	"En": {
				// 	//"Name": "string",
				// 	//"ShortName": "string",
				// 	// "Description": "",
				// 	// "StatusText": ""
				// 	}
				// }
			});
			this.promises.performance.old = new Performance(this.performance);
		}
		this.changeDetector.detectChanges
	}

	getLocalization() {
		if(this.performance) {
			this.performanceService.flushCustomEndpoint();
			this.performanceService.find(this.performance.Id, true);
			this.performanceService.data.subscribe( result => {
				if(result && result[0]) {
					this.performance.setLocalization(result[0]["Localization"]);
					this.titleChangeHandler(this.performance.Localization["Name"]);
					this.descriptionChangeHandler(this.performance.Localization["Description"]);
				}
			});
		}
	}

	performancePerformersServiceDataHandler() {
		if(!this.performance || !this.performance.Id) return;
		this.performancePerformerService.data.subscribe( result => {
			if(result) {
				this.promises.performers.old = [];
				this.promises.performers.new = [];
				this.performers = [];

				let performancePerformer: PerformancePerformer;
				result.forEach( performancePerformerData => {
					performancePerformer = new PerformancePerformer(
						{
							"Id": performancePerformerData.Id,
							"PerformanceId": performancePerformerData.PerformanceId,
							"PerformerId": performancePerformerData['Performer'].Id,
							"BeginDate": '2017-02-17T18:02:47.381Z',
							"EndDate": '2017-02-17T18:02:47.381Z',
							"Info": ''
						}
					);
					this.promises.performers.old.push(performancePerformer);
					this.promises.performers.new.push(performancePerformer);

					this.performers.push(new Performer({
						Id: performancePerformerData['Performer'].Id,
						Name: performancePerformerData['Performer'].PerformerName,
						Images: performancePerformerData['Performer'].Images
					}));
					console.log("performance perfomer : ", performancePerformer);
				});
			}
		})
	}

	resetPerformers(flushQuery:boolean = false) {
		if(this.promises.performers.saved.create && this.promises.performers.saved.update && this.promises.performers.saved.delete) {
			this.promises.performers.saved = {create: false, update: false, delete: false};
			this.promises.performance.saved.performers = true;
			this.checkSaved();
			flushQuery = true;
		}
		if(flushQuery) {
			if(this.performance && this.performance.Id) {
				this.performancePerformerService.setCustomEndpoint('GetPerformancePerformerList');
				this.performancePerformerService.query({pageSize: 20}, [{key: 'performanceId', value: this.performance.Id}]);
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
		if(!this.performance || !this.performance.Id) return;

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

					attributeData = entityAttributeData["AAttribute"];
					attribute = {
						name:attributeData.Id.toString(),
						label: attributeData.Name,
						type: {name: attributeData.AttributeTypeId.toString()},
						extraFieldType: entityAttributeData && entityAttributeData.Value ? "fuzzy" : null,
						extraFieldValue: entityAttributeData && entityAttributeData.Value ? entityAttributeData.Value : 0,
						params: {entityAttribute: entityAttribute, attribute: new Attribute(attributeData)}
					};
					if(attribute["extraFieldValue"]) attribute["label"] += " [ <i>f:</i><span>" + attribute["extraFieldValue"] + "</span>]"

					this.attributes.push(attribute);
				});
			}
		});
	}

	resetAttributes(flushQuery:boolean = false) {
		if(this.promises.attributes.saved.create && this.promises.attributes.saved.update && this.promises.attributes.saved.delete) {
			this.promises.attributes.saved = {create: false, update: false, delete: false};
			this.promises.performance.saved.attributes = true;
			this.checkSaved();
			flushQuery = true;
		}
		if(flushQuery) {
			if(this.performance && this.performance.Id) {
				this.entityAttributeService.setCustomEndpoint('GetEntityAttributeList');
				this.entityAttributeService.query({pageSize: 50, filter: [{filter:'EntityId eq ' + this.performance.Id + ' and EntityTypeId eq '+this.entityTypeId+' and IsActive eq true'}]});
			}
		}
	}

	firmServiceDataHandler() {

		this.firmPresets = null;

		this.firmService.data.subscribe(response => {
			if (response.length > 0) {
				let result = []
				for (let firm of response) {
					result.push({
						id: firm['Id'],
						title: firm['Name'],
						icon: "vpn_key",
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

	accessIntegrationTypeServiceDataHandler() {
		this.accessIntegrationTypeService.setCustomEndpoint('GetAll');
		this.accessIntegrationTypeService
			.fromEntity('SAccessIntegrationType')
			.page(0).take(10000).executeQuery();

		this.accessIntegrationTypeService.data.subscribe(result => {
			if (result.length > 0) {
				this.accessIntegrationTypes = [];
				this.accessIntegrationTypes.push({text: "Varsayılan Uygulama", value: 0});
				result.forEach( item => this.accessIntegrationTypes.push({text: item.Name, value: item.Id }));
			} else {
				this.accessIntegrationTypes = null;
			}
		});
	}

	entityFirmServiceDataHandler() {
		if(!this.performance || !this.performance.Id) return;

		let entityFirm: EntityFirm;
		let firm: {id: any, name: string, shortName: string};
		this.entityFirmService.data.subscribe(result => {
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

				if(entityFirm.Type == 2){
					this.promises.promoters.old.push(entityFirm);
					this.promises.promoters.new.push(entityFirm);
					this.promoters.push({
						id: firm.id,
						name: firm.name,
						type: entityFirm.SubType,
						params: {entityFirm: entityFirm, firm: firm}
					});
				}else if(entityFirm.Type == 3) {
					this.promises.sponsors.old.push(entityFirm);
					this.promises.sponsors.new.push(entityFirm);
					this.sponsors.push({
						id: firm.id,
						name: firm.name,
						type: entityFirm.SubType,
						params: {entityFirm: entityFirm, firm: firm}
					});
				}
			});
		});
	}

	resetSponsors(flushQuery:boolean = false) {

		if(this.promises.sponsors.saved.create && this.promises.sponsors.saved.update && this.promises.sponsors.saved.delete) {
			this.promises.sponsors.saved = {create: false, update: false, delete: false};
			this.promises.performance.saved.sponsors = true;
			this.checkSaved();
			flushQuery = true;
		}
		if(flushQuery) {
			if(this.performance && this.performance.Id) {
				this.entityFirmService.setCustomEndpoint('GetEntityFirmList');
				this.entityFirmService.query({page:0, pageSize:100, filter: [{ filter: 'PerformanceId eq ' + this.performance.Id }] });
			}
		}
	}

	resetPromoters(flushQuery:boolean = false) {
		if(this.promises.promoters.saved.create && this.promises.promoters.saved.update && this.promises.promoters.saved.delete) {
			this.promises.promoters.saved = {create: false, update: false, delete: false};
			this.promises.performance.saved.promoters = true;
			this.checkSaved();
			flushQuery = true;
		}
		if(flushQuery) {
			if(this.performance && this.performance.Id) {
				this.entityFirmService.setCustomEndpoint('GetEntityFirmList');
				this.entityFirmService.query({page:0, pageSize:100, filter: [{ filter: 'PerformanceId eq ' + this.performance.Id }] });
			}
		}
	}

	titleChangeHandler(value) {
		if(!this.performance) return;
		this.performance.set("Name", value, true);
		this.performance.set("ShortName", value, true);
	}

	performersChangeHandler(event) {
		if(!event && event.length == 0) return;
		this.promises.performers.new = [];
		let performancePerformer: PerformancePerformer;

		event.forEach(item => {
			performancePerformer = this.promises.performers.old.find( performancePerformerItem => item.Id == performancePerformerItem.PerformerId);
			if(!performancePerformer) {
				performancePerformer = new PerformancePerformer(
					{
						"PerformanceId": this.performance.Id,
						"PerformerId": item.Id,
						"BeginDate": '2017-02-17T18:02:47.381Z',
						"EndDate": '2017-02-17T18:02:47.381Z',
						"Info": ''
					}
				);
			}
			this.promises.performers.new.push(performancePerformer);
		});
	}

	checkHandler(value, name:string, target: string = "performance") {
		this[target][name] = value;
		if(!this.performance) return;
		switch(name) {
			case 'PublishDateFieldOn':
				 this.performance.PublishDate = value ? moment().toISOString() : null;
			break;
			case 'ReservationAvailable':
				if(this.performance) {
					this.performance.set('ReservationExpirationType', value ? 1 : 0);
					if(!value) this.performance.set('ReservationExpirationTime', 0);
				}
			break;
			case 'IsInviteFriendAvailable':
				if(this.performance) {
					this.performance.set('InviteFriendExpirationType', value ? 1 : 0);
					if(!value) this.performance.set('InviteFriendExpirationTime', 0);
				}
			break;
		}
	}

	inputChangeHandler(value, name:string, target: string = "performance") {
		switch(name) {
			case "PurchaseTimeSeconds":
				if(this.performance) this.performance.PurchaseTimeSeconds = parseInt(value);
			break;
			default:
				this[target][name] = value;
				break;
		}
		this.changeDetector.detectChanges();
	}

	dateChangeHandler(value, name){
		if(!this.performance) return;
		if(this.performance) this.performance.set(name, value);
		if(this.performance.EndDate && moment(this.performance.Date) >= moment(this.performance.EndDate)) {
			this.notificationService.add({type: "warning", text: "Başlangıç tarihi bitiş tarihinden büyük. Bitiş tarihini yeniden giriniz."})
			this.performance.EndDate = null;
		}
		this.changeDetector.detectChanges();
	}

	selectChangeHandler(value, name) {
		switch(name) {
			default:
				if(this.performance) this.performance.set(name, parseInt(value));
			break;
		}
	}

	photoChangeHandler(event) {
		if(this.performance) this.performance.set('Images', event.data || "");
	}

	attributesChangeHandler(event: {name: string, params: {entityAttribute?: EntityAttribute, attribute?: Attribute}}[]) {
		if(event) {
			this.promises.attributes.new = [];
			let entityAttribute:EntityAttribute;
			event.forEach( attributeData => {
				entityAttribute = this.promises.attributes.old.find( item => item.AttributeId.toString() == attributeData.name);
				if(!entityAttribute) {
					entityAttribute = new EntityAttribute({
						AttributeId: attributeData.params.attribute.Id || attributeData.params.attribute["key"],
						EntityTypeId: this.entityTypeId,
						EntityId: this.performance.Id,
						Value: attributeData["extraFieldValue"] ? parseInt(attributeData["extraFieldValue"]) : 0,
						StartDate: "2017-02-17T18:02:47.381Z",
						ExpireDate: "2017-02-28T18:02:47.381Z",
						IsActive: true
					});
				}
				//entityAttribute.Value = attributeData["extraFieldValue"] ? parseInt(attributeData["extraFieldValue"]) : 0;
				this.promises.attributes.new.push(entityAttribute);
			});
		}
	}

	attributesActionHandler(event) {
		switch(event.action) {
			case "remove":
				this.attributesChangeHandler(this.attributes);
			break;
		}
	}

	venueSelectChangeHandler(event) {
		this.isTemplateSelected = false;
		this.venue = event.venue;
		this.template = event.template;
		if(this.template) {
			this.performance.VenueTemplateId = this.template.Id;
			this.isTemplateSelected = true;
		}

		// switch(event.params.action) {
		// 	case "select":
		// 		this.isTemplateSelected = true;
		// 	break;
		// 	case "edit":
		// 		this.onSaveComplete = this.gotoVenueEditor;
		// 		this.savePerformance();
		// 	break;
		// }
	}

	gotoVenueEditor(){
		this.onSaveComplete = null;
		if(this.template) {
			this.router.navigate(['venue', this.venue.Id,'template','create'], {queryParams: { 'venueTemplateId': this.template.Id, performanceId: this.performance.Id}});
		}else{
			this.router.navigate(['venue', this.venue.Id,'template','create'], {queryParams: { performanceId: this.performance.Id}});
		}
	}

	gotoVenueCreate(){
		this.router.navigate(['venue', 'create']);
	}

	venueSelectActionHandler(event) {
		switch(event.action) {
			case "createNewVenue":
				if(!this.isValid){
					this.tetherService.dismiss();
					this.tetherService.confirm({
						title: "Performans Henüz Kaydedilmedi!",
						description: "Gerekli alanlar doldurulmadığı için kayıt işlemi yapılamadı. Yine de performansları kaydetmeden mekan oluşturmak istyor musunuz?",
						confirmButton: {label: "EVET"},
						dismissButton: {label: "VAZGEÇ"}
					}).then( result => {
						this.router.navigate(['venue', 'create']);
					}).catch(reason => {
						this.venueSelectBar.searchVenue();
					});
				}else{
					this.onSaveComplete = this.gotoVenueCreate;
					this.savePerformance();
				}
			break;
			case "editTemplate":
				this.onSaveComplete = this.gotoVenueEditor;
				this.savePerformance();
			break;
		}
	}

	sponsorChangeHandler(event:{params: {entityFirm?: EntityFirm, firm?: Firm}}[]) {
		if(!event && event.length == 0) return;
		this.promises.sponsors.new = [];
		let entityFirm: EntityFirm;
		event.forEach(item => {
			entityFirm = this.promises.sponsors.old.find( entityFirmItem => item["id"] == entityFirmItem.OwnerFirmId);
			if(!entityFirm) {
				entityFirm = new EntityFirm( {
					Type: item.params.firm['FirmType'] || 3,
					SubType: Math.max(item["type"], 0),
					PerformanceId: this.performance.Id,
					OwnerFirmId: item.params.firm['Id']
				});
			}
			this.promises.sponsors.new.push(entityFirm);
		});
	}

	sponsorActionHandler(event: {action: string, data: any[]}) {
		switch(event.action) {
			case "search":
				if(event.data && event.data.length > 0){
					this.firmService.setCustomEndpoint('GetFirmList');
					this.firmService.query({ page: 0, pageSize: 10, search: { key: 'Name', value: event.data } }, [{ key: 'isEvent', value: false }]);
				}
			break;
			case "createNewSponsor":
				alert("Bu bölüm henüz aktif değildir");
			break;
			case "patch":
				let entityFirm = this.promises.sponsors.new.find( item => item.OwnerFirmId == event.data['id']);
				if(entityFirm) entityFirm.SubType = Math.max(0, event.data['type']);
			break;
			case "exist":
				this.notificationService.add({text: '<b>'+event.data["name"] + '</b> daha önce eklendi!', type:'danger'});
			break;
		}
	}

	promoterChangeHandler(event:{params: {entityFirm?: EntityFirm, firm?: Firm}}[]) {
		if(!event && event.length == 0) return;
		this.promises.promoters.new = [];
		let entityFirm: EntityFirm;
		event.forEach(item => {
			entityFirm = this.promises.promoters.old.find( entityFirmItem => item["id"] == entityFirmItem.OwnerFirmId);
			if(!entityFirm) {
				entityFirm = new EntityFirm( {
					Type: item.params.firm['FirmType'] || 2,
					SubType: 0,
					PerformanceId: this.performance.Id,
					OwnerFirmId: item.params.firm['Id']
				});
			}
			this.promises.promoters.new.push(entityFirm);
		});
	}

	promoterActionHandler(event: {action: string, data: any[]}) {
		switch(event.action) {
			case "search":
				if(event.data && event.data.length > 0){
					this.firmService.setCustomEndpoint('GetFirmList');
					this.firmService.query({ page: 0, pageSize: 10, search: { key: 'Name', value: event.data } }, [{ key: 'isEvent', value: false }]);
				}
			break;
			case "createNewSponsor":
				alert("Bu bölüm henüz aktif değildir");
			break;
			case "patch":
				let entityFirm = this.promises.promoters.new.find( item => item.OwnerFirmId == event.data['id']);
				if(entityFirm) entityFirm.SubType = 0;
			break;
			case "exist":
				this.notificationService.add({text: '<b>'+event.data["name"] + '</b> daha önce eklendi!', type:'danger'});
			break;
		}
	}

	descriptionChangeHandler(event) {
		if(!this.performance) return;
		this.performance.set("Description", event, true);
	}

	actionHandler(event) {
		switch(event.action) {
			case "unsuspend":
				this.performance.SuspensionReason = null;
				this.performance.Status = 2;
				this.changeDetector.detectChanges();
			break;
			case "relinkEvent":
				this.openEventSearchBox();
			break;
			case "unlinkEvent":
				this.performance["Event"] = null;
			break;
			case "gotoEvent":
				this.tetherService.confirm({
					title: "Sayfadan ayrılmak üzeresiniz!",
					description: "Kaydetmediğiniz veriler silinecektir.",
					confirmButton: {label: "DEVAM", theme:"primary"},
					dismissButton: {label: "VAZGEÇ"}
				}).then(result => {
					this.router.navigate(["event", this.performance["Event"].Id]);
				}).catch(reoson=>{});
			break;
		}
	}

	openEventSearchBox() {
		let component: ComponentRef<ModalSearchBoxComponent> = this.resolver.resolveComponentFactory(ModalSearchBoxComponent).create(this.injector);
		this.eventSearchBox = component.instance;

		this.eventSearchBox.title = "Etkinlikle Bağla";
		this.eventSearchBox.presets = Observable.of([]);
		this.eventSearchBox.settings = {
			search: {
				placeholder: "Bağlamak istediğiniz etkinlik adını yazınız",
				feedback: {
					title: "Aramanız ile eşleşen etkinlik bulunamadı",
					description: "Arama kriterini değiştirerek yeniden deneyebilirsiniz.",
					//action: {action: "gotoLink", label: "YENİ PERFORMANS OLUŞTUR", params: {link: "performance/create"}},
					icon: {type: "svg", name: "event"}
				}
			}
		}

		this.eventSearchSubscription = this.eventSearchBox.searchEvent.subscribe( value => this.eventSearchHandler(value) );

		this.tetherService.modal(component, {
			escapeKeyIsActive: true,
		}).then(result => {
			this.performance["Event"] = new Event(result["params"]["event"]);
			this.eventSearchBoxCloseHandler();
		}).catch( reason => {
			this.eventSearchBoxCloseHandler();
		});
	}

	eventSearchHandler(value) {
		this.eventEntityService
			.fromEntity('EEvent')
			.search('Localization/Name', value)
			.expand(['Localization'])
			.page(0)
			.executeQuery();
	}

	eventSearchBoxCloseHandler() {
		this.eventSearchBox = null;
		if(this.eventSearchSubscription) this.eventSearchSubscription.unsubscribe();
		this.changeDetector.detectChanges();
	}

	suspendEvent(){
		this.tetherService.confirm({
			title: "Performansı ertelemek istediğinizden emin misiniz?",
			description: "Bu işlem geri alınabilir bir işlemdir.",
			feedback: {label: "ERTELEME SEBEBİ", required: true},
			confirmButton: {label: "ERTELE", theme:"light"},
			dismissButton: {label: "VAZGEÇ"}
		}).then(result => {
			this.performance.SuspensionReason = result["feedback"];
			this.performance.Status = 6;
			console.log("performance status:",this.performance.Status)
		}).catch(reoson=>{});
	}

	cancelEvent(){
		this.tetherService.confirm({
			title: "Performansı iptal etmek istediğinizden emin misiniz?",
			description: "<b>DİKKAT!</b> Bu işlem geri alınamaz.",
			feedback: {label: "İPTAL SEBEBİ", required: true},
			confirmButton: {label: "İPTAL"},
			dismissButton: {label: "VAZGEÇ"}
		}).then(result => {
			this.performance.CancellationReason = result["feedback"];
			this.performance.Status = 5;
			this.savePerformance();
		}).catch(reoson=>{});
	}

	resaleEvent() {
		this.tetherService.confirm({
			title: "Performansı tekrar satışa açmak istediğinizden emin misiniz?",
			confirmButton: {label: "SATIŞA AÇ"},
			dismissButton: {label: "VAZGEÇ"}
		}).then(result => {
			this.performanceService.setCustomEndpoint("ReOpenForSale");
			this.performanceService.create({PerformanceId: this.performance.Id}).subscribe(result => {
				this.notificationService.add({type: "success", text: "Performans başarıyla satışa açılmıştır."});
				this.router.navigate(['performance', this.performance.Id]);
			}, error => {
				this.notificationService.add({type: "danger", text: "İşlem Başarısız! "+error.Message});
			});
		}).catch(reoson=>{});
	}

	submitPerformance(event) {
		if(!this.showValidationError()) this.savePerformance();
	}

	exit(event) {
		this.router.navigate(["performances"]);
	}

	savePerformance() {
		this.isPromising = true;
		this.performance.EventId = this.performance["Event"] ? this.performance["Event"].Id : null;
		if(this.performance.AccessIntegrationTypeId == 0) this.performance.AccessIntegrationTypeId = null;
		this.promises.performance.new = this.performance;
		if(this.performance.Id) {
			this.performanceService.update(this.performance.getRawData()).subscribe(
				result => {
					this.saveRelations();
				},
				error => {
					this.onErrorHandler({text: `<b>Performans kaydedilemedi</b> Lütfen bütün gerekli alanları doldurun.<br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
				},
				complete => {

				}
			)
		}else{
			this.performanceService.create(this.performance.getRawData()).subscribe(
				result => {
					this.performance.Id = result;
					this.saveRelations(true);
				},
				error => {
					this.onErrorHandler({text: `<b>Performans kaydedilemedi</b> Lütfen bütün gerekli alanları doldurun.<br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
				},
				complete => {

				}
			)
		}
	}

	saveRelations(isNew: boolean = false) {
		this.savePerformers(isNew);
		this.saveAttributes(isNew);
		this.saveSponsors(isNew);
		this.savePromoters(isNew);
		this.saveCopyVenueTemplate(isNew);
	}

	saveCopyVenueTemplate(isNew:boolean) {
		if((isNew || this.isTemplateSelected) && this.performance) {
			this.deleteTemplateByPerformance.setCustomEndpoint("DeleteTemplateByPerformance");
			console.log("========> DeleteTemplateByPerformance() <========")
			this.deleteTemplateByPerformance.delete({"performanceId": this.performance.Id}).subscribe(result => {
				console.log("========> CopyVenueTemplate() <========")
				this.copyVenueTemplateService.setCustomEndpoint("CopyVenueTemplate");
				this.copyVenueTemplateService.create({"PerformanceId": this.performance.Id,"VenueTemplateId": this.template.Id}).subscribe(result => {
					console.log("Template Kopyalandı : ", result);
					this.promises.performance.saved.copyVenueTemplate = true;
					this.checkSaved();
				}, error => {
					this.notificationService.add({type: "danger", text: error.Message});
				});
			}, error => {
				this.notificationService.add({type: "danger", text: error.Message});
			});
		}else{
			this.promises.performance.saved.copyVenueTemplate = true;
			this.checkSaved();
		}
	}

	savePerformers(isNew: boolean = false){
		if(isNew && this.performance) { this.promises.performers.new.map( item => item.PerformanceId = this.performance.Id) };
		let willUpdate: PerformancePerformer[] = [];
		let willDelete: PerformancePerformer[] = [].concat(this.promises.performers.old);
		let willCreate: PerformancePerformer[] = [].concat(this.promises.performers.new);
		let sourceList: PerformancePerformer[] = [].concat(this.promises.performers.new);

		let item: PerformancePerformer;
		let matchedItem: PerformancePerformer;
		let action: string;
		while(sourceList.length > 0) {
			item = sourceList.shift();
			matchedItem = willDelete.find( performancePerformer => item.Id == performancePerformer.Id);
			if(matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(matchedItem), 1);
				willUpdate.push(item);
			}
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);

		if(willCreate.length > 0) {
			this.performancePerformerService.setCustomEndpoint('PostAll');
			this.performancePerformerService.create(willCreate).subscribe(
				response => {
					this.promises.performers.saved.create = true;
					this.resetPerformers();
				},
				error => {
					console.log("error : ", error);
				}
			);
		}else{
			this.promises.performers.saved.create = true;
			this.resetPerformers();
		}

		if(willUpdate.length > 0) {
			this.performancePerformerService.setCustomEndpoint('PutAll');
			this.performancePerformerService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.performers.saved.update = true;
					this.resetPerformers();
				}, error => {
					console.log(JSON.stringify(error));
				}
			);
		}else {
			this.promises.performers.saved.update = true;
			this.resetPerformers();
		}

		if(willDelete.length > 0) {
			let total: number = willDelete.length;
			let index: number = 0;
			willDelete.forEach(performancePerformer => {
				this.performancePerformerService.setCustomEndpoint( performancePerformer.PerformanceId + '/' + performancePerformer.PerformerId);
				this.performancePerformerService.delete('').subscribe(result => {
					index++;
					if(total == index) {
						this.promises.performers.saved.delete = true;
						this.resetPerformers();
					}
				});
			});
		}else{
			this.promises.performers.saved.delete = true;
			this.resetPerformers();
		}
	}

	saveAttributes(isNew: boolean = false) {
		if(isNew && this.performance) { this.promises.attributes.new.map( item => item.EntityId = this.performance.Id) };
		let willUpdate: EntityAttribute[] = [];
		let willDelete: EntityAttribute[] = [].concat(this.promises.attributes.old);
		let willCreate: EntityAttribute[] = [].concat(this.promises.attributes.new);
		let sourceList: EntityAttribute[] = [].concat(this.promises.attributes.new);

		let item: EntityAttribute;
		let matchedItem: EntityAttribute;
		let action: string;

		while(sourceList.length > 0) {
			item = sourceList.shift();

			matchedItem = willDelete.find( entityAttribute => {
				return item.AttributeId == entityAttribute.AttributeId;
			});
			if(matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(willCreate.find(createItem => matchedItem.AttributeId == createItem.AttributeId)), 1);
				willUpdate.push(item);
			}
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);

		if(willCreate.length > 0) {
			this.entityAttributeService.setCustomEndpoint('PostAll');
			this.entityAttributeService.create(willCreate).subscribe(
				response => {
					this.promises.attributes.saved.create = true;
					this.resetAttributes();
				},
				error => {
					console.log("error : ", error);
				}
			);
		}else {
			this.promises.attributes.saved.create = true;
			this.resetAttributes();
		}

		if(willUpdate.length > 0) {
			this.entityAttributeService.setCustomEndpoint('PutAll');
			this.entityAttributeService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.attributes.saved.update = true;
					this.resetAttributes();
				}, error => {
					console.log(JSON.stringify(error));
				}
			);
		}else {
			this.promises.attributes.saved.update = true;
			this.resetAttributes();
		}

		if(willDelete.length > 0) {
			willDelete.map( item => item.IsActive = false);
			this.entityAttributeService.setCustomEndpoint('PutAll');
			this.entityAttributeService.update(willDelete, 'put').subscribe(
				response => {
					this.promises.attributes.saved.delete = true;
					this.resetAttributes();
				}, error => {
					console.log(JSON.stringify(error));
				}
			);
		}else{
			this.promises.attributes.saved.delete = true;
			this.resetAttributes();
		}
	}

	saveSponsors(isNew: boolean = false) {
		if(isNew && this.performance) { this.promises.sponsors.new.map( item => item.PerformanceId = this.performance.Id) };
		let willUpdate: EntityFirm[] = [];
		let willDelete: EntityFirm[] = [].concat(this.promises.sponsors.old);
		let willCreate: EntityFirm[] = [].concat(this.promises.sponsors.new);
		let sourceList: EntityFirm[] = [].concat(this.promises.sponsors.new);

		let item: EntityFirm;
		let matchedItem: EntityFirm;
		while(sourceList.length > 0) {
			item = sourceList.shift();
			matchedItem = willDelete.find( entityFirm => { return item.Id == entityFirm.Id });
			if(matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(willCreate.find(createItem => matchedItem.OwnerFirmId == createItem.OwnerFirmId)), 1);
				willUpdate.push(item);
			};
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);


		if(willCreate.length > 0) {
			this.entityFirmService.setCustomEndpoint('PostAll');
			this.entityFirmService.create(willCreate).subscribe(
				response => {
					this.promises.sponsors.saved.create = true;
					this.resetSponsors();
				},
				error => {
					console.log("error : ", error);
				}
			);
		}else {
			this.promises.sponsors.saved.create = true;
			this.resetSponsors();
		}

		if(willUpdate.length > 0) {
			this.entityFirmService.setCustomEndpoint('PutAll');
			this.entityFirmService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.sponsors.saved.update = true;
					this.resetSponsors();
				}, error => {
					console.log(JSON.stringify(error));
				}
			);
		}else {
			this.promises.sponsors.saved.update = true;
			this.resetSponsors();
		}

		if(willDelete.length > 0) {
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

	savePromoters(isNew: boolean = false) {
		if(isNew && this.performance) { this.promises.promoters.new.map( item => item.PerformanceId = this.performance.Id) };
		let willUpdate: EntityFirm[] = [];
		let willDelete: EntityFirm[] = [].concat(this.promises.promoters.old);
		let willCreate: EntityFirm[] = [].concat(this.promises.promoters.new);
		let sourceList: EntityFirm[] = [].concat(this.promises.promoters.new);

		let item: EntityFirm;
		let matchedItem: EntityFirm;
		while(sourceList.length > 0) {
			item = sourceList.shift();
			matchedItem = willDelete.find( entityFirm => { return item.Id == entityFirm.Id });
			if(matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(willCreate.find(createItem => matchedItem.OwnerFirmId == createItem.OwnerFirmId)), 1);
				willUpdate.push(item);
			};
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);


		if(willCreate.length > 0) {
			this.entityFirmService.setCustomEndpoint('PostAll');
			this.entityFirmService.create(willCreate).subscribe(
				response => {
					this.promises.promoters.saved.create = true;
					this.resetPromoters();
				},
				error => {
					this.onErrorHandler({text: `<b>Organizatörler kaydedilemedi</b><br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
				}
			);
		}else {
			this.promises.promoters.saved.create = true;
			this.resetPromoters();
		}

		if(willUpdate.length > 0) {
			this.entityFirmService.setCustomEndpoint('PutAll');
			this.entityFirmService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.promoters.saved.update = true;
					this.resetPromoters();
				}, error => {
					this.onErrorHandler({text: `<b>Organizatörler kaydedilemedi</b><br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
				}
			);
		}else {
			this.promises.promoters.saved.update = true;
			this.resetPromoters();
		}

		if(willDelete.length > 0) {
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
		if(this.promises.performance.saved.performers && this.promises.performance.saved.attributes && this.promises.performance.saved.sponsors && this.promises.performance.saved.promoters && this.promises.performance.saved.copyVenueTemplate) {
			this.promises.performance.saved = {performers: false, attributes: false, sponsors: false, promoters: false, copyVenueTemplate: false};
			this.notificationService.add({text: `<b>${this.performance.get("Name", true)}</b> performansı başarıyla kaydedildi.`, type:'success'});
			this.isPromising = false;
			if(this.onSaveComplete != null) {
				this.onSaveComplete();
			}else{
				this.router.navigate(['performance', this.performance.Id]);
			}
		}
	}

	refreshBarcode() {

		this.tetherService.confirm({
			title: "Barkodu Yenilemek İstediğinize Emin misiniz ?",
			description: "",
			confirmButton: {label: "EVET"},
			dismissButton: {label: "VAZGEÇ"}
		}).then( result => {
			this.barcodePromising = true;
			this.barcodRefreshWithParams(this.performance.Id).subscribe(result => {
				this.barcodePromising = false;
				this.notificationService.add({text:'Erişim Kodu Sıfırlanmıştır',type:'success'});
			},error => {
				if(error) {
					this.barcodePromising = false;
					this.notificationService.add({text:error['Message'],type:'danger'});
				}
				
			})
		}).catch(reason => {
			this.barcodePromising = false;
		});		
	}

	barcodRefreshWithParams(performanceId) {
		this.performanceService.flushCustomEndpoint();
		this.performanceService.setCustomEndpoint('ResetBarcode');
		let subs = this.performanceService.postWithQueryParams({},{performanceId:performanceId})
		subs.connect();
		return subs;
	}

}
