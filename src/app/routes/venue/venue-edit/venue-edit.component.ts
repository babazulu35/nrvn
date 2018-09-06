import { ModalSearchBoxComponent } from './../../../modules/common-module/components/modal-search-box/modal-search-box.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { TextInputComponent } from './../../../modules/base-module/components/text-input/text-input.component';
import { EntityTypeService } from './../../../services/entity-type.service';
import { EntityService } from './../../../services/entity.service';
import { Venue } from './../../../models/venue';
import { HeaderTitleService } from './../../../services/header-title.service';
import { AttributeType } from './../../../models/attribute-type';
import { Component, ComponentFactory, Input, Output, ComponentFactoryResolver, Type, Injector, ViewContainerRef, OnInit, HostBinding, ComponentRef, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { VenueService } from '../../../services/venue.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { EntityFirmService } from '../../../services/entity-firm.service';
import { FirmService } from '../../../services/firm.service';
import { AttributeService } from '../../../services/attribute.service';
import { Attribute } from './../../../models/attribute';
import { AttributeTypeService } from '../../../services/attribute-type.service';
import { EntityAttributeService } from '../../../services/entity-attribute.service';
import { EntityAttribute } from '../../../models/entity-attribute';
import { EntityFirm } from '../../../models/entity-firm';
import { Firm } from '../../../models/firm';
import { NotificationService } from '../../../services/notification.service';


@Component({
    selector: 'app-venue-edit',
    templateUrl: './venue-edit.component.html',
    styleUrls: ['./venue-edit.component.scss'],
    entryComponents: [ModalSearchBoxComponent],
	providers: [
		{ provide: 'entityTypeEntityService', useClass: EntityService },
		{ provide: 'venueEntityService', useClass: EntityService },
		EntityTypeService, VenueService, FirmService, EntityFirmService, AttributeTypeService, EntityAttributeService, AttributeService]
})
export class VenueEditComponent implements OnInit {
	@ViewChild('lat') lat: TextInputComponent;
	@ViewChild('lon') lon: TextInputComponent;
	@ViewChild('weburl') weburl: TextInputComponent;
	@ViewChild('phone') phone: TextInputComponent;


	mapUrl = "http://maps.google.com/maps?q=<LATITUDE>,<LONGITUDE>";
	entityTypeId: number;
	venue: Venue;

    attributeTypes: {name:string, label: string, params:{attributeType: AttributeType}}[];
	attributes: {name: string, label: string, type:{name: string}, params: {attribute: Attribute}}[] = [];

	owners: {id: any, name: string, type?: any, params?: any}[];
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

	role: string = "create";
	isEditMode: boolean = false;
	isLoading: boolean;
	isPromising: boolean;

	promises: {
		venue: { name:string, old: any, new: any, saved: {attributes: boolean, owners: boolean} },
		attributes: { name: string, old: EntityAttribute[], new: EntityAttribute[], saved: {create: boolean, update: boolean, delete: boolean}  },
		owners: { name: string, old: EntityFirm[], new: EntityFirm[], saved: {create: boolean, update: boolean, delete: boolean} } } = {

		venue: { name: "event", old: [], new: [], saved: {attributes: false, owners: false}},
		attributes: { name: "attributes", old: [], new: [], saved: {create: false, update: false, delete: false} },
		owners: { name: "promoters", old: [], new: [], saved: {create: false, update: false, delete: false} }
	}

	validation: {
		VenueName: { isValid: any, message: string },
		TownId: { isValid: any, message: string },
		Lat: { isValid: any, message: string },
		Lon: { isValid: any, message: string },
		Latlon: { isValid: any, message: string },
		WebUrl: { isValid: any, message: string },
		Phone: { isValid: any, message: string },
	} = {
		VenueName: {
			message: "Mekan adı zorunludur.",
			isValid(): boolean {
				return this.venue && this.venue.isValid('Name',true);
			}
		},
		TownId: {
			message: "İl/İlçe seçimi zorunludur",
			isValid(): boolean {
				return this.venue && this.venue.TownId > 0;
			}
		},
		Latlon: {
			message: "Koordinat bilgisi zorunludur",
			isValid(): boolean {
				//return this.venue && this.lat && this.lat.formControl && this.lat.formControl.valid && this.lon && this.lon.formControl && this.lon.formControl.valid;
				return this.venue && this.venue.Location && this.venue.Location.Latitude.toString().length > 0 && this.venue.Location.Longitude.toString().length > 0;
			}
		},

		Lat: {
			message: "Enlem bilgisi zorunludur",
			isValid(): boolean {
				return this.lat && this.lat.value && this.lat.formControl && this.lat.formControl.valid;
			}
		},

		Lon: {
			message: "Boylam bilgisi zorunludur",
			isValid(): boolean {
				return this.lon && this.lon.value && this.lon.formControl && this.lon.formControl.valid;
			}
		},

		WebUrl: {
			message: "Web adresini doğru yazdığınızdan emin olun",
			isValid(): boolean {
				return this.weburl && this.weburl.value && this.weburl.value.length > 0 ? this.weburl.formControl && this.weburl.formControl.valid : true;
			}
		},

		Phone: {
			message: "Web adresini doğru yazdığınızdan emin olun",
			isValid(): boolean {
				return this.phone && this.phone.value && this.phone.value.length > 0 ? this.phone.formControl && this.phone.formControl.valid : true;
			}
		}
	};

	get isValid():boolean {
		if( this.venue && this.validation
			&& this.validation.VenueName.isValid.call(this)
			&& this.validation.TownId.isValid.call(this)
			&& this.validation.WebUrl.isValid.call(this)
			&& this.validation.Phone.isValid.call(this)
			&& this.validation.Lat.isValid.call(this)
			&& this.validation.Lon.isValid.call(this)
			){
			return true;
		}else{
			// if( this.venue && this.validation) console.log(this.validation.VenueName.isValid.call(this),
			// 	this.validation.TownId.isValid.call(this),
			// 	this.validation.WebUrl.isValid.call(this),
			// 	this.validation.Phone.isValid.call(this),
			// 	this.validation.Lat.isValid.call(this),
			// 	this.validation.Lon.isValid.call(this));
			//if(this.validation && this.venue) console.log(this.venue, this.validation.WebUrl.isValid.call(this));
			return false
		}
	};

	onErrorHandler(notification : {id ?: string, isNew ?: boolean, type:string, text:string, timeOut?: number}) {
		this.notificationService.add(notification);
		this.isPromising = false;
	}

    constructor(
		private entityTypeService: EntityTypeService,
		@Inject('entityTypeEntityService') private entityTypeEntityService: EntityService,
		@Inject('venueEntityService') private venueEntityService: EntityService,
        private venueService: VenueService,
        private route: ActivatedRoute,
        private router: Router,
        private injector: Injector,
        private authenticationService: AuthenticationService,
        private changeDetector: ChangeDetectorRef,
        private resolver: ComponentFactoryResolver,
		private viewContaner: ViewContainerRef,
		public tetherService: TetherDialog,
		private firmService: FirmService,
		private entityFirmService: EntityFirmService,
		private attributeTypeService: AttributeTypeService,
		private entityAttributeService: EntityAttributeService,
		private attributeService : AttributeService,
		private notificationService : NotificationService,
		private headerTitleService: HeaderTitleService
    ) {
    }

    ngOnInit() {
		this.headerTitleService.setTitle("Mekanlar");
		this.role = this.route.snapshot.data["role"];;
		this.isEditMode = this.role == "edit";

		this.entityTypeDataHandler();
    }

	entityTypeDataHandler() {
		this.entityTypeEntityService.data.subscribe( result => {
			if(result && result[0]) {
				this.entityTypeId = result[0].Id;

				this.attributeTypesServiceDataHandler();
				this.firmServiceDataHandler();
				this.setVenue();
			}
		});

		this.entityTypeEntityService.setCustomEndpoint('GetAll');
		this.entityTypeEntityService.fromEntity('AEntityType').where('EntityTypeCode', '=', "'VEN'").page(0).take(1).executeQuery();
	}

    setVenue() {
		if(this.isEditMode && this.route.snapshot.params && this.route.snapshot.params && this.route.snapshot.params["id"]){
			let id = this.route.snapshot.params["id"];
			this.isLoading = true;

			this.venueEntityService.data.subscribe( venues => {
				if(venues && venues[0]) {
					this.venue = new Venue(venues[0]);
					this.promises.venue.old = new Venue(this.venue);
					if(!this.venue) return;
					
					this.getLocalization();
/* 					this.titleChangeHandler(this.venue.Localization["Name"]);
					this.descriptionChangeHandler(this.venue.Localization["Description"]); */

					this.attributeServiceDataHandler();
					this.resetAttributes(true);

					this.entityFirmServiceDataHandler();
					this.resetOwners(true);
					
					//this.getLocalization();
					this.isLoading = false;
					this.changeDetector.detectChanges();
				}
			});

			this.venueEntityService.setCustomEndpoint('GetAll');
			this.venueEntityService.fromEntity('VVenue')
				.where('Id', '=', id)
				//.expand(['Location'])
				.expand(['Localization'])
      			.expand(['Town', 'City', 'Country', 'Localization'])
				.take(1).page(0).executeQuery();
		} else {
			this.venue = new Venue({
				//"Code": "string",
				//"TownId": 0,
				//"Type": 0,
				//"Logo": "string",
				//"Video": "string",
				//"Phone": "string",
				//"WebUrl": "string",
				//"SeatPlan": "string",
				//"Map": "string",
				"IsActive": true,
				"Location": {
					"Latitude": null,
					"Longitude": null
				},
				//"Latitude": 0,
				//"Longitude": 0,
				//"Images": "string",
/* 				"Localization": {
					"Name": null,
					"ShortName": null,
					"Description": null,
					"Address": null,
					"TransportInfo": null,
					"ParkingInfo": null,
					"Facebook": null,
					"Twitter": null,

					"Tr": {
						"Name": null,
						"ShortName": null,
						"Description": null,
						"Address": null,
						"TransportInfo": null,
						"ParkingInfo": null,
						"Facebook": null,
						"Twitter": null
					},
					"En": {
						"Name": null,
						"ShortName": null,
						"Description": null,
						"Address": null,
						"TransportInfo": null,
						"ParkingInfo": null,
						"Facebook": null,
						"Twitter": null
					}
				} */
				});

			this.promises.venue.old = new Venue(this.venue);
		}
		this.changeDetector.detectChanges;
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
		if(!this.venue || !this.venue.Id) return;

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
			this.promises.venue.saved.attributes = true;
			this.checkSaved();
			flushQuery = true;
		}
		if(flushQuery) {
			if(this.venue && this.venue.Id) {
				this.entityAttributeService.setCustomEndpoint('GetEntityAttributeList');
				this.entityAttributeService.query({pageSize: 50, filter: [{filter:'EntityId eq ' + this.venue.Id + ' and EntityTypeId eq '+this.entityTypeId+' and IsActive eq true'}]});
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

	entityFirmServiceDataHandler() {
		if(!this.venue || !this.venue.Id) return;

		let entityFirm: EntityFirm;
		let firm: {id: any, name: string, shortName: string};
		this.entityFirmService.data.subscribe(result => {
			this.owners = [];
			this.promises.owners.old = [];
			this.promises.owners.new = [];

			result.forEach( entityFirmData => {
				entityFirm = new EntityFirm(entityFirmData);
				firm = {
					id: entityFirm.OwnerFirmId,
					name: entityFirm.OwnerFirmDetail.Name,
					shortName: entityFirm.OwnerFirmDetail.ShortName
				};

				this.promises.owners.old.push(entityFirm);
				this.promises.owners.new.push(entityFirm);
				this.owners.push({
					id: firm.id,
					name: firm.name,
					type: entityFirm.SubType,
					params: {entityFirm: entityFirm, firm: firm}
				});

			})
		});
	}

/* 	titleChangeHandler(value) {
		if(!this.venue) return;
		if(!this.venue.Localization) this.venue.Localization = {};
		if(!this.venue.Localization.Tr) this.venue.Localization.Tr = {};
		if(!this.venue.Localization.En) this.venue.Localization.En = {};
		this.venue.Localization.Name = value;
		this.venue.Localization.ShortName = value;
		this.venue.Localization.Tr.Name = value;
		this.venue.Localization.Tr.ShortName = value;
		this.venue.Localization.En.Name = value;
		this.venue.Localization.En.ShortName = value;
	} */

	titleChangeHandler(value) {
		if(!this.venue) return;
		this.venue.set("Name", value, true);
		
	}	

	photoChangeHandler(event) {
		if(this.venue) this.venue.Images = event.data || "";
	}

	logoChangeHandler(event) {
		if(this.venue) this.venue.Logo = event.data || "";
	}

	townChangeHandler(event) {
		this.venue.TownId = parseInt(event["town"]);
		this.changeDetector.detectChanges();
	}

	inputChangeHandler(name: string, event) {
		if(!this.venue) return;
		switch(name) {
		  case "ShortName":
			  this.venue.set(name,event,true);
		  break;
		  case "Address":
		  	this.venue.set(name,event,true);
		  break;
		  case "Latitude":
			if(!this.venue.Location) this.venue.Location = {};
			this.venue.Location.Latitude = event;
		  break;
		  case "Longitude":
			if(!this.venue.Location) this.venue.Location = {};
			this.venue.Location.Longitude = event;
		  break;
		  default:
			this.venue[name] = event;
			break;
		}
		this.changeDetector.detectChanges();
	  }	

	descriptionChangeHandler(event) {
		if(!this.venue) return;
		this.venue.set("Description", event, true);
	}	
/* 	descriptionChangeHandler(event) {
		if(this.venue) {
			this.venue.Localization.Description = event;
			this.venue.Localization.Tr.Description = event;
			this.venue.Localization.En.Description = event;
		}
	} */

	resetOwners(flushQuery:boolean = false) {

		if(this.promises.owners.saved.create && this.promises.owners.saved.update && this.promises.owners.saved.delete) {
			this.promises.owners.saved = {create: false, update: false, delete: false};
			this.promises.venue.saved.owners = true;
			this.checkSaved();
			flushQuery = true;
		}
		if(flushQuery) {
			if(this.venue && this.venue.Id) {
				this.entityFirmService.setCustomEndpoint('GetEntityFirmList');
				this.entityFirmService.query({page:0, pageSize:100, filter: [{ filter: 'VenueId eq ' + this.venue.Id }] });
			}
		}
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
						EntityId: this.venue.Id,
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

	ownerChangeHandler(event:{params: {entityFirm?: EntityFirm, firm?: Firm}}[]) {
		if(!event && event.length == 0) return;
		this.promises.owners.new = [];
		let entityFirm: EntityFirm;
		event.forEach(item => {
			entityFirm = this.promises.owners.old.find( entityFirmItem => item["id"] == entityFirmItem.OwnerFirmId);
			if(!entityFirm) {
				entityFirm = new EntityFirm( {
					Type: item.params.firm['FirmType'] || 4,
					SubType: 0,
					VenueId: this.venue.Id,
					OwnerFirmId: item.params.firm['Id']
				});
			}
			this.promises.owners.new.push(entityFirm);
		});
	}

	ownerActionHandler(event: {action: string, data: any[]}) {
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
				let entityFirm = this.promises.owners.new.find( item => item.OwnerFirmId == event.data['id']);
				if(entityFirm) entityFirm.SubType = 0;
			break;
			case "exist":
				this.notificationService.add({text: '<b>'+event.data["name"] + '</b> daha önce eklendi!', type:'danger'});
			break;
		}
	}

	submitVenue(event) {
		this.saveVenue();
	}

	exit(event) {
		this.router.navigate(["venues"]);
	}

	saveVenue() {
		//if(this.venue.Status != 6 && this.venue.Status != 5) this.venue.Status = 4;
		this.isPromising = true;
		this.promises.venue.new = this.venue;
		if(this.venue.Id) {
			this.venueService.flushCustomEndpoint();
			delete this.venue["Type"];
			// delete this.venue["Latitude"];
			// delete this.venue["Longitude"];
			console.log(this.venue);
			this.venueService.update(this.venue.getRawData()).subscribe(
				result => {
					this.saveRelations();
				},
				error => {
					this.isPromising = false;
					this.onErrorHandler({text: `<b>Mekan kaydedilemedi</b> Lütfen bütün gerekli alanları doldurun.<br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
				},
				complete => {

				}
			)
		}else{
			this.venueService.flushCustomEndpoint();
			this.venueService.create(this.venue.getRawData()).subscribe(
				result => {
					this.venue.Id = result;
					this.saveRelations(true);
				},
				error => {
					this.isPromising = false;
					this.onErrorHandler({text: `<b>Mekan kaydedilemedi</b> Lütfen bütün gerekli alanları doldurun.<br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
				},
				complete => {

				}
			)
		}
	}

	saveRelations(isNew: boolean = false) {
		this.saveAttributes(isNew);
		this.saveOwners(isNew);
	}

	saveAttributes(isNew: boolean = false) {
		if(isNew && this.venue) { this.promises.attributes.new.map( item => item.EntityId = this.venue.Id) };
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
					this.onErrorHandler({text: `<b>Mekan tipleri kaydedilemedi</b><br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
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
					this.onErrorHandler({text: `<b>Mekan tipleri kaydedilemedi</b><br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
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
					this.onErrorHandler({text: `<b>Mekan tipleri silinemedi</b><br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
				}
			);
		}else{
			this.promises.attributes.saved.delete = true;
			this.resetAttributes();
		}
	}

	saveOwners(isNew: boolean = false) {
		if(isNew && this.venue) { this.promises.owners.new.map( item => item.VenueId = this.venue.Id) };
		let willUpdate: EntityFirm[] = [];
		let willDelete: EntityFirm[] = [].concat(this.promises.owners.old);
		let willCreate: EntityFirm[] = [].concat(this.promises.owners.new);
		let sourceList: EntityFirm[] = [].concat(this.promises.owners.new);

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
					this.promises.owners.saved.create = true;
					this.resetOwners();
				},
				error => {
					this.onErrorHandler({text: `<b>Sponsorlar kaydedilemedi</b><br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
				}
			);
		}else {
			this.promises.owners.saved.create = true;
			this.resetOwners();
		}

		if(willUpdate.length > 0) {
			this.entityFirmService.setCustomEndpoint('PutAll');
			this.entityFirmService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.owners.saved.update = true;
					this.resetOwners();
				}, error => {
					this.onErrorHandler({text: `<b>Sponsorlar kaydedilemedi</b><br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
				}
			);
		}else {
			this.promises.owners.saved.update = true;
			this.resetOwners();
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
			this.promises.owners.saved.delete = true;
			this.resetOwners();
		}else {
			this.promises.owners.saved.delete = true;
			this.resetOwners();
		}
	}

	checkSaved(){
		if(this.promises.venue.saved.attributes && this.promises.venue.saved.owners) {
			this.promises.venue.saved = {attributes: false, owners: false};
			this.notificationService.add({text: `${this.venue.get('Name',true)} mekanı başarıyla kaydedildi.`, type:'success'});
			this.router.navigate(['venue', this.venue.Id]);
			this.isPromising = false;
		}
	}

	getMapUrl(lat, lng){
		lat = parseFloat(lat);
		lng = parseFloat(lng);
		return this.mapUrl.replace("<LATITUDE>", lat).replace("<LONGITUDE>", lng);
	}

	getLocalization() {
		if(this.venue) {
			this.venueService.flushCustomEndpoint();
			this.venueService.find(this.venue.Id, true);
			this.venueService.data.subscribe( result => {
				if(result && result[0]) {
					console.log("Venue service result",result);
					this.venue.setLocalization(result[0]["Localization"]);
					this.titleChangeHandler(this.venue.Localization["Name"]);
					this.descriptionChangeHandler(this.venue.Localization["Description"]);
					
				}
			});
		}
	}
}
