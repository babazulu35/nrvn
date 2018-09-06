import { AuthenticationService } from './../../../../../services/authentication.service';
import { ActivatedRoute } from '@angular/router';

import { ProductFactory } from './../../../factories/product.factory';
import { EntityFirmService } from './../../../../../services/entity-firm.service';
import { PerformancePerformer } from './../../../../../models/performance-performer';

import { Router } from '@angular/router';
import { EntityAttributeService } from './../../../../../services/entity-attribute.service';
import { AttributeType } from './../../../../../models/attribute-type';
import { PerformanceFactory } from './../../../factories/performance.factory';
import { FirmService } from './../../../../../services/firm.service';
import { Observable } from 'rxjs/Observable';
import { EventService } from './../../../../../services/event.service';
import { EntityFirm } from './../../../../../models/entity-firm';
import { Event } from './../../../../../models/event';
import { PerformanceService } from './../../../../../services/performance.service';
import { Template } from './../../../../../models/template';
import { Component, OnInit, Inject, ComponentRef, Injector, ComponentFactoryResolver, ViewChild, AfterViewInit } from '@angular/core';
import { MulitplePerformanceService } from '../../../mulitple-performance.service';
import { EventFactory } from '../../../factories/event.factory';
import * as moment from 'moment';
import { Venue } from '../../../../../models/venue';
import { Performance } from '../../../../../models/performance';
import { EntitySearchBoxComponent } from '../../../../common-module/common/entity-search-box/entity-search-box.component';
import { TetherDialog } from '../../../../common-module/modules/tether-dialog/tether-dialog';
import { NotificationService } from '../../../../../services/notification.service';
import { AppSettingsService } from '../../../../../services/app-settings.service';
import { EntityAttribute } from '../../../../../models/entity-attribute';
import { Subscription } from 'rxjs';
import { Firm } from '../../../../../models/firm';
import { Attribute } from '../../../../../models/attribute';
import { AttributeTypeService } from '../../../../../services/attribute-type.service';
import { VenueSelectBarComponent } from './../../../../backstage-module/components/venue-select-bar/venue-select-bar.component';
import { Performer } from '../../../../../models/performer';
import { EventType } from '../../../../../models/event-type.enum';
import { PerformanceNameType } from './../../../../../models/performance-name-type.enum';
import { EntityService } from './../../../../../services/entity.service';

@Component({
  selector: 'app-multiple-performance-create-event',
  templateUrl: './multiple-performance-create-event.component.html',
  styleUrls: ['./multiple-performance-create-event.component.scss'],
  providers: [
    PerformanceService, EventService,FirmService,AttributeTypeService,EntityAttributeService,EntityFirmService,EntityService,
    { provide: 'entityTypeEntityService', useClass: EntityService },
    { provide: 'promoterFirmService', useClass:EntityFirmService},
    { provide: 'accessIntegrationTypeService', useClass:EntityService},
    { provide: 'promoterService', useClass: FirmService}
  ],
  entryComponents: [EntitySearchBoxComponent]
})
export class MultiplePerformanceCreateEventComponent implements OnInit,AfterViewInit {

  @ViewChild(VenueSelectBarComponent) venueSelectBar: VenueSelectBarComponent;

  eventFactory: EventFactory;
  performanceFactory: PerformanceFactory;
  event;
  basePerformance: Performance;
  baseProductFactory: ProductFactory;

  eventSubscription:Subscription;

  nameType;

  entityTypeId: number;

  isLoading: boolean;
  showExtraFields:boolean = false;
 
  inviteFriendFlag:boolean = false;
  reservationFlag:boolean = false;

  eventHasName:boolean = false;
  canRemove:boolean = true;

  firmPresets: {title: string, list: any[]}[];
  firmTypes: Array<{ text: string, value: any, disabled?: boolean }> = [
    { 'value': 0, text: "Seçiniz *", disabled: true },
    { 'value': 1, text: 'Ana Sponsor' },
    { 'value': 2, text: 'Medya Sponsoru' },
    { 'value': 3, text: 'Etkinlik Sponsoru' },
    { 'value': 4, text: 'Alt Sponsoru' },
    { 'value': 5, text: 'Diğer' },
  ];

  eventTypeList: {text: string, value: EventType} [] = [
		{text: 'Varsayılan', value: EventType.Default},
		{text: 'Sinema', value: EventType.Cinema}
	];

  sponsorSearchResult: Observable<{title: string, list: any[]}[]>;  
  promoterSearchResult: Observable<{title: string, list: any[]}[]>;  
  attributeTypes: {name:string, label: string, params:{attributeType: AttributeType}}[];

  hoursRange: {value: any, text: string, disabled?: boolean} [];

	expirationTypes: {text: string, value: any, disabled?: boolean}[] = [
		{ value: 0, text: "Seçiniz *", disabled: true },
		{ value: 1, text: "Performanstan Önce" },
		{ value: 2, text: "Rezervasyondan Sonra" }
  ];
	nameTypes: {text: string, value: PerformanceNameType}[] = [
    { value: PerformanceNameType.Default, text: "Aynı Kalsın" },   
		{ value: PerformanceNameType.AddDate, text: "Sonuna Tarih Ekle" },
		{ value: PerformanceNameType.AddTime, text: "Sonuna Saat Ekle" }
  ];  
  accessIntegrationTypes: {value: any, text: string}[] = [ {
    value: -1, text:'Seçiniz'
  }];

  eventParamSubscription: Subscription;
  performanceSubscription: Subscription;
  productSubsription: Subscription;

  entitySearchBox: EntitySearchBoxComponent;
  
  sponsors: {id: any, name: string, type?: any, params?: any}[] = [];
  promoters: {id: any, name: string, type?: any, params?: any}[] = [];
  attributes: {name: string, label: string, type:{name: string}, params: {attribute: Attribute}}[] = [];
  performers: {Id:number, Name:string,Images:string}[] = [];

  eventSubject = [];

  queryParamId:number;
  
  promoterFirmId:number;

  onSaveComplete: any;

  firms = [];
  mom:boolean;
 
  attributeTagCanDeleted:boolean = true;
  validation: {
    EventDetail: {isValid:any,message:string},
    VenueDetail: {isValid:any,message:string},
    // PerformanceDetail: {isValid:any,message:string},
    Settings:{isValid:any,message:string},
    PhotoAdded: {isValid:any,message:string},
  } = {
    EventDetail: {
      message:'Lütfen Etkinlik Bilgileri Alanını Eksiksiz Doldurunuz!',
      isValid():boolean {
        let invalidTypedSponsors = this.sponsors.filter(i => i.type === 0);
        let sponsorValid = this.sponsors.length > 0 ? (invalidTypedSponsors && invalidTypedSponsors.length === 0) : true;
        return   ((this.event && this.event.Id) || (this.eventHasName)) && this.promoters.length > 0  && sponsorValid && this.attributes.length > 0 ;
      }
    },
    VenueDetail: {
      message:'Lütfen Etkinlik için Venu Seçimi Yapınız',
      isValid():boolean {
        return this.performanceFactory['model']['VenueTemplate'] != undefined;
      }
    },
    // PerformanceDetail: {
    //   message:'Lütfen Sanatçı Seçiniz',
    //   isValid():boolean {
    //     return this.performers.length > 0;
    //   }
    // },
    Settings: {
      message:'Lütfen Performans Adı Giriniz',
      isValid():boolean {
        let reservationValid = this.performanceFactory.model.ReservationAvailable ? this.performanceFactory.model.ReservationExpirationType !== 0 && this.performanceFactory.model.ReservationExpirationType !== 0 && this.performanceFactory.model.ReservationExpirationTime != null && this.performanceFactory.model.ReservationExpirationTime !== 0 : true;
        let inviteFriendValid = this.performanceFactory.model.IsInviteFriendAvailable ?  this.performanceFactory.model.InviteFriendExpirationType !== 0 && this.performanceFactory.model.InviteFriendExpirationType !== 0 && this.performanceFactory.model.InviteFriendExpirationTime != null && this.performanceFactory.model.InviteFriendExpirationTime !== 0 : true;
  
        return reservationValid && inviteFriendValid;
      }
    },
    PhotoAdded: {
      message: 'Lütfen Etkinlik Fotoğrafını ekleyiniz',
      isValid():boolean {
        return this.eventFactory.model.Images != null && this.eventFactory.model.Images != "" && this.performanceFactory.model.Images != null && this.performanceFactory.model.Images != "";
      }
    }
  };
  
  get isValid():boolean {
    if(this.validation.EventDetail.isValid.call(this) && this.validation.VenueDetail.isValid.call(this) && this.validation.PhotoAdded.isValid.call(this) && this.validation.Settings.isValid.call(this)) {
      return true;
      
    }
    else {
      return false;
    }
  }

  get levels() { return this.multiplePerformanceService.levels; }
  get currentLevel() { return this.multiplePerformanceService.currentLevel }

  eventFromId:any;
    
  constructor(
    public multiplePerformanceService: MulitplePerformanceService,
    @Inject('entityTypeEntityService') private entityTypeEntityService: EntityService,
    @Inject('promoterService') private promoterService: FirmService,
    @Inject('accessIntegrationTypeService') private accessIntegrationTypeService: EntityService,
    @Inject('promoterFirmService') private promoterFirmService: EntityFirmService,
    private performanceService: PerformanceService,
    private eventService: EventService,
    private appSettingsService: AppSettingsService,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    public tetherService: TetherDialog,
    private notificationService: NotificationService,
    private sponsorService: FirmService,
    private attributeTypeService:AttributeTypeService,
    private  entityAttributeService:EntityAttributeService,
    private entityFirmService: EntityFirmService,
    private entitiyService: EntityService,
    private router: Router,
    private routeSs: ActivatedRoute,
    private authService:AuthenticationService
  ) { }
  
  ngOnInit() {
    
    this.promoterFirmId = this.authService.getAuthenticatedUser().PromoterFirmId;
    this.showExtraFields = false;
    this.setEventServiceDataHandlers();
    this.hoursRange = [];
		this.hoursRange.push({value: 0, text: "Süre seçin *", disabled: true});
		this.hoursRange.push({value: 4*60, text: "4 saat"});
		this.hoursRange.push({value: 12*60, text: "12 saat"});
		this.hoursRange.push({value: 24*60, text: "1 gün"});
		this.hoursRange.push({value: 2*24*60, text: "2 gün"});
		this.hoursRange.push({value: 4*24*60, text: "4 gün"});
    this.hoursRange.push({value: 7*24*60, text: "1 hafta"});


    // If Came from Events
     this.routeSs.queryParams.subscribe(paramData => {
      this.queryParamId = paramData.eventId;
      if( (paramData != null || paramData.length) && this.queryParamId !=null) { 
        
        this.entitiyService.setCustomEndpoint('GetAll');
        this.entitiyService.fromEntity('EEvent').where('Id', '=',paramData.eventId).expand(['Localization']).take(1).page(0).executeQuery();
        this.entitiyService.data.subscribe(result => {
          this.multiplePerformanceService.setCurrentEventFactory(this.multiplePerformanceService.createEventFactory(result[0])); 
          this.eventService.flushCustomEndpoint();
          this.eventService.find(this.queryParamId, true); 
         
        })      

      }
    }) 

   
    this.eventSubscription = this.multiplePerformanceService.currentEventFactory$.subscribe( currentEventFactory => {

      this.eventFactory = currentEventFactory;
      if(this.eventFactory) {  
        this.entityTypeId = currentEventFactory.entityTypeId;
        this.event = this.eventFactory.model;

        if(this.queryParamId && currentEventFactory.entityTypeId != undefined) {
          this.entityAttributeService.setCustomEndpoint('GetEntityAttributeList');
          this.entityAttributeService.query({pageSize: 100, filter: [{filter:'EntityId eq ' + this.queryParamId + ' and EntityTypeId eq '+ currentEventFactory.entityTypeId +' and IsActive eq true'}]});
          this.entityAttributeService.data.subscribe(result => {  
            if(result) this.eventFactory.setEntityAttributeList(result);      
          },error => {
            console.log("Attribute Service Error",error);
          });

          this.promoterFirmService.setCustomEndpoint('GetEntityFirmList');
          this.promoterFirmService.query({page:0, pageSize:100, filter: [{ filter: 'EventId eq ' + this.queryParamId}] });          
          this.promoterFirmService.data.subscribe(promoter => {
            if(promoter)
            {
              let promoterResult = [];
              let sponsorResult = [];
              promoter.forEach(result => {
                
                switch(result.Type) {
                  case 2 :           
                  promoterResult.push(result);                  
                  break;
                  case 3:              
                    sponsorResult.push(result);             
                  break;
                  case 4:
                    promoterResult.push(result); 
                  break;
                }
              })         
              this.eventFactory.setSponsorList(sponsorResult);
              this.eventFactory.setPromoterList(promoterResult);
              this.multiplePerformanceService.basePerformanceFactory.setPromoterId(promoterResult['OwnerFirmId']);
              this.queryParamId = null;
            }
          },error => {
            console.log("Promoter & Sponsor Service Error",error);
          })   
          
          
        }

        if(this.promoterFirmId > 0) {
          this.promoterFirmService.setCustomEndpoint('GetEntityFirmList');
          this.promoterFirmService.query({page:0, pageSize:1,take:1, filter: [{ filter: 'OwnerFirmId eq ' + this.promoterFirmId}] });          
          this.promoterFirmService.data.subscribe(promoter => {
            if(promoter)
            {
              let promoterResult = [];
              promoter.forEach(result => {
                
                switch(result.Type) {
                  case 2 :           
                  promoterResult.push(result);                  
                  break;
                  case 4: 
                  promoterResult.push(result);
                }
              })         
              this.eventFactory.setPromoterList(promoterResult);
            }
          },error => {
            console.log("Promoter & Sponsor Service Error ",error);
          })           
        }

       
        // Sponsors Subscriber
        this.eventFactory.sponsors$.subscribe( entityFirms => {  
           
          if(entityFirms) {
            this.sponsors = [];
            entityFirms.forEach( entityFirm => {
              if(entityFirm.OwnerFirmId != undefined)
              {
                this.sponsors.push({
                  id: entityFirm.OwnerFirmId,
                  name: entityFirm.OwnerFirmDetail.Name,
                  type: entityFirm.SubType,
                  params: {entityFirm: entityFirm, firm: entityFirm.OwnerFirmDetail}
                });
              }
            });   
          }
        });
        
        // Promoters Subscriber
        this.eventFactory.promoters$.subscribe( entityFirms => {
            
            if(entityFirms) {
            this.promoters = [];           
            entityFirms.forEach( entityFirm => {
              if(entityFirm.OwnerFirmId != undefined)
              {
                this.multiplePerformanceService.basePerformanceFactory.setPromoterId(entityFirm.OwnerFirmId);
                this.promoters.push({
                  id: entityFirm.OwnerFirmId,
                  name: entityFirm.OwnerFirmDetail.Name,
                  type: entityFirm.SubType,
                  params: {entityFirm: entityFirm, firm: entityFirm.OwnerFirmDetail}
                });
              }
            });
          }
        });
        

        //Attributes Subscriber
        this.eventFactory.entityAttributes$.subscribe( entityAttributes => {
          if(entityAttributes) {
            this.attributes = [];
            let attributeItem;
            entityAttributes.forEach( entityAttribute => {
              if(entityAttribute.Attribute) {
                attributeItem = {
                  name: entityAttribute.Attribute.Id.toString(),
                  label: entityAttribute.Attribute.Localization.Name,
                  type: {name: entityAttribute.Attribute.AttributeTypeId.toString()},
                  extraFieldType: entityAttribute && entityAttribute.Value ? "fuzzy" : null,
                  extraFieldValue: entityAttribute && entityAttribute.Value ? entityAttribute.Value : 0,
                  params: {entityAttribute: entityAttribute, attribute: {model: entityAttribute.Attribute}}
                };
                if(attributeItem["extraFieldValue"]) attributeItem["label"] += " [ <i>f:</i><span>" + attributeItem["extraFieldValue"] + "</span>]"
                this.attributeFieldDisabled(false);
                this.attributes.push(attributeItem);
              }
              if(entityAttribute.hasOwnProperty('AAttribute')) {
                let attribute;
                
                let attributeData = entityAttribute["AAttribute"];
      					 attribute = {
      						name:attributeData.Id.toString(),
      						label: attributeData.Name,
      						type: {name: attributeData.AttributeTypeId.toString()},
      						extraFieldType: entityAttribute && entityAttribute.Value ? "fuzzy" : null,
      						extraFieldValue: entityAttribute && entityAttribute.Value ? entityAttribute.Value : 0,
      						params: {entityAttribute: entityAttribute, attribute: new Attribute(attributeData)}
      					};
                if(attribute["extraFieldValue"]) attribute["label"] += " [ <i>f:</i><span>" + attribute["extraFieldValue"] + "</span>]"
                this.attributeFieldDisabled(true);
              
                this.attributes.push(attribute);
              }
            });
          }
        });
      }
    });

    this.performanceSubscription = this.multiplePerformanceService.basePerformanceFactory$.subscribe( performanceFactory => {
      this.performanceFactory = performanceFactory;
       
      if(performanceFactory) {
        if(this.eventFactory) this.eventFactory.model.set("Images",this.performanceFactory.model.Images)
        this.setEventServiceDataHandlers();
        
        this.inviteFriendFlag = this.performanceFactory.model.IsInviteFriendAvailable;
        this.reservationFlag  = this.performanceFactory.model.ReservationAvailable;

        // Performance Performers Subscribe
        this.performanceFactory.performancePerformers$.subscribe(result => {
          this.performers = [];
          if(result){
            result.forEach(performerList => {
              this.performers.push({
                Id: performerList['Performer']['Id'],
                Name: performerList['Performer']['Name'],
                Images: performerList['Performer']['Images']
              })
            })
          }
        })      
      }
    });

    this.productSubsription = this.multiplePerformanceService.baseProductFactory$.subscribe( productFactory => {
      this.baseProductFactory = productFactory;
    });

    this.performanceService.data.subscribe( result => {
      if(result && result[0]) {
        this.basePerformance.setLocalization(result[0]["Localization"]);
        this.multiplePerformanceService.setBasePerformance(this.basePerformance, true);
      }
    });
  }

  ngAfterViewInit() {
    if(this.authService.getAuthenticatedUser().PromoterFirmId > 0) {
      this.canRemove = false;
    }
    else {
      this.canRemove = true
    } 
  }

  ngOnDestroy() {
    if(this.eventSubscription) this.eventSubscription.unsubscribe();
    if(this.performanceSubscription) this.performanceSubscription.unsubscribe();
    if(this.productSubsription) this.productSubsription.unsubscribe();
  }

  setEventServiceDataHandlers() {
    this.sponsorServiceDataHandler();
    this.promoterServiceDataHandler();
    this.attributeTypesServiceDataHandler();
    this.accessIntegrationTypeServiceDataHandler();
  }

  // Modals
  public openPerformanceSearchBox(event) {
    let component:ComponentRef<EntitySearchBoxComponent> = this.resolver.resolveComponentFactory(EntitySearchBoxComponent).create(this.injector);
    this.entitySearchBox = component.instance;
    this.entitySearchBox.selectedEntitiyType = this.appSettingsService.getLocalSettings('entityTypes').find( item => item.name == "Performance");
    this.entitySearchBox.hasSearchOptions = false;
    this.entitySearchBox.entityExpandList = [
        ['Localization'],
        ['VenueTemplate','Localization'],
        ['VenueTemplate','Venue','Localization'],
        ['VenueTemplate','Venue','Town','City'],
        ['Products', 'Product', 'Localization'],
        ['Products', 'Product', 'PriceLists', 'Localization'],
        ['Products', 'Product', 'PriceLists', 'Variants', 'Prices', 'SalesChannel'],
        ['PerformancePerformers', 'Performer']
    ]
    this.tetherService.modal(component, {
      escapeKeyIsActive: false,
    }).then(result => {
      this.basePerformance = result.params.entity;
      this.performanceService.flushCustomEndpoint();
      this.performanceService.find(this.basePerformance.Id, true);   
    }).catch( reason => {
        
    });
  }

  public openEventSearchBox(event) {
    let component:ComponentRef<EntitySearchBoxComponent> = this.resolver.resolveComponentFactory(EntitySearchBoxComponent).create(this.injector);
    this.entitySearchBox = component.instance;
    this.entitySearchBox.allowAll = true;
    this.entitySearchBox.selectedEntitiyType = this.appSettingsService.getLocalSettings('entityTypes').find( item => item.name == "Event");
    this.entitySearchBox.hasSearchOptions = false;
    this.entitySearchBox.entityExpandList = [
        ['Localization']
    ]
    this.tetherService.modal(component, {
      escapeKeyIsActive: false,
    }).then(result => {
      this.event = result.params.entity;
      this.eventService.flushCustomEndpoint();
      this.eventService.find(this.event.Id, true);   
      this.multiplePerformanceService.setCurrentEventFactory(this.multiplePerformanceService.createEventFactory(this.event)); 
      this.entityAttributeService.setCustomEndpoint('GetEntityAttributeList');
      this.entityAttributeService.query({pageSize: 100, filter: [{filter:'EntityId eq ' + result.id + ' and EntityTypeId eq '+this.entityTypeId+' and IsActive eq true'}]});
      this.entityAttributeService.data.subscribe(result => {  
        if(result) this.eventFactory.setEntityAttributeList(result);      
      },error => {
        console.log("Attribute Service Error",error);
      });
      this.promoterFirmService.setCustomEndpoint('GetEntityFirmList');
      this.promoterFirmService.query({page:0, pageSize:100, filter: [{ filter: 'EventId eq ' + result.id}] });          
      this.promoterFirmService.data.subscribe(promoter => {
        if(promoter)
        {
          let promoterResult = [];
          let sponsorResult = [];
          promoter.forEach(result => {
            switch(result.Type) {
              case 2 : 
              console.log("Promoter yazdı",result);
              this.multiplePerformanceService.basePerformanceFactory.setPromoterId(result.OwnerFirmId);          
              promoterResult.push(result); 
                             
              break;
              case 3:              
                sponsorResult.push(result);             
              break;
              case 4:
                this.multiplePerformanceService.basePerformanceFactory.setPromoterId(result.OwnerFirmId);          
                promoterResult.push(result); 
              break;
            }
          })         
          this.eventFactory.setSponsorList(sponsorResult);
          this.eventFactory.setPromoterList(promoterResult);
        }
      },error => {
        console.log("Promoter & Sponsor Service Error",error);
      })         


      // Get Sponsors adn Promoters



    }).catch( reason => {
        console.log("Todo: Notfication Add => ",reason);
    });
  }

  removeEvent(event) {
    this.multiplePerformanceService.setCurrentEventFactory(this.multiplePerformanceService.createEventFactory());    
    this.eventFactory.setEntityAttributeList(null);
    this.attributes = [];
    this.attributeFieldDisabled(false);
    this.eventFactory.setPromoterList(null);
    this.promoters = [];
    this.eventFactory.setSponsorList(null);
    this.sponsors = [];

  }

  // Sponsors
	sponsorChangeHandler(event:{params: {entityFirm?: EntityFirm, firm?: Firm}}[]) {
		if(!event && event.length == 0) return;
    this.sponsors = [];
    event.forEach(result => {

      this.sponsors.push({
        id:result['id'],
        name:result['name'],
        type:result['type'],
        params:{firm: result.params.firm}
      })
    })
  }
	sponsorServiceDataHandler() {
		this.firmPresets = null;
		this.sponsorService.data.subscribe(response => {
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
				this.sponsorSearchResult = Observable.of([{
					title: 'ARAMA SONUÇLARI', list: result
				}]);
			} else {
				this.sponsorSearchResult = Observable.of([]);
			}
		});
	}
	sponsorActionHandler(event: {action: string, data: any[]}) {
		switch(event.action) {
      case "search":
				if(event.data && event.data.length > 0){
					this.sponsorService.setCustomEndpoint('GetFirmList');
					this.sponsorService.query({ page: 0, pageSize: 10, search: { key: 'Name', value: event.data } }, [{ key: 'isEvent', value: false }]);
				}
			break;
			case "createNewSponsor":
				alert("Bu bölüm henüz aktif değildir");
      break;
      case "patch":
        let checkIfExist = this.eventFactory.sponsors.find( exist => exist.OwnerFirmId === event.data['id'] );
        if(checkIfExist) return this.eventFactory.objectPatcher(event.data['id'],{SubType:event.data['type']});
      break;
      case "remove":
        if(this.eventFactory.sponsors.length > 0)
        {
          let checkIsSponsorSetToPayload = this.eventFactory.sponsors.find( exist => exist.OwnerFirmId === event.data['id'] );
          if(checkIsSponsorSetToPayload) return this.eventFactory.removeSponsorById(event.data['id']);
        }
      else {
          let chekIsSponsorInObject = this.sponsors.find(exist => exist.id === event.data['id']);
          if(chekIsSponsorInObject)
          {
            let foundedIndex = this.sponsors.findIndex(result =>  result.id == event.data['id'])
            if(foundedIndex >= 0) 
            { 
            this.sponsors.splice(foundedIndex, 1); 
            }           
          }
      }
        break;
			case "exist":
				this.notificationService.add({text: '<b>'+event.data["name"] + '</b> daha önce eklendi!', type:'danger'});
			break;
		}
  }
  

  // Promoter
	promoterServiceDataHandler() {
		this.firmPresets = null;
		this.promoterService.data.subscribe(response => {
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
				this.promoterSearchResult = Observable.of([{
					title: 'ARAMA SONUÇLARI', list: result
				}]);
			} else {
				this.promoterSearchResult = Observable.of([]);
			}
		});
	}  
	promoterChangeHandler(event:{params: {entityFirm?: EntityFirm, firm?: Firm}}[]) {
    
    if(!event && event.length == 0) return;
    this.promoters = [];
    console.log("Promoter Event",event);
    event.forEach(result => {

      this.promoters.push({
        id: result['id'],
        name: result['name'],
        type: result['type'],
        params: {firm: result.params.firm}
      });
      if(this.promoterFirmId == 0) this.multiplePerformanceService.basePerformanceFactory.setPromoterId(result['id']) ;
    })

	}
	promoterActionHandler(event: {action: string, data: any[]}) {
		switch(event.action) {
			case "search":
				if(event.data && event.data.length > 0){
					this.promoterService.setCustomEndpoint('GetFirmList');
					this.promoterService.query({ page: 0, pageSize: 10, search: { key: 'Name', value: event.data } }, [{ key: 'isEvent', value: false }]);
				}
			break;
			case "createNewSponsor":
				alert("Bu bölüm henüz aktif değildir");
			break;
      case "patch":
        let checkIfExist = this.eventFactory.promoters.find( exist => exist.OwnerFirmId === event.data['id'] );
        if(checkIfExist) return this.eventFactory.objectPatcher(event.data['id'],{SubType:event.data['type']});
      break;
      case "remove":
        
        if(this.eventFactory.promoters.length > 0)
        {
          let checkIsPromoterSetToPayload = this.eventFactory.promoters.find( exist => exist.OwnerFirmId === event.data['id'] );
          if(checkIsPromoterSetToPayload) return this.eventFactory.removePromoterById(event.data['id']); 
        }
        else {
          let chekIsPromoterInObject = this.promoters.find(exist => exist.id === event.data['id']);
          if(chekIsPromoterInObject)
          {
            let foundedIndex = this.promoters.findIndex(result =>  result.id == event.data['id'])
            if(foundedIndex >= 0) 
            { 
            this.promoters.splice(foundedIndex, 1); 
            }           
          }
        }
  
      break;
			case "exist":
				this.notificationService.add({text: '<b>'+event.data["name"] + '</b> daha önce eklendi!', type:'danger'});
			break;
		}
  } 


  // Venue
  venueSelectChangeHandler(event) {
      this.eventFactory.setVenue(event.venue,event.template);
      
  }
	venueSelectActionHandler(event) {
		switch(event.action) {
			case "createNewVenue":				
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
				
			break;
		}
  } 
  gotoVenueCreate(){
		this.router.navigate(['venue', 'create']);
  }
  
  //Attributes
  attributesChangeHandler(event: {name: string, params: {entityAttribute?: EntityAttribute, attribute?: {model?: Attribute}}}[]) {
		if(event) {
      let entityAttribute:EntityAttribute;
			event.forEach( attributeData => {
        entityAttribute = this.eventFactory.entityAttributes.find( item => item.AttributeId.toString() == attributeData.name);
				if(!entityAttribute) {
          this.eventFactory.addEntityAttribute(new EntityAttribute({
            AttributeId: attributeData.params.attribute["key"] || attributeData.params.attribute.model.Id,
            Value: attributeData["extraFieldValue"] ? parseInt(attributeData["extraFieldValue"]) : 0,
            EntityTypeId: this.entityTypeId,
            StartDate: "2017-02-17T18:02:47.381Z",
						ExpireDate: "2017-02-28T18:02:47.381Z",
            IsActive: true,
            Attribute: attributeData.params.attribute.model
            
          }));
				}
			});
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

  attributesActionHandler(event) {
		switch(event.action) {
			case "remove":
        this.eventFactory.removeAttributeById(event.data['name']);
			break;
		}
  }

  //Performers
  performersChangeHandler(performers: Performer[]) {
    if(!this.multiplePerformanceService.basePerformanceFactory) return;
    let performancePerformers: PerformancePerformer[] = [];
    performers.forEach( performer => {
      performancePerformers.push(new PerformancePerformer({
        PerformerId: performer.Id,
        PerformanceId: this.multiplePerformanceService.basePerformanceFactory.model.Id,
        Info: "",
        Performer: performer
      }));
    });
    this.multiplePerformanceService.basePerformanceFactory.setPerformancePerformers(performancePerformers);
  }  

  // Ayarlar
  accessIntegrationTypeServiceDataHandler() {
		this.accessIntegrationTypeService.setCustomEndpoint('GetAll');
		this.accessIntegrationTypeService
			.fromEntity('SAccessIntegrationType')
			.page(0).take(10000).executeQuery();

		this.accessIntegrationTypeService.data.subscribe(result => {
			if (result.length > 0) {
				this.accessIntegrationTypes = [];
				this.accessIntegrationTypes.push({text: "Varsayılan Uygulama", value: null});
				result.forEach( item => this.accessIntegrationTypes.push({text: item.Name, value: item.Id }));
			} else {
				this.accessIntegrationTypes = null;
			}
		});
  }  

  typeEventHandler(event,field) {
    if(!this.performanceFactory) return;

     this.performanceFactory.set(field, event, true);
  }
  
  typeCreateEventHandler(event,field) {
    if(!this.eventFactory) return;
    if(event != undefined)
    {
      this.eventHasName = true;
      this.eventFactory.set(field,event,true);
    }
    else {
      this.eventHasName = false;
    }
    
  }
    
	checkHandler(value, name:string) {
		switch(name) {
      case 'ReservationAvailable':
          this.reservationFlag = value;  
          this.multiplePerformanceService.basePerformanceFactory.set(name,value);
          if(!value)  this.multiplePerformanceService.basePerformanceFactory.set('ReservationExpirationTime',0);
			break;
      case 'IsInviteFriendAvailable': 
          this.inviteFriendFlag = value;    
          this.multiplePerformanceService.basePerformanceFactory.set(name,value);
          if(!value)  this.multiplePerformanceService.basePerformanceFactory.set('InviteFriendExpirationTime',0);
      break;
      case 'IsTicketForwardingAvailable':
          this.multiplePerformanceService.basePerformanceFactory.set(name,value);
      break;
      case 'IsGenerateBarcodeAvailable':
          this.multiplePerformanceService.basePerformanceFactory.set(name,value);
      break;
		}
	}  

  selectChangeHandler(value, name) {
		switch(name) {
      case "Type":
        this.event.Type = value;
      break;
      default:
      this.multiplePerformanceService.basePerformanceFactory.set(name,value);
			break;
		}
  }

  inputChangeHandler(event: any, name: string, target?:any) {
    if(target) target[name] = event;
  }
  
  // Diğer Bilgiler
  photoChangeHandler(event) {
    if(event !="" && event != undefined)
    {    
    this.multiplePerformanceService.basePerformanceFactory.set('Images',event.data || "");
    this.eventFactory.model.set('Images',event.data || "");
    }
 
  }

  // Submit Event
  submitEvent(event) {

      this.prepareForNextStep();
      this.multiplePerformanceService.createPayload().then(result => {

        if(result) {
          
          this.router.navigate(['/multiple-performance/create/products']);
                 
        }
      }).catch(result => {
        this.notificationService.add({text: result, type:'danger'});  
      })
  }


  saveSponsor() {
    let spons = [];
    this.sponsors.forEach(sponsorList => {
      let exist = this.eventFactory.sponsors.find(result => result['Id']  == sponsorList.params.firm['Id'] );
      if(!exist)
      {
        spons.push(new EntityFirm({
          Type: sponsorList.params.firm['FirmType'] || 3,
          SubType: Math.max(sponsorList.type,0),
          OwnerFirmId: sponsorList.params.firm['Id'],
          OwnerFirmDetail: {
            Name:sponsorList.name
          }
          
      }))
      }
    })    
    this.entityFirmService.setCustomEndpoint('PostAll');
    this.entityFirmService.create(spons).subscribe(
      response => {
         console.log("Sponsor Create Result",response);
      },
      error => {
        
      }
    );
  }
  
  prepareForNextStep(){    
    
    if(this.sponsors.length > 0)
    {
    
    this.sponsors.forEach(sponsorList => {
      let exist = this.eventFactory.sponsors.find(result => result['Id']  == sponsorList.params.firm['Id'] );
      if(!exist)
      {
      this.eventFactory.addSponsor(new EntityFirm({
        Type: sponsorList.params.firm['FirmType'] || 3,
        SubType: Math.max(sponsorList.type,0),
        OwnerFirmId: sponsorList.params.firm['Id'],
        OwnerFirmDetail: {
          Name:sponsorList.name
        }
        
    }))}
    })
  }
  if(this.promoters.length > 0)
  {
    
    this.promoters.forEach(promoterLists => {
      let promoterExist = this.eventFactory.promoters.find(result => result['Id'] == promoterLists.params.firm['Id']);
      if(!promoterExist) {
        this.eventFactory.addPromoter(new EntityFirm({
          Type: promoterLists.params.firm['FirmType'] || 2,
          SubType: Math.max(promoterLists.type,0),
          OwnerFirmId: promoterLists.params.firm['Id'],
          OwnerFirmDetail: {
            Name:promoterLists.name
          }
        }))}
      }) 
    }

    if(this.performers.length > 0) {
      let performerMap = [];
      this.performers.forEach(performerList => {      
        performerMap.push({
          PerformerId: performerList.Id,
          Info:"",
          Performer: {
            Id: performerList.Id,
            Name:performerList.Name,
            Images: performerList.Images, 
          }
        })
      })
      this.performanceFactory.setPerformancePerformers(performerMap);
    } 
}
  
eventInputNameChangeHandler(event) {
  
  if(!this.event) return;

  if(event.value != "" && event.value != undefined)
  {
    this.eventHasName = true;
    this.eventFactory.set('Name',event,true);
  }
  else {
    this.eventHasName = false;
  }  
}

attributeFieldDisabled(value:boolean) {
  if(value) {
  
    this.attributeTagCanDeleted = false;  
    
  }
  else {
   
    this.attributeTagCanDeleted = true;
  }
}
nameTypeChangeHandler(event) {
  this.nameType = event;
  this.performanceFactory.setPerformanceNameType(this.nameType);
}
}
