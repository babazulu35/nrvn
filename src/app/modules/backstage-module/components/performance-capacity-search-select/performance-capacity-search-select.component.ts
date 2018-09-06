import { ModalSearchBoxComponent } from './../../../common-module/components/modal-search-box/modal-search-box.component';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { ContextMenuComponent } from './../../../common-module/components/context-menu/context-menu.component';
import { NotificationService } from './../../../../services/notification.service';
import { EntityService } from './../../../../services/entity.service';
import { Venue } from './../../../../models/venue';
import { Template } from './../../../../models/template';
import { Product } from './../../../../models/product';
import { Performance } from './../../../../models/performance';
import { PerformanceStatus } from './../../../../models/performance-status.enum';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, HostBinding, Output, EventEmitter, ComponentFactoryResolver, Injector, ComponentRef, Input, ViewChild, ElementRef, HostListener, Renderer, ChangeDetectorRef, Inject } from '@angular/core';

@Component({
  selector: 'app-performance-capacity-search-select',
  templateUrl: './performance-capacity-search-select.component.html',
  styleUrls: ['./performance-capacity-search-select.component.scss'],
  entryComponents: [ModalSearchBoxComponent],
  providers: [
		{ provide: 'performanceEntityService', useClass: EntityService }, 
		{ provide: 'venueSeatEntityService', useClass: EntityService }, 
    { provide: 'seatedVenueSeatCountEntityService', useClass: EntityService }, 
    { provide: 'standingVenueSeatCountEntityService', useClass: EntityService }, 
  ]
})
export class PerformanceCapacitySearchSelectComponent implements OnInit {
  @ViewChild('list') list: ElementRef;

  @HostListener('window:resize') resizeHandler(){
    this.resize();
  }
  @HostBinding('class.c-performance-capacity-search-select') true;
  @HostBinding('class.main-loader') isLoading: boolean;

  @Output() actionEvent: EventEmitter<{action: string, data?: any}> = new EventEmitter();
  @Output() changeEvent: EventEmitter<Performance> = new EventEmitter();

  performanceCardData: {entryType: string, model: Performance};
  venueCardData: {entryType: string, model: Venue};
  templateCardData: {entryType: string, model: Template};

  get isEmpty(): boolean { return !(this.performanceCardData) };

  @Input() set performance(performance:Performance) {
    this.setCards(performance);
  }
  @Input() product: Product;
  @Input() capacity: number;
  @Input() isEditable: boolean;
  @Input() isSeatSelectionAvailable: boolean;
  @Input() isPromising: boolean;
  

  performancesDic: {} = {};
	
  public searchBox: ModalSearchBoxComponent;
	searchSubscription: any;
	searchBoxActionSubscription: any;
	performanceAction: ContextMenuComponent;
	performanceActionSubscription: any;
  actionBoxIsActive: boolean = false;

  templateCapacity: {seated?: number, standing?: number} = {seated: 0, standing: 0};

  get capacitySelectIsEnabled():boolean {
    return this.product && this.product.Id != null;
  }

  constructor(
    @Inject('performanceEntityService') private performanceEntityService: EntityService,
    @Inject('venueSeatEntityService') private venueSeatEntityService: EntityService,
    @Inject('seatedVenueSeatCountEntityService') private seatedVenueSeatCountEntityService: EntityService,
    @Inject('standingVenueSeatCountEntityService') private standingVenueSeatCountEntityService: EntityService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog,
    private notificationService: NotificationService,
    private renderer: Renderer,
    private changeDetector: ChangeDetectorRef,
    private router: Router
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
							params: {performance: performance}
						});
					});

					this.searchBox.searchResults = Observable.of([{
						title: "ARAMA SONUÇLARI",
						list: result
					}]);
      }
    });

    this.seatedVenueSeatCountEntityService.count.subscribe( count => 
      {
        
        this.templateCapacity.seated = count;
        this.isLoading = false;
        this.actionEvent.emit({action: "loadingEnd"});    
      }  
    );
    this.standingVenueSeatCountEntityService.count.subscribe( count => {
      this.templateCapacity.standing = count
      this.isLoading = false;
      this.actionEvent.emit({action: "loadingEnd"});
    } );
  }

  goto(target:string) {
    switch(target) {
      case "performance":
        this.tether.confirm({
          title: "Sayfadan ayrılmak üzeresiniz!",
          description: "Kaydetmediğiniz veriler kaybolabilir. Yine de devam etmek istiyor musunuz?",
          dismissButton: {label: "VAZGEÇ"},
          confirmButton: {label: "TAMAM", theme: "danger"}
        }).then( result => this.router.navigate(['performance', this.performanceCardData.model.Id])).catch(reoson=>{});
      break;
      case "venue":
        this.tether.confirm({
          title: "Sayfadan ayrılmak üzeresiniz!",
          description: "Kaydetmediğiniz veriler kaybolabilir. Yine de devam etmek istiyor musunuz?",
          dismissButton: {label: "VAZGEÇ"},
          confirmButton: {label: "TAMAM", theme: "danger"}
        }).then( result => this.router.navigate(['venue', this.venueCardData.model.Id])).catch(reoson=>{});
      break;
      case "template":
        this.tether.confirm({
          title: "Sayfadan ayrılmak üzeresiniz!",
          description: "Kaydetmediğiniz veriler kaybolabilir. Yine de devam etmek istiyor musunuz?",
          dismissButton: {label: "VAZGEÇ"},
          confirmButton: {label: "TAMAM", theme: "danger"}
        }).then( result => this.router.navigate(['venue', this.venueCardData.model.Id, "template", "create"], {queryParams: {venueTemplateId: this.templateCardData.model.Id}})).catch(reoson=>{});
      break;
    }
  }

  resize() {
    if(!this.list) return;
    this.renderer.setElementStyle(this.list.nativeElement, 'whiteSpace', "normal");
    this.renderer.setElementStyle(this.list.nativeElement, 'width', "auto");
    let listWidth: number = this.list.nativeElement.offsetWidth;
    this.renderer.setElementStyle(this.list.nativeElement, 'whiteSpace', "nowrap");
    this.renderer.setElementStyle(this.list.nativeElement, 'width', listWidth+"px");
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
      //if(result && result["params"] && result["params"]["performance"]) this.findAddPerformance(result["params"]["performance"].Id);
      if(result && result["params"] && result["params"]["performance"]) this.setCards(result["params"]["performance"]);
			this.searchBoxCloseHandler();
		}).catch( reason => {
			this.searchBoxCloseHandler();
		});
    this.actionEvent.emit({action: "openSearchBox", data: this.searchBox});
	}

  setCards(performance) {
    //console.log(performance);
    if(!performance) {
      this.performanceCardData = this.venueCardData = this.templateCardData = null;
    }else{
      if(this.performanceCardData && this.performanceCardData.model && this.performanceCardData.model.Id == performance.Id) return;
      this.performanceCardData = {
        entryType: "performance",
        model: performance
      };

      this.venueCardData = {
        entryType: "venue",
        model: performance.VenueTemplate.Venue
      }

      this.templateCardData = {
        entryType: "template",
        model: performance.VenueTemplate
      }
      
      this.isLoading = true;
      this.actionEvent.emit({action: "loadingStart"});
      // this.venueSeatEntityService.setCustomEndpoint("GetAll");
      // this.venueSeatEntityService
      //   .fromEntity('EVenueSeat')
      //   .where('VenueRow/VenueBlock/PerformanceId', '=', performance.Id)
      //   .expand(['VenueRow', 'VenueBlock'])
      //   .take(10000)
      //   .page(0)
      //   .executeQuery();

      this.seatedVenueSeatCountEntityService.setCustomEndpoint("GetAll");
      this.seatedVenueSeatCountEntityService
        .fromEntity('EVenueSeat')
        .where('VenueRow/VenueBlock/PerformanceId', '=', performance.Id)
        .and('VenueRow/VenueBlock/IsStanding', '=', 'false')
        .expand(['VenueRow', 'VenueBlock'])
        .take(1)
        .page(0)
        .executeQuery();

      this.standingVenueSeatCountEntityService.setCustomEndpoint("GetAll");
      this.standingVenueSeatCountEntityService
        .fromEntity('EVenueSeat')
        .where('VenueRow/VenueBlock/PerformanceId', '=', performance.Id)
        .and('VenueRow/VenueBlock/IsStanding', '=', 'true')
        .expand(['VenueRow', 'VenueBlock'])
        .take(1)
        .page(0)
        .executeQuery();
    }
    this.changeDetector.detectChanges();
    this.changeEvent.emit(performance);

    let self = this;
    setTimeout(function() {
      self.resize();
    }, 10);
  }

  searchHandler(value) {
    this.performanceEntityService
      .fromEntity('EPerformance')
      .search('Localization/Name', value)
      .expand(['Localization'])
      .expand(['VenueTemplate', 'Localization'])
      .expand(['VenueTemplate', 'Venue', 'Localization'])
      .expand(['VenueTemplate', 'Venue', 'Town', 'City', 'Country', 'Localization'])
      .take(100000)
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

	searchBoxCloseHandler() {
		this.searchBox = null;
		if(this.searchSubscription) this.searchSubscription.unsubscribe();
		if(this.searchBoxActionSubscription) this.searchBoxActionSubscription.unsubscribe();
    this.actionEvent.emit({action: "closeSearchBox", data: this.searchBox});
	}

  emitAction(actionName: string) {
    this.actionEvent.emit({action: actionName});
  }

  showActionBox(){
    this.actionBoxIsActive = true;
  }

  cardActionHandler(event, cardType?:string) {
    console.log(event);
    switch(event.target) {
      case "context":
        switch(event.action.action) {
          case "remove":
            this.performance = null;
            this.changeEvent.emit(this.performance);
          break;
          case "edit":
            this.openSearchBox();
          break;
        }
      break;
      case "goto":
        this.goto(cardType);
      break;
    }
  }

  actionBoxHandler(event) {
    switch(event.action) {
      case "addCapacity":
        this.capacity = event.value;
        if(this.capacity > this.templateCapacity.standing + this.templateCapacity.seated){
          this.notificationService.add({text: "Eklediğiniz kapasite mekanın toplam kapasitesinden daha büyük olamaz", type: "warning"});
          this.capacity = this.templateCapacity.standing + this.templateCapacity.seated;
        }
        this.actionEvent.emit({action: event.action, data: {capacity: this.capacity}});
        this.actionBoxIsActive = false;
      break;
    }
  }

	performanceActionHandler(event: {} | {action: string, params: {performance: Performance}}) {
		switch(event["action"]) {
			case "remove":
				
			break;
      case "edit":
        
      break;
		}
	}
}
