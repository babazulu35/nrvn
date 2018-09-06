import { Performance } from './../../../../models/performance';
import { ModalSearchBoxComponent } from './../../../common-module/components/modal-search-box/modal-search-box.component';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { ContextMenuComponent } from './../../../common-module/components/context-menu/context-menu.component';
import { NotificationService } from './../../../../services/notification.service';
import { EntityService } from './../../../../services/entity.service';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, HostBinding, Output, EventEmitter, ComponentFactoryResolver, Injector, ComponentRef, Input } from '@angular/core';

@Component({
  selector: 'app-performance-search-select',
  templateUrl: './performance-search-select.component.html',
  styleUrls: ['./performance-search-select.component.scss'],
	providers: [EntityService],
	entryComponents: [ModalSearchBoxComponent]
})
export class PerformanceSearchSelectComponent implements OnInit {
  @HostBinding('class.c-performance-search-select') true;

  @Output() actionEvent: EventEmitter<{action: string, data?: any}> = new EventEmitter();
  @Output() changeEvent: EventEmitter<Performance[]> = new EventEmitter();

  get isEmpty(): boolean { return !this.performances || this.performances.length == 0 };

  @Input() performances: Performance[];

  performancesDic: {} = {};
	
  public searchBox: ModalSearchBoxComponent;
	searchSubscription: any;
	searchBoxActionSubscription: any;
	performanceAction: ContextMenuComponent;
	performanceActionSubscription: any;

  public findPerformanceIsActive: boolean = false;

  constructor(
    private performanceEntityService: EntityService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
		 this.performanceEntityService.setCustomEndpoint("GetAll");
			this.performanceEntityService.data.subscribe( performances => {
				if(this.searchBox) {
					let result:{}[] = [];
						performances.forEach(performance => {
							result.push({
								id: performance.Id, 
								title: performance.Localization.Name, 
								icon: "performance",
								disabled: performance.EventId != null,
								params: {performance: performance}
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

		this.searchBox.title = "Performans Ekle";
		this.searchBox.presets = Observable.of([]);
		this.searchBox.settings = {
			search: {
				placeholder: "Eklemek istediğiniz performans adını yazınız",
				feedback: {
					title: "Aramanız ile eşleşen performans bulunamadı", 
					description: "Arama kriterini değiştirerek yeniden deneyebilir ya da yeni performans ekleyebilirsiniz.", 
					action: {action: "gotoLink", label: "YENİ PERFORMANS OLUŞTUR", params: {link: "performance/create"}},
					icon: {type: "svg", name: "performance"}
				}
			}
		}

		this.searchSubscription = this.searchBox.searchEvent.subscribe( value => this.searchHandler(value));
		this.searchBoxActionSubscription = this.searchBox.actionEvent.subscribe( action => this.searchBoxActionHandler(action));
		
		this.tether.modal(component, {
			escapeKeyIsActive: true,
		}).then(result => {
      if(result && result["params"] && result["params"]["performance"]) this.addPerformance(result["params"]["performance"]);
			this.searchBoxCloseHandler();
		}).catch( reason => {
			this.searchBoxCloseHandler();
		});
    this.actionEvent.emit({action: "openSearchBox", data: this.searchBox});
	}

  searchHandler(value) {
		this.performanceEntityService
      .fromEntity('EPerformance')
      .search('Localization/Name', value)
      .expand(['Localization'])
      .expand(['VenueTemplate', 'Localization'])
      .expand(['VenueTemplate', 'Venue', 'Localization'])
      .expand(['VenueTemplate', 'Venue', 'Town', 'City', 'Country', 'Localization'])
			.take(100)
      .page(0)
      .executeQuery();
	}

	searchBoxActionHandler(event) {
		switch(event.action) {
			case "gotoLink":
			if(event.params.link == "performance/create") {
				this.actionEvent.emit({action: "createPerformance"});
			}
			break;
		}
	}

	addPerformance(performance: Performance) {
    if(this.performancesDic[performance.Id.toString()]) {
      this.actionEvent.emit({action: "exist", data: performance})
      this.notificationService.add({text: '<b>'+performance.PerformanceName + '</b> daha önce eklendi!', type:'danger'});
      return;
    }
    if(!this.performances) this.performances = [];
    this.performancesDic[performance.Id.toString()] = performance;
    this.performances.push(performance);
    this.actionEvent.emit({action: "add", data: performance})
    this.changeEvent.emit(this.performances);
    this.findPerformanceIsActive = false;
	}

  removePerformance(id: number) {
    let targetPerformance: Performance = this.performances.find( performance => performance.Id == id );
    if(targetPerformance) {
      this.performances.splice(this.performances.indexOf(targetPerformance), 1);
      delete this.performancesDic[targetPerformance.Id.toString()];
      this.actionEvent.emit({action: "remove", data: targetPerformance})
      this.changeEvent.emit(this.performances);
    }
  }

	searchBoxCloseHandler() {
		this.searchBox = null;
		if(this.searchSubscription) this.searchSubscription.unsubscribe();
		if(this.searchBoxActionSubscription) this.searchBoxActionSubscription.unsubscribe();
    this.actionEvent.emit({action: "closeSearchBox", data: this.searchBox});
	}

	openPerformanceActions(performance:Performance, event) {
		this.tether.context({
			title: "İŞLEMLER",
			data: [
				{action: "remove", label: "Sil", icon: "delete", params: {event: event}}
			]
		}, {target: event.target, attachment: "top right", targetAttachment: "top right",}).then( action => this.performanceActionHandler(action)).catch(error => {});
	}

	performanceActionHandler(event: {} | {action: string, params: {performance: Performance}}) {
		switch(event["action"]) {
			case "remove":
				if(this.performances && this.performances.length > 0 && event["params"]  && event["params"].performance) {
					this.removePerformance(event["params"].performance.Id);
				}
			break;
      case "edit":
        //if(event["params"]  && event["params"].performance) this.openPerformerCreate(event["params"].performer);
      break;
		}
	}
}
