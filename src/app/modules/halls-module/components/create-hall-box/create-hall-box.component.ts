import { Component, OnInit, ViewChild, HostBinding, Input, ChangeDetectorRef, Inject } from '@angular/core';
import { WizardHeaderComponent } from './../../../common-module/components/wizard-header/wizard-header.component';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { EntityService } from './../../../../services/entity.service';
import { AttributeTypeService } from '../../../../services/attribute-type.service';
import { AttributeType } from '../../../../models/attribute-type';
import { Attribute } from '../../../../models/attribute';
import { Hall } from '../../../../models/hall';
import { HallService } from '../../services/hall.service'
import { NotificationService } from './../../../../services/notification.service';
import { LocalizationBoxComponent } from './../../../base-module/components/localization-box/localization-box.component';

@Component({
  selector: 'app-create-hall-box',
  templateUrl: './create-hall-box.component.html',
  styleUrls: ['./create-hall-box.component.scss'],
  providers: [
    { provide: 'entityTypeEntityService', useClass: EntityService },
    AttributeTypeService, HallService
	]
})
export class CreateHallBoxComponent implements OnInit {

  constructor(
    public tetherService: TetherDialog,
    private changeDetector: ChangeDetectorRef,
    private attributeTypeService: AttributeTypeService,
    private hallService: HallService,
    public notificationService: NotificationService,
    @Inject('entityTypeEntityService') private entityTypeEntityService: EntityService,
  ) { }

  @ViewChild(WizardHeaderComponent) wizardHeader: WizardHeaderComponent;
  @ViewChild('Localization') localizationComponent: LocalizationBoxComponent;

  @HostBinding('class.c-create-hall-box') true;

  @Input() title: string;
  @Input() isEditMode: boolean = false;
  @Input() venueId: number;

  currentLevel: { key: string, title: string, hasScroll?: boolean, params?:any };
  currentLevelIndex: number = 0;
  levels: { key: string, title: string, hasScroll?: boolean, params?:any }[];

  entityTypeId: number;

  attributeTypes: {name:string, label: string, params:{attributeType: AttributeType}}[];
	attribute: {name: string, label: string, type:{name: string}, params: {attribute: Attribute}};

  hallAttributeType: {name:string, label: string, params:{attributeType: AttributeType}};

  hall: Hall;
  attributeValues: { AttributeId: number, Value: number}[];
  createHallData: { Id?: number, Hall: Hall, AttributeValues: { AttributeId: number, Value: number}[]};
  defaultHall: any;

  isLoading: boolean = false;

  public validation: {
    Localization: { isValid: any, message: string },
    Attribute: { isValid: any, message: string }
	} = {
		Localization: {
			message: "Lütfen tüm alanları doldurun",
			isValid(): boolean {
        let isLocalizationValid = this.localizationComponent ? this.localizationComponent.isValid : true;
        let isModalValid = this.hall ? this.hall.isValid('Name', true) : false;
        return isLocalizationValid && isModalValid;
			}
    },
    Attribute: {
      message: "Lütfen sadece bir özellik seçin",
      isValid(): boolean {
        return this.currentLevelIndex == 1 ? (this.attributeValues && this.attributeValues.length == 1) : true;
      }
    }
	};

	public get isValid():boolean {
		if( this.validation
      && this.validation.Localization.isValid.call(this)
      &&  this.validation.Attribute.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
	};

  ngOnInit() {

    this.levels = [];
    this.levels.push({key: "localization", title: !this.isEditMode? "SALONA İSİM VERİN" : "SALON İSMİNİ DÜZENLEYİN", hasScroll: false});
    this.levels.push({key: "attributes", title: !this.isEditMode? "SALON TİPİNİ SEÇİN": "SALON TİPİNİ DÜZENLEYİN", hasScroll: false});

    this.gotoLevel(0);
    this.changeDetector.detectChanges();

    //entity type id => event-edit //EVT => HALL
    this.entityTypeDataHandler();
    //attribute types => event-edit    

    if(!this.isEditMode){

      this.hall = new Hall();
      this.hall.VenueId = this.venueId;
      this.hall.IsActive = true;

      this.attributeValues = [];

      this.createHallData = {
        Hall: null,
        AttributeValues: []
      };

    }else{

      this.getLocalization();
      this.arrangeCheckedAttributes();

      this.createHallData = {
        Hall: null,
        AttributeValues: []
      };
    }

  }

  getLocalization() {
			this.hallService.flushCustomEndpoint();
      this.hallService.find(this.defaultHall.Id, true);	
      this.hallService.data.subscribe( result => {
				if(result && result[0]) {
          this.hall = new Hall(result[0]);
          this.hall.setLocalization(result[0]["Localization"]);
          this.changeDetector.detectChanges();
				}
			});
  }

  attributes: { name: string, label: string, params?: any }[];
  arrangeCheckedAttributes(){
    this.attributes = [];
    this.defaultHall.Attributes.forEach(attribute => {
      this.attributes.push({name: attribute.AAttribute["Id"].toString(), label: attribute.AAttribute["Name"]});
    });
  }

  entityTypeDataHandler() {
		this.entityTypeEntityService.data.subscribe( result => {
			if(result && result[0]) {
				this.entityTypeId = result[0].Id;

				this.attributeTypesServiceDataHandler();

			}
		});

		this.entityTypeEntityService.setCustomEndpoint('GetAll');
		this.entityTypeEntityService.fromEntity('AEntityType').where('EntityTypeCode', '=', "'HALL'").page(0).take(1).executeQuery();
  }
  
  attributeTypesServiceDataHandler() {
    this.attributeTypeService.data.subscribe(payload => {
        let attributeTypes = [];
        if(payload && payload.length > 0){
            payload.forEach(item => {
                attributeTypes.push({name:item["AttributeTypeId"].toString(), label: item["AttributeTypeName"], params:{attribute: item}});
            });
            this.attributeTypes = attributeTypes;
            this.hallAttributeType = attributeTypes[0];
        }        

    });
    this.attributeTypeService.setCustomEndpoint("GetAttributeTreeByEntityType");
    this.attributeTypeService.query({pageSize:100, page:0}, [{key: "entityTypeId", value: this.entityTypeId}]);
  }

  localizationChangeHandler(event){    
    if(this.hall) this.hall.set("Name", event, true);  
  }

  attributesChangeHandler(event){
    this.attributeValues = [];
    this.attributes = [];

    event.attributes.forEach(attribute => {
      this.attributeValues.push({
        AttributeId: attribute.name,
        Value: 1
      });
      this.attributes.push(attribute);
    });

  }

  nextLevel() {
    this.gotoLevel(Math.min(this.currentLevelIndex + 1, this.levels.length-1));
  }

  levelHandler(event) {
    if(event.nextLevel == true) {
      this.nextLevel();   
    }
  }
  
  previousLevel() {    
    this.gotoLevel(Math.max(this.currentLevelIndex - 1, 0));
    if(this.currentLevelIndex == 0 || this.currentLevelIndex == 2) {
    }
  }
  
  gotoLevel(key: any) {
    let self = this;
    if(Number.isInteger(key)) {
      this.currentLevelIndex = key;
    }else{
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

    this.tetherService.position();
    this.changeDetector.detectChanges();
  }

  submitClickHandler(event){
    if(!this.currentLevel) return;
    // if(this.isValid){
	    switch(this.currentLevel.key) {
        case "localization":
        // if(this.isValid){
          this.nextLevel();
        // }          
	      break;
        case "attributes":      
          this.isEditMode ? this.createPayloadAndUpdate() : this.createPayloadAndSend();
        break;
	      default:
	      	this.nextLevel();
	      break;
	    }
    // }
  }

  wizardActionHandler(event:{action: string, params?: any}) {
    switch(event.action) {
      case "goBack":        
        this.previousLevel();        
      break;
    }
  }

  createPayloadAndSend() {
    this.isLoading = true;

    this.createHallData.Hall = this.hall.getRawData();
    this.createHallData.AttributeValues = this.attributeValues;

    this.hallService.flushCustomEndpoint();
    this.hallService.setCustomEndpoint("Create");
    this.hallService.create(this.createHallData).subscribe(
      result => {
        this.isLoading = false;
        this.tetherService.close();      
      },
      error => {
        // this.onErrorHandler({text: `<b>Etkinlik kaydedilemedi</b> Lütfen bütün gerekli alanları doldurun.<br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
        console.log("error = ", error);
        this.notificationService.add({type: 'danger', text: error.Message})
        this.isLoading = false;
      },
      complete => {

      }
    )
  }

  createPayloadAndUpdate(){
    this.isLoading = true;

    this.createHallData.Id = this.defaultHall.Id;

    let hallId = this.hall.Id;
    delete this.hall.Id;

    this.createHallData.Hall = this.hall.getRawData();
    this.createHallData.AttributeValues = this.attributeValues;

    this.hallService.flushCustomEndpoint();
    this.hallService.setCustomEndpoint("Update");
    this.hallService.update(this.createHallData, 'put').subscribe(
      result => {
        this.isLoading = false;
        this.tetherService.close();
      },
      error => {
        this.isLoading = false;
        this.notificationService.add({type: 'danger', text: error.Message})
      },
      complete => {

      }
    )

  }

}
