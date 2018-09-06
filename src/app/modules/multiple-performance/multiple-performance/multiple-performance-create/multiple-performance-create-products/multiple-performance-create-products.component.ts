import { Router } from '@angular/router';
import { PerformanceProductBlockComponent } from './../../../components/performance-product-block/performance-product-block.component';
import { PerformanceFactory } from './../../../factories/performance.factory';
import { EventFactory } from './../../../factories/event.factory';
import { ProductService } from './../../../../../services/product.service';
import { Component, OnInit, ComponentRef, Injector, ComponentFactoryResolver, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { MulitplePerformanceService } from '../../../mulitple-performance.service';
import { Performance } from './../../../../../models/performance';
import { Event } from './../../../../../models/event';
import { EntitySearchBoxComponent } from '../../../../common-module/common/entity-search-box/entity-search-box.component';
import { TetherDialog } from '../../../../common-module/modules/tether-dialog/tether-dialog';
import { NotificationService } from '../../../../../services/notification.service';
import { AppSettingsService } from '../../../../../services/app-settings.service';
import { Product } from '../../../../../models/product';
import { EntityService } from '../../../../../services/entity.service';
import { ProductFactory } from '../../../factories/product.factory';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-multiple-performance-create-products',
  templateUrl: './multiple-performance-create-products.component.html',
  styleUrls: ['./multiple-performance-create-products.component.scss'],
  providers: [
    ProductService,
    { provide: 'entityTypeEntityService', useClass: EntityService }
  ],
  entryComponents: [EntitySearchBoxComponent]
})
export class MultiplePerformanceCreateProductsComponent implements OnInit {
  @ViewChildren(PerformanceProductBlockComponent) performanceProductBlocks: QueryList<PerformanceProductBlockComponent>;
  
  isLoading: boolean;
  entitySearchBox: EntitySearchBoxComponent;

  event: Event;
  performance: Performance;
  currentEventFacotry: EventFactory;
  basePerformanceFactory: PerformanceFactory;
  baseProductFactory: ProductFactory;

  eventSubscription: Subscription;
  performanceSubscription: Subscription;
  productSubsription: Subscription;
  
  performanceProductBlockActions: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  
  get levels() { return this.multiplePerformanceService.levels; }
  get currentLevel() { return this.multiplePerformanceService.currentLevel }

  validation: {
    PerformanceProductBlocks: { isValid: any, message: string },
    GeneralProductSettings: { isValid: any, message: string },
	} = {
		PerformanceProductBlocks: {
			message: 'Fiyat bilgilerinde zorunlu alanlar eksik!',
			isValid():boolean {
        return this.performanceProductBlocks && this.performanceProductBlocks.toArray().length > 0  ? !this.performanceProductBlocks.toArray().some( item => {return !item.isValid}) : false;
			}
    },
    GeneralProductSettings: {
      message: 'Genel Ürün Ayarlarında eksik kısımlar var!',
      isValid(): boolean{
        let vatValidation = this.baseProductFactory ? this.baseProductFactory['defaultVat'] != null : false;
        let ticketingFeeValidation = this.baseProductFactory ? this.baseProductFactory['defaultTicketingFee'] != null : false;
        return vatValidation && ticketingFeeValidation || (this.basePerformanceFactory && this.basePerformanceFactory.modelId);
      }
    }
	};

	get isValid():boolean {
		if( this.validation
			&& this.validation.PerformanceProductBlocks.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
  };
  
  get isValidForAddProduct():boolean {
    if (this.validation &&
        this.validation.GeneralProductSettings.isValid.call(this)){
          return true
        }else{
          return false
        }
  };

	get allProductCollapsed():boolean {
		let expandedProductBlock:PerformanceProductBlockComponent = this.performanceProductBlocks.find( productBlock => productBlock.expandableBlock.isExpanded );
		return expandedProductBlock ? false : true;
  }
  
  constructor(
    public multiplePerformanceService: MulitplePerformanceService,
    private productService: ProductService,
    private appSettingsService: AppSettingsService,
    private router: Router,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    public tetherService: TetherDialog,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.performanceProductBlockActions = [];
    this.performanceProductBlockActions.push({action: "remove", label: "Ürünü Sil"});
    
    this.productSubsription = this.multiplePerformanceService.baseProductFactory$.subscribe( productFactory => {
      this.baseProductFactory = productFactory;
    });

    this.eventSubscription = this.multiplePerformanceService.currentEventFactory$.subscribe( currentEventFactory => {
      this.currentEventFacotry = this.currentEventFacotry;
      if(currentEventFactory) {
        this.event = currentEventFactory.model;
      }
      this.changeDetector.detectChanges();
    });
    this.performanceSubscription = this.multiplePerformanceService.basePerformanceFactory$.subscribe( performanceFactory => {
      this.basePerformanceFactory = performanceFactory;
      if(performanceFactory) {
        this.performance = performanceFactory.model;
      }
      this.changeDetector.detectChanges();
    });
    this.performanceProductBlocks.changes.subscribe( blocks => this.changeDetector.detectChanges());
  }

  ngOnDestroy() {
    if(this.eventSubscription) this.eventSubscription.unsubscribe();
    if(this.performanceSubscription) this.performanceSubscription.unsubscribe();
    if(this.productSubsription) this.productSubsription.unsubscribe();
  }

  toggleAllProductBlocks() {
		this.allProductCollapsed ? this.performanceProductBlocks.forEach( productBlock => productBlock.expand() ) : this.performanceProductBlocks.forEach( productBlock => productBlock.collapse() );
  }

  inputChangeHandler(event: any, name: string, target?:any) {
    if(target) target[name] = event;
  }
  
  addNewProduct(event?: any) {
    if(!this.allProductCollapsed) this.toggleAllProductBlocks();
    if(this.basePerformanceFactory) this.basePerformanceFactory.addProductFactory(this.multiplePerformanceService.createProductFactory(null, {
      GroupId: 1,
      // CurrencyId: 19,
      IsRefundable: true,
      MaxProductsPerTrx: 9,
      IsBundle: false,
    }));
    
  }

  removeProduct(productFactory: ProductFactory) {
    if(this.basePerformanceFactory) this.basePerformanceFactory.removeProductFactory(productFactory);
  }

  performanceProductBlockActionHandler(event, index) {
    if(!event) return;
    switch(event.action) {
      case 'remove':
        if(event.params && event.params.productFactory) this.basePerformanceFactory.removeProductFactoryById(event.params.productFactory.factoryId);
      break;
    }
  }

  performanceProductBlockChangeHandler(event, index) {

  }

  submitEvent(event) {
    this.multiplePerformanceService.createPayload().then( result => {
      this.router.navigate(['/multiple-performance', 'create', 'capacity']);
    }).catch( reason => console.log("error : ", reason));
  }
}
