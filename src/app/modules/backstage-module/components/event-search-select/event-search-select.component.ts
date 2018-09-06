import { Event } from './../../../../models/event';
import { Observable } from 'rxjs/Observable';
import { NotificationService } from './../../../../services/notification.service';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { RelativeDatePipe } from './../../../../pipes/relative-date.pipe';
import { ContextMenuComponent } from './../../../common-module/components/context-menu/context-menu.component';
import { ModalSearchBoxComponent } from './../../../common-module/components/modal-search-box/modal-search-box.component';
import { EntityService } from './../../../../services/entity.service';
import { Component, OnInit, HostBinding, Output, EventEmitter, ComponentFactoryResolver, Injector, ComponentRef, Input } from '@angular/core';

@Component({
  selector: 'app-event-search-select',
  templateUrl: './event-search-select.component.html',
  styleUrls: ['./event-search-select.component.scss'],
  providers: [EntityService]
})
export class EventSearchSelectComponent implements OnInit {
  @HostBinding('class.c-event-search-select') true;

  @Output() actionEvent: EventEmitter<{action: string, data?: any}> = new EventEmitter();
  @Output() changeEvent: EventEmitter<Event[]> = new EventEmitter();

  get isEmpty(): boolean { return !this.events || this.events.length == 0 };

  @Input() events: Event[];

  eventsDic: {} = {};
	
  public searchBox: ModalSearchBoxComponent;
	searchSubscription: any;
	searchBoxActionSubscription: any;
	eventAction: ContextMenuComponent;
	eventActionSubscription: any;
  relativeDate: RelativeDatePipe = new RelativeDatePipe();

  constructor(
    private eventEntityService: EntityService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.eventEntityService.setCustomEndpoint('GetAll');
    this.eventEntityService.data.subscribe ( events => {
			if(events && this.searchBox) {
        let result:{}[] = [];
        events.forEach(event => {
          result.push({
            id: event.Id, 
            title: event.Localization.Name, 
            icon: "event",
            disabled: event.ParentId > 0,
            params: {event: event}
          })
        });

        this.searchBox.searchResults = Observable.of([{
          title: "ARAMA SONUÇLARI",
          list: result
        }]);
      }
		});
  }

  public openSearchBox() {
		let component: ComponentRef<ModalSearchBoxComponent> = this.resolver.resolveComponentFactory(ModalSearchBoxComponent).create(this.injector);
		this.searchBox = component.instance;

		this.searchBox.title = "Etkinlik Ekle";
		this.searchBox.presets = Observable.of([]);
		this.searchBox.settings = {
			search: {
				placeholder: "Eklemek istediğiniz performans adını yazınız",
				feedback: {
					title: "Aramanız ile eşleşen performans bulunamadı", 
					description: "Arama kriterini değiştirerek yeniden deneyebilir ya da yeni performans ekleyebilirsiniz.", 
					action: {action: "gotoLink", label: "YENİ ETKİNLİK OLUŞTUR", params: {link: "event/create"}},
					icon: {type: "svg", name: "performance"}
				}
			}
		}

		this.searchSubscription = this.searchBox.searchEvent.subscribe( value => this.searchHandler(value));
		this.searchBoxActionSubscription = this.searchBox.actionEvent.subscribe( action => this.searchBoxActionHandler(action));
		
		this.tether.modal(component, {
			escapeKeyIsActive: true,
		}).then(result => {
      if(result && result["params"] && result["params"]["event"]) this.addEvent(result["params"]["event"]);
			this.searchBoxCloseHandler();
		}).catch( reason => {
			this.searchBoxCloseHandler();
		});
    this.actionEvent.emit({action: "openSearchBox", data: this.searchBox});
	}

  searchHandler(value) {
		this.eventEntityService
      .fromEntity('EEvent')
      .search('Localization/Name', value)
      .where('ChildEventCount', '=', 0)
      .expand(['Localization'])
      .expand(['Performances'])
      .take(100)
      .page(0)
      .executeQuery();
	}

	searchBoxActionHandler(event) {
		switch(event.action) {
			case "gotoLink":
			if(event.params.link == "event/create") {
				this.actionEvent.emit({action: "createEvent"});
			}
			break;
		}
	}

	addEvent(event: Event) {
    if(this.eventsDic[event.Id.toString()]) {
      this.actionEvent.emit({action: "exist", data: event})
      this.notificationService.add({text: '<b>'+event.Localization["Name"] + '</b> daha önce eklendi!', type:'danger'});
      return;
    }
    if(!this.events) this.events = [];
    this.eventsDic[event.Id.toString()] = event;
    this.events.push(event);
    this.actionEvent.emit({action: "add", data: event})
    this.changeEvent.emit(this.events);
	}

  removeEvent(id: number) {
    let targetEvent: Event = this.events.find( event => event.Id == id );
    if(targetEvent) {
      this.events.splice(this.events.indexOf(targetEvent), 1);
      delete this.eventsDic[targetEvent.Id.toString()];
      this.actionEvent.emit({action: "remove", data: targetEvent})
      this.changeEvent.emit(this.events);
    }
  }

	searchBoxCloseHandler() {
		this.searchBox = null;
		if(this.searchSubscription) this.searchSubscription.unsubscribe();
		if(this.searchBoxActionSubscription) this.searchBoxActionSubscription.unsubscribe();
    this.actionEvent.emit({action: "closeSearchBox", data: this.searchBox});
	}

	openEventActions(event:Event, e) {
    this.tether.context({
			title: "İŞLEMLER",
			data: [
				{action: "remove", label: "Sil", icon: "delete", params: {event: event}}
			]
		}, {target: e.target, attachment: "top right", targetAttachment: "top right",}).then( action => this.eventActionHandler(action)).catch(error => {});
	}

	eventActionHandler(event: {} | {action: string, params: {event: Event}}) {
		switch(event["action"]) {
			case "remove":
				if(this.events && this.events.length > 0 && event["params"]  && event["params"].event) {
					this.removeEvent(event["params"].event.Id);
				}
			break;
      case "edit":
        //if(event["params"]  && event["params"].event) this.openPerformerCreate(event["params"].performer);
      break;
		}
	}
}
