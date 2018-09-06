import { Template } from './../../../../models/template';
import { Venue } from './../../../../models/venue';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { VenueSearchSelectComponent } from './../../common/venue-search-select/venue-search-select.component';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, HostBinding, Input, ComponentRef, ComponentFactoryResolver, Injector, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-venue-select-bar',
  templateUrl: './venue-select-bar.component.html',
  styleUrls: ['./venue-select-bar.component.scss'],
  entryComponents: [VenueSearchSelectComponent]
})
export class VenueSelectBarComponent implements OnInit {
  @HostBinding('class.c-venue-select-bar') true;

  @Output() actionEvent: EventEmitter<{action: string, data?: any}> = new EventEmitter();
  @Output() changeEvent: EventEmitter<{venue: Venue, template: Template, params?:{}}> = new EventEmitter();

  @HostBinding('class.c-venue-select-bar--empty')
  get isEmpty(): boolean { return this.template == null };

  @HostBinding('class.c-venue-select-bar--disabled')
  @Input() isDisabled: boolean;

  @Input() settings: {
    addLabel: string,
    levels: { key: string, title: string, params?:any }[],
    search: {
      title: string,
      placeholder: string,
      presets: { title: string, list: {id: any, title: string, icon?: string, description?:string}[] }[]
      feedback: {
        title: string, 
        description: string, 
        action?: {action: string, label: string, params?: Object}
      }
    }
  }

  @Input() venue: Venue;
  @Input() template: Template;
  @Input() isEditMode: boolean;
  @Input() showTemplateAction: boolean = true;

  venueSearchBox: VenueSearchSelectComponent;
  resultSubscription: any;
  feedbackSubscription: any;
  searchSubscription: any;

  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog) { }

  ngOnInit() {
  }

  selectHandler(result:{id: any, title: string}) {
    this.actionEvent.emit({action: "select", data: result});
    //this.addFirm({id: result.id, name: result.title, type: -1});
  }

  public searchVenue() {
    this.openVenueSearchSelect();
  }

  public selectTemplate() {
    if(this.venue) this.openVenueSearchSelect(this.venue);
  }

  editTemplate() {
    if(this.venue && this.template) this.actionEvent.emit({action: "editTemplate", data: {
      venueId: this.venue.Id,
      templateId: this.template.Id
    }});
  }

  openVenueSearchSelect(venue?:Venue){
    let component:ComponentRef<VenueSearchSelectComponent> = this.resolver.resolveComponentFactory(VenueSearchSelectComponent).create(this.injector);
    this.venueSearchBox = component.instance;
    if(venue) this.venueSearchBox.venue = venue;

    this.venueSearchBox.isTemplateEditable = this.isEditMode;
    this.venueSearchBox.settings = {
      levels: this.settings.levels,
      search: this.settings.search,
    }

    this.venueSearchBox.actionEvent.subscribe( event => this.actionEvent.emit(event) );

    this.tether.modal(component, {
      escapeKeyIsActive: true
    }).then(result => {
      //this.venueInfo = {id: result['venue']['id'], name: result['venue']['name'], template: result['template']['name'], image: result['venue']['image']};
      this.venue = result["venue"];
      this.template = result["template"];
      this.changeEvent.emit({venue: this.venue, template: this.template, params:{action:result["action"]}});
    }).catch( reason => {
      
    });
  }
}
