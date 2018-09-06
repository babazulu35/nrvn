import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { Template } from './../../../../models/template';
import { Venue } from './../../../../models/venue';
import { IconGridComponent } from './../../../common-module/components/icon-grid/icon-grid.component';
import { TypeaheadComponent } from './../../../common-module/components/typeahead/typeahead.component';
import { WizardHeaderComponent } from './../../../common-module/components/wizard-header/wizard-header.component';
import { DialogBoxComponent } from './../../../base-module/components/dialog-box/dialog-box.component';
import { TemplateService } from './../../../../services/template.service';
import { VenueService } from './../../../../services/venue.service';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, ViewChild, Input, HostBinding, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-venue-search-select',
  templateUrl: './venue-search-select.component.html',
  styleUrls: ['./venue-search-select.component.scss'],
  providers: [VenueService, TemplateService]
})
export class VenueSearchSelectComponent implements OnInit {
  @ViewChild(DialogBoxComponent) dialogBox: DialogBoxComponent;
  @ViewChild(WizardHeaderComponent) wizardHeader: WizardHeaderComponent;
  @ViewChild(TypeaheadComponent) typeahead: TypeaheadComponent;
  @ViewChild(IconGridComponent) iconGrid: IconGridComponent;

  @HostBinding('class.oc-venue-search-select') true;

  @Output() changeEvent: EventEmitter<{venue: string, template: string}> = new EventEmitter();
  @Output() actionEvent: EventEmitter<{action: string, params?: any}> = new EventEmitter();

  @Input() title: string;
  @Input() isTemplateEditable: boolean;

  @Input() settings: {
    levels: { key: string, title: string, params?:any }[],
    search: {
      placeholder: string,
      feedback: {
        title: string,
        description: string,
        icon?: {type: string, name: string },
        action?: {action: string, label: string, params?: Object}
      }
    },
    template?: {
      canAddNewTemplate: boolean,
      addNewTemplateLabel: string
    }
  }

  @Input() venuePresets: Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string}[] }[]>;
  @Input() venueSearchResults: Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string}[] }[]>;
  @Input() templates: {id: any, text: string, path: string, actions?:{label: string, router: string}[], params?: {template: Template}}[];
  @Input() venue: Venue;

  get levels() { return this.settings.levels };
  public currentLevel: { key: string, title: string, params?:any };
  public currentLevelIndex: number = -1;
  public selectedVenue: {id: any, name: string, image?: string, params: {venue: Venue}};
  public selectedTemplate: {id: any, name: string, image?: string, params: {template: Template}};

  public venues: Venue[];

  public isPromising: boolean = false;

  constructor(
    public venueService: VenueService,
    public templateService: TemplateService,
    public tether: TetherDialog,
    public changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this.venueService.data.subscribe(
        venues => {
            this.venues = venues;
            if(this.venues) {
              let result:{id: any, title: string, icon?: string, description?:string, params?: any}[] = [];
              this.venues.forEach(venue => {
                result.push({
                  id: venue.Id,
                  title: venue.Name,
                  icon: "add_location",
                  params: {venue: venue}
                });
              });
              if(this.typeahead) {
                this.typeahead.searchData = Observable.of([{
                  title: "ARAMA SONUÇLARI",
                  list: result
                }]);
              }
              this.dialogBox.position();
              this.tether.position();
            }
        }
    );

    this.templateService.data.subscribe(
        templates => {
            if(templates) {
              let result = [];
              templates.forEach( template => {
                result.push({
                  id: template.Id,
                  text: template["Name"],
                  path: "assets/images/icon-grid/seating-arrangement02.jpg",
                  // actions: !this.isTemplateEditable ? [{label: "SEÇ", name: "select"}] : [{label: "SEÇ", name: "select"}, {label: "DÜZENLE", name: "edit"}],
                  params: {template: template}
                })
              });
              this.templates = result;

              if(this.iconGrid) this.iconGrid.position();
              this.isPromising = false;
              this.dialogBox.position();
              this.tether.position();
            }
        }
    );


    //Servis dışardan çağrılırsa bu blok iptal edilecek
    this.title = "Mekan Ekle"
    this.settings = {
      levels: [
        {key: "venue", title:"Mekan Seçimi"},
        {key: "template", title:"Oturma Düzeni Seçimi"},
      ],
      search: {
        placeholder: "Eklemek istediğiniz mekan adını yazınız",
        feedback: {
            title: 'Aramanız ile eşleşen mekan kaydı bulunamadı',
            description: 'Arama kriterlerini değiştirerek yeniden deneyebilir ya da yeni mekan ekleyebilirsiniz',
            icon: {type: "svg", name: "performance"},
            action: {
                action: 'createNewVenue',
                label: 'YENİ MEKAN OLUŞTUR',
                params: { link: '/venue/create' }
            }
        }
      },
      template: {
        canAddNewTemplate: false,
        addNewTemplateLabel: "Yeni Oturma Düzeni"
      }
    };

    this.venuePresets = Observable.of([]);
  }

  ngAfterViewInit() {
    if(this.venue) { 
      this.selectedVenue = {id: this.venue.Id, name: this.venue.Localization.Name, image: this.venue.Images, params: {venue:this.venue} };
      this.gotoLevel(1);
    }else{
      this.gotoLevel(0);
    }
  }

  ngOnDestroy() {

  }

  wizardActionHandler(event:{action: string, params?: any}) {
    switch(event.action) {
      case "goBack":
        this.previousLevel();
      break;
    }
  }

  nextLevel() {
    this.gotoLevel(Math.min(this.currentLevelIndex + 1, this.levels.length-1));
  }

  previousLevel() {
    this.gotoLevel(Math.max(this.currentLevelIndex - 1, 0));
  }

  gotoLevel(key: any) {
    this.isPromising = false;
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

    if(this.currentLevel && this.currentLevel.key == "template") {
      this.templateService.setCustomEndpoint('GetVTemplateList');
      if(this.templateService && this.selectedVenue) this.templateService.query({page: 0, pageSize:1000, filter:[{filter: `VenueId eq ${this.selectedVenue.id} and IsActive eq true`}]});
      this.isPromising = true;
    }
    this.changeDetector.detectChanges();
    this.tether.position();
  }

  venueActionHandler(event) {
    this.actionEvent.emit(event);
  }

  venueSearchHandler(value:string) {
    this.venueService.setCustomEndpoint('GetVenueList');
    if(value && value.length > 0) this.venueService.query({ page: 0, pageSize: 10, search: {key:'Name', value:value}, filter: [{filter: `IsActive eq true`}] });
    // if(value && value.length > 0) this.venueService.query({ page: 0, pageSize: 1000, search: {key:'Name', value:value} });
  }

  venueSelectHandler(event) {
    this.selectedVenue = {id: event.id, name: event.title, image: event.params.venue.Images, params: event.params};
    this.nextLevel();
  }

  dismissHandler(event) {
    this.tether.dismiss(event);
  }

  templateActionHandler(event:{action: string, params?:any}) {
    switch(event.action) {
      case "action":
        this.selectedTemplate = {id: event.params.object.id, name: event.params.object.text, image: event.params.object.path, params: event.params.object.params};
        this.tether.close( {
          venue: this.selectedVenue.params.venue,
          template: this.selectedTemplate.params.template,
          action: event.params.value.name
        })
      break;
      case "select":
        this.selectedTemplate = {id: event.params.object.id, name: event.params.object.text, image: event.params.object.path, params: event.params.object.params};
        this.tether.close( {
          venue: this.selectedVenue.params.venue,
          template: this.selectedTemplate.params.template
        });
      break;
      case "new":
        this.tether.close({
          venue: this.selectedVenue.params.venue,
          template: null
        })
      break;
      case "action":

      break;
    }
  }

}
