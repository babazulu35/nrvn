import { CheckboxComponent } from './../../../base-module/components/checkbox/checkbox.component';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { SlicePipe } from '@angular/common';
import { GetIconPipe } from './../../../../pipes/get-icon.pipe';
import { Template } from './../../../../models/template';
import { PhoneFormatPipe } from './../../../../pipes/phone-format.pipe';
import { ImagePipe } from './../../../../pipes/image.pipe';
import { RelativeDatePipe } from './../../../../pipes/relative-date.pipe';
import { VenuesByPerformancesPipe } from './../../../../pipes/venues-by-performances.pipe';
import { EnumTranslatorPipe } from './../../../../pipes/enum-translator.pipe';
import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { AvatarComponent } from './../avatar/avatar.component';
import { Component, OnInit, HostBinding, Input, ViewChild, Output, EventEmitter, Renderer, ElementRef, ContentChild, ComponentRef, ComponentFactoryResolver, Injector, ChangeDetectorRef, HostListener } from '@angular/core';
import { EventStatus } from './../../../../models/event-status.enum';
import { PerformanceStatus } from './../../../../models/performance-status.enum';
import { EventDatesByPerformancesPipe } from './../../../../pipes/event-dates-by-performances.pipe';
import { ContextMenuComponent } from './../context-menu/context-menu.component';
import { LinkyPipe } from '../../../../pipes/linky.pipe';

declare var jQuery;

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss'],
  entryComponents: [ContextMenuComponent]
})

export class CardItemComponent implements OnInit {
  @ViewChild(AvatarComponent) avatar: AvatarComponent;
  @ViewChild(CheckboxComponent) checkbox: CheckboxComponent;
  @ViewChild('descriptionBox') descriptionRef: ElementRef;

  @HostBinding('class.c-card-item') true;

  @HostBinding('class.c-card-item--ghost')
  isGhost: boolean;

  @HostBinding('class.c-card-item--active')
  @Input() isActive: boolean;

  @HostBinding('class.c-card-item--disabled')
  @Input() isDisabled: boolean;

  @HostBinding('class.c-card-item--selected')
  @Input() isSelected: boolean;

  @HostBinding('class.c-card-item--editable')
  @Input() isEditable: boolean;

  @HostBinding('class.c-card-item--hover')
  isHover: boolean;

  @HostBinding('class.c-card-item--hasServices')
  get hasServices(): boolean { return this.services && this.services.length > 0 };

  @HostListener('mouseover') onMouseOver() {
    this.isHover = this.isEditable;
  }

  @Input() isHidden: boolean;

  @HostListener('mouseout') onMouseOut() {
    this.isHover = this.contextMenu != null;
  }

  @Output() actionEvent: EventEmitter<Object> = new EventEmitter();

  @Input() set viewMode(value: string) { // card | ghost
    this.cardViewMode = value;
    this.isGhost = this.cardViewMode == "ghost";
  }

  @Input() set data(data: {entryType: string, model: any}) {
    this.cardData = data;
    this.title = null;
    this.description = null;
    this.avatarData = null;
    this.kinds = null;
    this.services = null;
    this.formatDescription();
    this.setAvatarData();
    this.setKinds();
    this.setIsActive();
    this.setIsEditable();
    this.setActions();
    this.setHeight();
    this.changeDetector.detectChanges();
  }

  @Input() title:string;
  @Input() id:number;
  @Input() description: { text?: string, vars?: any };
  @Input() avatarData: {source?: string, icon?: string, letters?: string, border?: boolean};
  @Input() actions: {action: string, label: string, icon?: string, parameters?: any, group?: any }[];
  @Input() kinds: {key?: string, icon?: string}[];
  @Input() services: {key?:string, icon?:string}[];
  @Input() gotoButtonLabel: string = "İNCELE";
  @Input() hasGoToAction: boolean;

  get statusIcon():string {
    if(this.isDisabled) return "lock";
    if(this.isHidden) return "";

    return this.isActive ? "visibility" : "visibility_off"
  }

  cardData: {entryType: string, model: any, from ?: any};
  cardViewMode: string = 'card';
  contextMenu: ContextMenuComponent;
  routeDetailLink:any;
  routeQueryParams:any;

  constructor(
    private renderer: Renderer,
    private router:Router,
    public element: ElementRef,
    private changeDetector: ChangeDetectorRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog,
    private appSettingsService:AppSettingsService){}

  ngOnInit(){}

  ngAfterViewInit(){
    //Entry Type'a göre parametrik ayarlar

  }

  ngOnChanges(changes){
  	if(changes.isActive){
  		this.setIsActive();
  		this.setActions();
  		this.formatDescription(true);
  		this.changeDetector.detectChanges();
  	}
  }

 	ngOnDestroy(){
      this.changeDetector.detach();
    }
  emitActionEvent(target:string, value: any) {
    switch(target) {
      case "select":
      this.isSelected = value;
      this.actionEvent.emit({target: target, action: value, data: this.cardData});
      break;
      default:
        this.actionEvent.emit({target: target, action: value, data: this.cardData});
      break;
    }

  }

  openContextMenu(event) {
    if(!this.actions || this.actions.length == 0) return;

    let component:ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector)
    this.contextMenu = component.instance;

    this.contextMenu.title = "İŞLEMLER"
    this.contextMenu.data = this.actions;
    if(this.cardData) this.contextMenu.iconSet = this.cardData.entryType;

    this.tether.context(component, {
      target: event.target,
      attachment: "top right",
      targetAttachment: "top right"
    }).then(result => {
      this.emitActionEvent('context', result);
      this.contextMenu = null;
      this.checkMouseOut();
    }).catch( reason => {
      this.contextMenu = null;
      this.checkMouseOut();
    })

  }

  checkMouseOut(){
    this.isHover = jQuery(this.element.nativeElement).is(':hover');
  }

  setIsEditable() {
    if(this.isEditable != undefined) return;
    //Todo Yetkilendirme kontrolü yapılacak
    let isAuthenticated: boolean = true;
    this.isEditable = isAuthenticated && !this.isDisabled && !this.isGhost ;
    if(this.cardData) {
      switch(this.cardData.entryType) {
      	case "boevent":
        this.isEditable = false;
        break;
        case "venue":
        this.isEditable = false;
        break;
        case "template":
        this.isEditable = false;
        break;
        case "performance":
        this.isEditable = false;
      }
    }
  }

  setHeight(){
    let height: string = "360px";
    if(this.cardData) {
      switch(this.cardData.entryType) {
        case "performers":
          height = "380px";
        break;
      }
    }
    this.renderer.setElementStyle(this.element.nativeElement, 'min-height', height);
    this.changeDetector.detectChanges();
  }

  setActions(){
    if(this.actions) return;
    if(this.cardData) {
      let entryTye = this.cardData.entryType;
      let model = this.cardData.model;
      let iconPipe:GetIconPipe = new GetIconPipe();
      let activityName : string = '',
	   	  activityLabel : string = '',
	      activityIcon : string = '';
     	if(this.isActive){
        	activityName = 'deActivate';
        	activityLabel = 'Durdur';
        	activityIcon = 'visibility_off';
        }else{
        	activityName = 'activate';
			activityLabel = 'Aktive Et';
        	activityIcon = 'visibility';
        }
      switch(entryTye) {

        case "event":
          this.actions = [
	            // { label: 'Düzenle', icon: 'edit', action: "editEvent", group:"events"},
	            // { label: 'Aktive Et', icon: 'visibility', action: 'visibilityOn'},
	            // { label: 'Durdur', icon: 'visibility_off', action: 'visibilityOff'},
	           /* { label: 'Arşivle', icon: 'archive', action: 'archive'},*/
	            { label: 'Kaldır', icon: 'delete', action: 'delete'},
	            // { label: 'Kopyala', icon: 'layers', action: 'copy' }
          ]
        break;
        case "boevent":
        	this.actions=[
            { label: 'Hızlı Satışa Ekle', icon: 'whatshot', action: "addToQuickSale"},
          ];
        break;
        case "venue":
          this.actions= [
          	{ action: "editVenue", parameters: { venueId: model.Id }, label: 'Düzenle',icon:'edit' },
          	{ action: activityName, parameters: { venueId: model.Id }, label: activityLabel ,icon:activityIcon }
          ];
        break;
        case "template":
          	this.actions=[
          		{ action: "editTemplate", parameters: { templateId: model.Id }, label: 'Düzenle',icon:'edit' },
          		{ action: activityName, parameters: { templateId: model.Id }, label: activityLabel ,icon:activityIcon },
          	];
        break;
        // case "performance":
        //   this.actions = [
        //     { label: 'Düzenle', icon: 'edit', action: "edit", group:"events"},
        //     { label: 'Aktive Et', icon: 'visibility', action: 'visibilityOn'},
        //     { label: 'Durdur', icon: 'visibility_off', action: 'visibilityOff'},
        //   //  { label: 'Arşivle', icon: 'archive', action: 'archive'},
        //     { label: 'İptal Et', icon: 'do_not_disturb_alt', action: 'delete'},
        //   ]
        // break;
        default:
          this.actions = [
            //{label: 'Kopyala', action: 'copy'},
            //{label: 'Pasif Yap', action: 'visibility_off'},
            //{label: 'Arşive Gönder', action: 'archive'},
            //{label: 'Düzenle', action: 'edit'},
            //{label: 'Sil', action: 'remove'}
          ]
        break;
      }
    }else {
      this.actions = [
          // {label: 'Kopyala', action: 'copy'},
          // {label: 'Pasif Yap', action: 'visibility_off'},
          // {label: 'Arşive Gönder', action: 'archive'},
          // {label: 'Düzenle', action: 'edit'},
          // {label: 'Sil', action: 'remove'}
        ]
    }
    this.changeDetector.detectChanges();
  }

  getLetters(name: string):string {
    if(!name || name.length < 2) return name;
    let parts: string[];
    let letters: string;
    parts = name.split(" ");
    if(parts.length > 1) {
      letters = parts[0].charAt(0).toLocaleUpperCase();
      letters += parts[parts.length-1].charAt(0).toLocaleUpperCase();
    }else{
      letters = name.charAt(0).toLocaleUpperCase();
      if(letters.length>1) letters+= name.charAt(1).toLocaleLowerCase();
    }
    return letters;
  }

  setAvatarData(){
    if(this.avatarData) return;
    if(this.cardData) {
      let entryTye = this.cardData.entryType;
      let model = this.cardData.model;
      let source: string = null;
      let letters: string = null;
      let icon: string = null;
      let border: boolean = false;
      let imagePipe:ImagePipe = new ImagePipe(this.appSettingsService);
      let image: string;
      let name: string;
      let nameParts: string[];

      if(!model) return;
      switch(entryTye) {
        case "event":
          image = model.Images || model.Image;
          if(image && image.length > 0) source = imagePipe.transform(image, 'Event');
          letters = this.getLetters(model.Name || model.EventName);
        break;
        case "boevent":
        	image = model.Images || model.Image;
          	if(image && image.length > 0) source = imagePipe.transform(image, 'Event');
          	letters = this.getLetters(model.Name || model.Localization.Name);
        break;
        case "performer":
          image = model.Images || model.Image;
          if(image && image.length > 0) source = imagePipe.transform(image, 'Performer');
          letters = this.getLetters(model.Name || model.PerformerName);
        break;
        case "performance":
          image = model.Images || model.Image;
          if(image && image.length > 0) source = imagePipe.transform(image, 'Performance');
          letters = this.getLetters(model.Name || model.PerformanceName);
        break;
        case "venue":
          image = model.Images || model.Image;
          if(image && image.length > 0) source = imagePipe.transform(image, 'Venue');
          letters = this.getLetters(model.Name || model.VenueName);
        break;
        // case "template":
        //   source = model.LayoutImage || "assets/images/icon-grid/seating-arrangement01.jpg";
        //   letters = this.getLetters(model.Name || model.TemplateName);
        //   border = true;
        // break;
        case "template":
          image = model.LayoutImage;
          if(image && image.length > 0){
            source = imagePipe.transform(image, 'Template');
          }else{
            source = "assets/images/icon-grid/seating-arrangement01.jpg";
          }
          letters = this.getLetters(model.Name || model.TemplateName);
          border = true;
        break;
        default:

        break;
      }

      if(source || letters || icon) this.avatarData = {source: source, letters: letters, icon: icon, border: border}
      this.changeDetector.detectChanges();
    }
  }

  setKinds(){
    if(this.kinds) return;
    if(this.cardData) {
      let entryTye = this.cardData.entryType;
      let model = this.cardData.model;
      let icon:string;
      switch(entryTye) {
        case "event":
         this.kinds = [{icon: "audiotrack"}];
        break;
        case "boevent":
        	this.kinds = [];
        break;
        case "performer":
          this.kinds = [];
          if(model.Type === 'GROUP' || model.Type === 'Singer') this.kinds.push({icon: "audiotrack"});
        break;
        case "performance":

        break;
        case "venue":
          this.kinds =[];
        break;
        case "template":
          this.kinds = null;
        break;
        default:
          this.kinds = [{icon: "audiotrack"}, {icon: "movie"}];
        break;
      }
      this.changeDetector.detectChanges();
    }
  }

  setIsActive() {
    if(this.cardData) {
      let entryTye = this.cardData.entryType;
      let model = this.cardData.model;
      if(!model) return;
      switch(entryTye) {
        case "event":
          this.isActive = model.Status === EventStatus.OnSale;
        break;
        case "performance":
          this.isActive = model.Status === PerformanceStatus.OnSale;
        break;
        case "boevent":
          this.isActive = model.Status === EventStatus.OnSale;
        break;
        case "peformer":
          this.isActive = model.IsActive;
        break;
        case "template":
        case "venue":
          this.isActive = model.IsActive
        break;
        default:

        break;
      }
      this.changeDetector.detectChanges();
    }
  }

  formatDescription(forceToReload : boolean = false) {
    if(!forceToReload && this.description && this.description.text && this.description.text.length > 0) return;

    //Modelden gelen veriler
    if(this.cardData) {
      let entryType = this.cardData.entryType;
      let model = this.cardData.model;
      let from = this.cardData.from;
      let list: string[] = [];
      let listItem: string;
      let relativeDate = new RelativeDatePipe();
      let phoneFormat = new PhoneFormatPipe();
      let slicePipe = new SlicePipe();
      let linkyPipe = new LinkyPipe();
      let venuesByPerformances =  new VenuesByPerformancesPipe();
      let eventDatesByPerformances =  new EventDatesByPerformancesPipe();
      let enumTranslator =  new EnumTranslatorPipe();

      if(model && model.Id) this.id = model.Id;
      switch(entryType) {
        // Venue Sayfası
        case "venue":
          if(!model) return;
          if(!this.title) {
            this.title = model.Localization && model.Localization.Name || model.Name || model.VenueName;
            if(this.title) {
              let addDots:string= "...";
              if(this.title.length <=32){
                addDots = "";
              }
              this.title = slicePipe.transform(this.title,0,32) + addDots;
            }
          }
          if(from == 'boevent'){
          	this.routeDetailLink = ['boxoffice', 'venue', model.Id, 'events'];
          }else{
          	this.routeDetailLink = [`/${entryType}`,model.Id,'events'];
          }

          if(model.VenueLocationInfo && model.VenueLocationInfo.TownName) {
            listItem = `<li>` + model.VenueLocationInfo.TownName;
            if(model.VenueLocationInfo.CityName) listItem += " / " + model.VenueLocationInfo.CityName;
            if(model.VenueLocationInfo.CountryName) listItem += " / " + model.VenueLocationInfo.CountryName;
            listItem += `<li>`;
            list.push(listItem);
          }

          if(model.TownName && model.CityName && model.CountryName) list.push(`<li>${model.TownName}, ${model.CityName} / ${model.CountryName}</li>`);
          if(model.Town && model.Town.City && model.Town.City.Country) list.push(`<li>${model.Town.Name}, ${model.Town.City.Name} / ${model.Town.City.Country.Localization.Name}</li>`);
          if(model.Phone) list.push(`<li><strong>T.</strong> `+phoneFormat.transform(model.Phone)+`</li>`);
          if(model.WebUrl) {
            list.push(`<li><a href="${model.WebUrl}" target="_blank" style="text-decoration:underline">${linkyPipe.transform(model.WebUrl,26)}</a></li>`);
          }

        break;

        //Event
        case "event":
          if(!model) return;
          if(!this.title) this.title = model.Localization && model.Localization.Tr && model.Localization.Tr.Name || model.Localization && model.Localization.Name|| model.Name || model.EventName || null;
          if(model.Id) this.routeDetailLink = ['event', model.Id];

          listItem = "";
          if(model.Performances){
            listItem += '<li>' + venuesByPerformances.transform(model.Performances) + '</li>';
          }

          if(model.Status){
            listItem += '<li>' + enumTranslator.transform(EventStatus[model.Status]) + '</li>';
          }

          if(listItem) list.push(listItem);

          break;
        case "boevent":
          if(!this.title && model.Localization.Name) this.title = model.Localization.Name;
          if(this.title) this.title = `<span>` + model.Localization.Name + `</span>`;
          if(model['ChildEventCount'] > 0){
            this.routeDetailLink = ['boxoffice', 'events', model.Id, 'events'];
          } else {
            this.routeDetailLink = ['boxoffice', model.Id, 'products'];
          }
          let dates = eventDatesByPerformances.transform(model.Performances);
          if(dates){
            if(dates.BeginDate != dates.EndDate) {
              let dateParts = relativeDate.transform([dates.BeginDate, dates.EndDate], "split");
              listItem = `<li><strong>`+dateParts[0]+` </strong>`+dateParts[1]+`</li>`;
            }else{
              let dateParts = relativeDate.transform([dates.BeginDate], "split");
              listItem = `<li><strong>`+dateParts[0]+` </strong>`+dateParts[1]+`</li>`;
            }
          } else {
            listItem = '';
          }
          if(model.Performances){
            listItem += '<li>' + venuesByPerformances.transform(model.Performances,'odata') + '</li>';
          }
          if(model.Status) list.push(`<li>${enumTranslator.transform(PerformanceStatus[model.Status])}</li>`);
          if(listItem) list.push(listItem);
          if(list && list.length > 0) {
            if(!this.description) this.description = {text: ""};
            this.description.text = "<ul>"
            list.forEach( item => {
              this.description.text += item;
            })
            this.description.text += "</ul>";
          }
          break;
        //Performance
        case "performance":
          if(!model) return;
          if(!this.title) this.title = model.Localization && model.Localization.Tr && model.Localization.Tr.Name || model.Localization && model.Localization.Name|| model.Name || model.PerformanceName || null;
          if(model.Id) this.routeDetailLink = ['performance', model.Id];

          listItem = "";
          if(model.Date) list.push(`<li>${relativeDate.transform([model.Date])}</li>`);
          if(model.VenueTemplate && model.VenueTemplate.Venue) list.push(`<li>${model.VenueTemplate.Venue.Localization && model.VenueTemplate.Venue.Localization.Name}, ${model.VenueTemplate.Venue.Town && model.VenueTemplate.Venue.Town.City && model.VenueTemplate.Venue.Town.City.Name}</li>`);
          if(model.Venue && model.Venue.VenueName) list.push(`<li>${model.Venue.VenueName}, ${model.Venue.CityName}</li>`);
          if(model.Status) list.push(`<li>${enumTranslator.transform(PerformanceStatus[model.Status])}</li>`);

        break;

        //Performer
        case "performer":
          if(!this.title && model.PerformerName) this.title = model.PerformerName;

          if(list && list.length > 0) {
            if(!this.description) this.description = {text: ""};
            this.description.text = "<ul>"
            list.forEach( item => {
              this.description.text += item;
            })
            this.description.text += "</ul>";
          }
        break;

        //Template
        case "template":
          if(!this.title && model.Info) this.title = model.Info;
          if(!this.title && model.Name) this.title = model.Name;
          if(!this.title && model.Localization && model.Localization.Name) this.title = model.Localization.Name;
          if(!this.title && model.Localization && model.Localization.Tr && model.Localization.Name) this.title = model.Localization.Tr.Name;

           this.routeDetailLink = ['venue', model.VenueId, 'template','create'];
           this.routeQueryParams = {queryParams: { 'venueTemplateId': model.Id }};
          if(model.Capacity) {
            listItem = "<li><strong>KAPASİTE</strong><br/>";
            if(model.Capacity.IsStandingCount) listItem += "<strong>A</strong>: " + model.Capacity.IsStandingCount;
            if(model.Capacity.IsStandingCount && model.Capacity.SeatedCount) listItem += ", ";
            if(model.Capacity.SeatedCount) listItem += "<strong>O</strong>: " + model.Capacity.SeatedCount;
            listItem += "</li>"
            list.push(listItem);
          }
        break;
      }

       if(list && list.length > 0) {
          if(!this.description) this.description = {text: ""};
          this.description.text = "<ul>"
          list.forEach( item => {
            this.description.text += item;
          })
          this.description.text += "</ul>";
        }
    }


    if(this.description && this.description.vars) {
      //Açıklama alanı için gelen veriler burada yorumlanacak
    }

    this.changeDetector.detectChanges();
  }

  goToLink() {
    if(this.isGhost) return;
    if(this.hasGoToAction) {
      this.emitActionEvent('goto', 'view');
    }else{
      if(this.routeDetailLink) this.router.navigate(this.routeDetailLink, this.routeQueryParams);
    }
  }

}
