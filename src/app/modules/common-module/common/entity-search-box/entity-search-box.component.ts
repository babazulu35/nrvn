import { EntityService } from './../../../../services/entity.service';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { Observable } from 'rxjs/Observable';
import { SelectboxComponent } from './../../../base-module/components/selectbox/selectbox.component';
import { TypeaheadComponent } from './../../components/typeahead/typeahead.component';
import { Component, OnInit, ViewChild, Output, HostBinding, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-entity-search-box',
  templateUrl: './entity-search-box.component.html',
  styleUrls: ['./entity-search-box.component.scss'],
  providers: [EntityService]
})
export class EntitySearchBoxComponent implements OnInit {
  @ViewChild(TypeaheadComponent) typeahead: TypeaheadComponent;
  @ViewChild(SelectboxComponent) entityTypesSelectBox: SelectboxComponent;
  @HostBinding('class.c-entity-search-box') true;

  @Output() actionEvent:EventEmitter<any> = new EventEmitter();
  @Output() resultEvent:EventEmitter<any> = new EventEmitter();

  @Input() title: string;
  @Input() entityTypes: {name: string, label: string, endpoint: string}[];
  @Input() searchTargets: {name: string, label: string, endpoint: string}[];
  @Input() hasSearchOptions: boolean = true;
  @Input() searchOptions: {text: string, value: any}[];
  @Input() selectedEntitiyType: {name: string, label: string, endpoint: string};
  @Input() selectedSearchTarget: string;
  @Input() entityExpandList: string[][];
  @Input() whereList: any[][];
  @Input() andList: any[][];

  @Input() allowAll: boolean = false;

  searchResults: Observable<{}> | Observable<{ title: string, list: { title?: string, icon?: string, MemberId: any,Name: string,Surname: string,DateOfBirth?: any,Gender: string,PhoneNumber: string,Email: string,ProfilePicture?: string, }[]}[]>;
  presets: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?: any}[] }[]> = Observable.of([]);

  placeholder: {};
  public selectedPlaceholder:string;
  
  constructor(
    private entityService: EntityService,
    private appSettings: AppSettingsService,
    public tetherService: TetherDialog
  ) { }

  ngOnInit() {
    if(this.hasSearchOptions && !this.searchOptions) {
      if(!this.entityTypes) this.entityTypes = this.appSettings.getLocalSettings('entityTypes');
      this.searchOptions = [];
      this.entityTypes.forEach( item => {
        this.searchOptions.push({text: item.label, value: item.endpoint ? item : -1});
      });
      if(!this.selectedEntitiyType && this.entityTypes) this.selectedEntitiyType = this.entityTypes[0];
      if(!this.title) this.title = "İlişkili İçerikler";
    }

    if(this.selectedEntitiyType && this.searchOptions && this.searchOptions.length) this.searchOptionsChangeHandler(this.searchOptions[0].value);
    if(this.selectedEntitiyType && !this.searchOptions && !this.title) {
      this.title = this.selectedEntitiyType.label + " Ekle";
      if(this.typeahead) this.typeahead.searchPlaceholder = this.selectedEntitiyType.label + " ara";
      this.setSelectedSearchTarget();
    }
    
    this.entityService.data.subscribe( result => {
      if(result && this.selectedEntitiyType) {
        let searchResult:{}[] = [];
        let title: string;
        result.forEach( entity => {
          title = entity.Localization ? entity.Localization.Name : entity.Name;
          searchResult.push({
            id: entity.Id, 
            entityType: this.selectedEntitiyType,
            title: title, 
            icon: "event",
            params: {
              entity: entity,
              card: {
                id: entity.Id, 
                entityType: this.selectedEntitiyType,
                title: title, 
                avatar: {
                  title: title,
                  source: entity.Images || entity.Image, 
                }
              },
            }
          })
        });

        this.searchResults = Observable.of([{
          title: "ARAMA SONUÇLARI",
          list: searchResult
        }]);
      }
    });
  }
  resultHandler(event) {
    this.tetherService.close(event);
  }

  dismissHandler(event) {
    
  }
  searchOptionsChangeHandler(event){
    if(this.entityTypes) {
      this.selectedEntitiyType = event;
      this.setSelectedSearchTarget();
      this.typeahead.searchPlaceholder = "İlişkili " + this.selectedEntitiyType.label + " Ara";
    }else {
      this.typeahead.searchPlaceholder = this.selectedEntitiyType.label + " arama yapın";
    }
    this.typeahead.searchValue = "";
  }

  setSelectedSearchTarget() {
    if(!this.selectedEntitiyType) return;
    switch(this.selectedEntitiyType.endpoint) {
      case "EPerformer":
        this.whereList = null;
        this.entityExpandList = null;
        this.selectedSearchTarget = "Name";
      break;
      case "EEvent":       
      this.whereList = []; 
      this.andList = [];
        if(this.allowAll){ 
          this.whereList.push(['Status', '!=', 1, 'EventStatus']);
          this.andList.push(['Status', '!=', 5, 'EventStatus']);
        }else{
          this.whereList.push(['Status', '=', 2, 'EventStatus']);
        }
        if(!this.entityExpandList || !this.entityExpandList.length) {
          this.entityExpandList = [];
          this.entityExpandList.push(['Localization']);
        }
        this.selectedSearchTarget = "Localization/Name";
      break;
      default:
        this.whereList = null;
        if(!this.entityExpandList || !this.entityExpandList.length) {
          this.entityExpandList = [];
          this.entityExpandList.push(['Localization']);
        }
        this.selectedSearchTarget = "Localization/Name";
      break;
    }
  }

  typeaheadActionHandler(event) {
    switch(event.action) {
      case "selectItem":
        this.actionEvent.emit({action: event.action, params: event.params.selectedItem.params});
      break;
      default:
        this.actionEvent.emit(event);
      break;
    }
  }

  search(value:string){
    if(value && value.length > 0 && this.selectedEntitiyType && this.selectedSearchTarget) {
      this.entityService.setCustomEndpoint('GetAll');
      this.entityService
        .fromEntity(this.selectedEntitiyType.endpoint)
        .search(this.selectedSearchTarget, value)        
        .take(1000).page(0);      
      if(this.andList) {
        if(!this.whereList || this.whereList.length == 0){
          this.whereList = [this.andList.shift()]
        } 
      }
      if(this.whereList) this.whereList.forEach( where => {
        this.entityService.where.apply(this.entityService, where);
      });      
      if(this.andList) this.andList.forEach( and => {
        this.entityService.and.apply(this.entityService, and);
      });
      if(this.entityExpandList) this.entityExpandList.forEach( expand => {
        this.entityService.expand(expand);
      });
      this.entityService.executeQuery();
    }
 } 
}


