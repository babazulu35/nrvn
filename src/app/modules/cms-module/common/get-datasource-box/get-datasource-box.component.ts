import { TypeaheadComponent } from './../../../common-module/components/typeahead/typeahead.component';
import { CmsDataService } from './../../../../services/cms-data.service';
import { Observable } from 'rxjs/Observable';
import { EntityService } from './../../../../services/entity.service';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { FormGroup } from '@angular/forms';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { WizardHeaderComponent } from './../../../common-module/components/wizard-header/wizard-header.component';
import { Component, OnInit, ViewChild, HostBinding, Input, ChangeDetectorRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-get-datasource-box',
  templateUrl: './get-datasource-box.component.html',
  styleUrls: ['./get-datasource-box.component.scss'],
  providers: [EntityService, CmsDataService]
})
export class GetDatasourceBoxComponent implements OnInit {
  @ViewChild(WizardHeaderComponent) wizardHeader: WizardHeaderComponent;
  @ViewChild(TextInputComponent) firstTextInput: TextInputComponent;
  @ViewChild(TypeaheadComponent) typeahead: TypeaheadComponent;

  @HostBinding('class.oc-get-datasource-box') true;

  @HostListener('keyup.enter') enterHandler(){
    if(this.currentLevel && this.currentLevel.key == 'params' && this.isValid) this.submitClickHandler(null);
  };

  @Input() title: string;
  @Input() datasourcesList: {
    id: string,
    type: string,
    url: string,
    required: boolean,
    method: string,
    entityType: string,
    disabled?: boolean,
    params: {
      key: string,
      type: string,
      label: string,
      relatedEntityType: string,
      allowMultiple?: boolean
    }[]
  }[];
  @Input() params: {
    key: string,
    type: string,
    label: string,
    relatedEntityType: string,
    allowMultiple?: boolean,
    value?: string
  }[];
  @Input() selectedDatasourceType: {
    id: string,
    type: string,
    url: string,
    required: boolean,
    method: string,
    entityType: string,
    title?: string,
    params: {
      key: string,
      type: string,
      label: string,
      relatedEntityType: string,
      allowMultiple?: boolean
    }[]
  };
  @Input() datasource: {
    EntityType?: string,
    Id?: string,
    Name?: string,
    Parameters?: {},
    Required?: boolean,
    Title?: string,
    id?:string
  };

  relatedParams: {
    key: string,
    type: string,
    label: string,
    relatedEntityType: string,
    allowMultiple?: boolean,
    entities?: {
      title: string,
      id: string,
      params?: {}
    }[]
  }[];
  searchParam: {
    key: string,
    type: string,
    label: string,
    relatedEntityType: string,
    allowMultiple?: boolean
  }
  searchPlaceholder: string;
  searchValue: string;
  searchResults: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?: any}[] }[]>;

  relatedParamsOptions:{ value: any, text: string }[];

  public paramsForm: FormGroup = new FormGroup({});

  public currentLevel: { key: string, title: string, hasScroll?: boolean, params?:any };
  public currentLevelIndex: number = 0;
  public levels: { key: string, title: string, hasScroll?: boolean, params?:any }[];

  public isEditMode: boolean;
  public isLoading: boolean;
  public isPromising: boolean;

  public validation: {
		DatasourceType: { isValid: any, message: string },
    Params: { isValid: any, message: string }
	} = {
		DatasourceType: {
			message: "Veri kaynağı tipi seçimi zorunludur",
			isValid(): boolean {
				return this.selectedDatasourceType != null;
			}
		},
    Params: {
      message: "Bütün parametreler girilmelidir.",
			isValid(): boolean {
				return this.currentLevel && this.currentLevel.key == "params" ? this.selectedDatasourceType && this.selectedDatasourceType.params && this.paramsForm.valid : true;
			}
    }
	};

	public get isValid():boolean {
		if( this.validation
			&& this.validation.DatasourceType.isValid.call(this)
      && this.validation.Params.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
	};
  
  constructor(
    private entityService: EntityService,
    private cmsDataService: CmsDataService,
    public tetherService: TetherDialog,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isEditMode = this.datasource != null;

    this.levels = [];
    this.levels.push({key: "types", title: "Veri Kaynağı Türü Seçin", hasScroll: true});
    this.levels.push({key: "params", title: "Parametreleri Girin", hasScroll: true});

    this.entityService.setCustomEndpoint('GetAll');
    this.entityService.data.subscribe( entities => {
      if(entities && entities.length) {
        let result:{}[] = [];
				entities.forEach( entity => {
					result.push({
						id: entity.Id,
						title: entity.Localization ? entity.Localization.Name : entity.Name,
						icon: "developer_board",
						params: {entity: entity, param: this.searchParam}
					})
				});

				this.searchResults = Observable.of([{
					title: "ARAMA SONUÇLARI",
					list: result
				}]);
      }else{
        this.searchResults = null;
        if(this.typeahead) this.typeahead.reset();
      }
    });

    if(this.isEditMode) {
      if(!this.title) this.title = "Veri Kaynağı Düzenle";
      if(!this.selectedDatasourceType) this.selectedDatasourceType = this.datasourcesList.find( item => item.type == this.datasource.Name );
      this.gotoLevel(1);
    }else{
      if(!this.title) this.title = "Veri Kaynağı Ekle";
      this.gotoLevel(0);
    }

    let self = this;
    setTimeout(function() {
      if(self.firstTextInput) self.firstTextInput.focus();
    }, 150);
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
    if(Number.isInteger(key)) {
      this.currentLevelIndex = key;
    }else{
      let self = this;
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

    switch(this.currentLevel.key) {
      case "types":
        this.params = null;
      break;
      case "params":
        if(!this.datasource) this.datasource = { Parameters: {} };
        if(this.relatedParams) this.relatedParams.forEach( relatedParam => {
          if(relatedParam && relatedParam.entities){
            let values:string[] = [];
            console.log(relatedParam);
            relatedParam.entities.forEach( entity => values.push(entity.id.toString()));
            this.datasource.Parameters[relatedParam.key] = values.join(',');
          }
        });
        let self = this;
        setTimeout(function() {
          if(self.firstTextInput) self.firstTextInput.focus();
        }, 150);
      break;
    }
    this.tetherService.position();
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
    switch(name){
      case "selectedDatasourceType":
        this.selectedDatasourceType = event;
        this.setRelatedParams();
      break;
      case "searchParam":
        this.setSearchParam(event);
      break;
      default: 
        target ? target[name] = event : this[name] = event;
    }
    this.changeDetector.detectChanges();
  }

  typeaheadActionEventHandler(event){

  }

  typeaheadSearchEventHandler(event){
    if(event) {
      let relatedEntityTypeParts = this.searchParam.relatedEntityType.split("/");
      let relatedEntityType = relatedEntityTypeParts[0];
      switch(relatedEntityType) {
        case "CmsContent":
          this.cmsDataService.search('Contents', 'Title', event).subscribe( result => this.setSearchResult(result));
        break;
        case "Contents":
        if(relatedEntityTypeParts[1]) this.cmsDataService.search('Contents/'+relatedEntityTypeParts[1], 'Title', event).subscribe( result => this.setSearchResult(result));
        break;
        case "EPerformer":
          this.entityService
            .fromEntity(this.searchParam.relatedEntityType)
            .search('Name', event)
            .take(10000).page(0).executeQuery();
        break;
        default:
          this.entityService
            .fromEntity(this.searchParam.relatedEntityType)
            .search('Localization/Name', event)
            .expand(['Localization'])
            .take(10000).page(0).executeQuery();
        break;
      }
    }
  }

  typeaheadResultEventHandler(event){
    if(event) {
      let relatedParam = this.relatedParams.find( item => item.key == event.params.param.key );
      if(relatedParam) {
        if(!relatedParam.allowMultiple && relatedParam.entities.length == 1) {

        }else{
          let existEntity = relatedParam.entities.find( item => item.id == event.id);
          if(!existEntity) relatedParam.entities.push(event);
          if(!relatedParam.allowMultiple && relatedParam.entities.length == 1) {
            this.setRelatedParamsOptions();
          }
        }
      }
    }
    if(this.typeahead) this.typeahead.reset();
  }

  typeaheadDismissEventHandler(event){
    
  }

  removeEntity(event, entity, relatedParam) {
    if(relatedParam) {
      let existEntity = relatedParam.entities.find( item => item.id == entity.id);
      if(existEntity) {
        relatedParam.entities.splice(relatedParam.entities.indexOf(existEntity), 1);
        this.setRelatedParamsOptions();
      }
    }
  }

  private setSearchParam(param) {
    this.searchParam = param;
    this.searchPlaceholder = this.searchParam.relatedEntityType + " tipinde arama yapınız."
    if(this.typeahead) this.typeahead.reset();
  }

  private setRelatedParams() {
    if(this.selectedDatasourceType) {
      this.relatedParams = this.selectedDatasourceType.params.filter( datasourceParam => datasourceParam.relatedEntityType != null);
      if(this.relatedParams && this.relatedParams.length){
        this.relatedParams.map( item => item.entities = []);
        this.levels.splice(1, 0, {key: "relatedParams", title: "İlişkili Parametreleri Bulun", hasScroll: true})
        this.setRelatedParamsOptions();
      }
    }
  }

  private setRelatedParamsOptions() {
    if(this.relatedParams) {
      this.relatedParamsOptions = [];
      this.relatedParams.forEach( item => {
        if(item.allowMultiple || item.entities.length == 0) this.relatedParamsOptions.push({text: item.key + " ("+item.type+")", value: item});
      });
      if(this.relatedParamsOptions.length > 0) {
        let firstAvailableRelatedParam = this.relatedParams.find( item => item == this.relatedParamsOptions[0].value);
        this.setSearchParam(firstAvailableRelatedParam);
      }
    }
  }

  private setSearchResult( entities ) {
    if(entities && entities.length) {
      let result:{}[] = [];
      entities.forEach( entity => {
        result.push({
          id: entity._id,
          title: entity.Name || entity.Title,
          icon: "developer_board",
          params: {entity: entity, param: this.searchParam}
        })
      });

      this.searchResults = Observable.of([{
        title: "ARAMA SONUÇLARI",
        list: result
      }]);
    }else{
      this.searchResults = null;
    }
  }

  submitClickHandler(event){
    if(!this.currentLevel) return;
    if(this.isValid){
	    switch(this.currentLevel.key) {
	      case "types":
          this.nextLevel();
	      break;
        case "params":
          this.tetherService.close({datasourceType: this.selectedDatasourceType, datasource: this.datasource});
        break;
	      default:
	      	this.nextLevel();
	      break;
	    }
    }
  }

}
