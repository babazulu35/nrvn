import { cloneDeep } from 'lodash';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { PerformanceProduct } from './../../../../models/performance-product';
import { Product } from './../../../../models/product';
import { Performance } from './../../../../models/performance';
import { Component, OnInit, Input, ComponentFactoryResolver, Injector, HostBinding, ViewChild, Output, EventEmitter, Inject, ChangeDetectorRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';
import { NotificationService } from '../../../../services/notification.service';
import { ExpandableBlockComponent } from '../../../common-module/components/expandable-block/expandable-block.component';
import { TextInputComponent } from '../../../base-module/components/text-input/text-input.component';
import { ProductFactory } from '../../factories/product.factory';
import { ProductSelectionType } from '../../../../models/product-selection-type';
import { EntityService } from '../../../../services/entity.service';
import { RelativeProductPriceBlockComponent } from '../relative-product-price-block/relative-product-price-block.component';
import { PriceList } from '../../../../models/price-list';

@Component({
  selector: 'app-performance-product-block',
  templateUrl: './performance-product-block.component.html',
  styleUrls: ['./performance-product-block.component.scss'],
  providers: [
    { provide: 'currencyEntityService', useClass: EntityService },
  ]
})
export class PerformanceProductBlockComponent implements OnInit {
  @ViewChild(ExpandableBlockComponent) expandableBlock: ExpandableBlockComponent;
  @ViewChild(TextInputComponent) firstTextInput: TextInputComponent;
  @ViewChildren(RelativeProductPriceBlockComponent) priceBlocks: QueryList<RelativeProductPriceBlockComponent>;
  
  @HostBinding('class.c-performance-product-block') true;

  @Output() actionEvent: EventEmitter<Object> = new EventEmitter<Object>();
  @Output() changeEvent: EventEmitter<Product> = new EventEmitter<Product>();
  
  @Input() useFactory: boolean;
  @Input() productFactory: ProductFactory;
  @Input() product: Product;
  @Input() performance: Performance;
  @Input() performanceProduct: PerformanceProduct;
  @Input() contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  @Input() allowCustomProductSelectionType:boolean;

  currencyList: { value: any, text: string, name?: string }[];
	selectedCurrency: { value: any, text: string, name?: string };
  vatList: { value: any, text: string }[];
  priceListActions: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  
  validation: {
    Name: { isValid: any, message: string },
    Vat: { isValid: any, message: string },
    Color: { isValid: any, message: string },
    PriceLists: { isValid: any, message: string },
    PriceBlocks: { isValid: any, message: string }
	} = {
		Name: {
			message: 'Fiyat Blok Adı zorunludur.',
			isValid():boolean {
				return this.product && this.product.isValid("Name", true);
			}
    },
    Vat: {
			message: 'KDV oranı zorunlu alandır!',
			isValid():boolean {
				return this.product && this.product.Vat >= 0;
			}
		},
		Color: {
			message: 'Renk seçimi zorunludur!',
			isValid():boolean {
				return this.product && this.product.IsBundle ? true : this.performanceProduct && this.performanceProduct.CategoryColorSeat;
			}
    },
    PriceLists: {
			message: 'En az bir fiyat bilgisi girişi zorunludur!',
			isValid():boolean {
        return this.product && this.product.PriceLists && this.product.PriceLists.length > 0;
        
			}
		},
    PriceBlocks: {
			message: 'Fiyat bilgilerinde zorunlu alanlar eksik!',
			isValid():boolean {
        return this.priceBlocks ? !this.priceBlocks.toArray().some( item => {return !item.isValid}) : true;
        
			}
		}
	};

	public get isValid(): boolean {
    if (this.product && this.validation
      && this.validation.Name.isValid.call(this)
      && this.validation.Vat.isValid.call(this)
      && this.validation.Color.isValid.call(this)
      && this.validation.PriceLists.isValid.call(this)
      && this.validation.PriceBlocks.isValid.call(this)
    ) {
        return true;
      } else {
			  return false
		}
  };

  get allPriceCollapsed():boolean {
    if(!this.priceBlocks) return false;
		let expandedPriceBlock:RelativeProductPriceBlockComponent = this.priceBlocks.find( priceBlock => priceBlock.expandableBlock.isExpanded );
		return expandedPriceBlock ? false : true;
	}

  constructor(
    @Inject('currencyEntityService') private currencyEntityService: EntityService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tetherService: TetherDialog,
    private notificationService: NotificationService,
    private appSettingsService: AppSettingsService,
    private changeDetector: ChangeDetectorRef,
    public hostElement:ElementRef,
  ) { }

  ngOnInit() {
    
    if(this.productFactory) {
      if(!this.product) this.product = this.productFactory.model.Product;
      if(!this.performanceProduct) this.performanceProduct = this.productFactory.model;
      if(!this.performance) this.performance = this.productFactory.multiplePerformanceService.basePerformanceFactory.model;
      let baseProductFactory = this.productFactory.multiplePerformanceService.baseProductFactory;
      if(baseProductFactory) {
        this.currencyList = cloneDeep(baseProductFactory.currencyList);
        this.vatList = cloneDeep(baseProductFactory.vatList);
        if(!this.product.Vat || this.product.Vat < 0) this.product.Vat = baseProductFactory.defaultVat;
        if(!this.product.CurrencyId) this.product.CurrencyId = baseProductFactory.defaultCurrencyId;
        this.allowCustomProductSelectionType = baseProductFactory.allowCustomProductSelectionType;
      }else{
        this.setCurrencyList();
        this.setVatList();
      }
    }else {
      this.setCurrencyList();
      this.setVatList();
    }
    
    this.priceListActions = [];
    this.priceListActions.push({action: "remove", label: "Fiyatı Sil"});
  }
  
  public collapse() {
    if (this.expandableBlock) this.expandableBlock.collapse();
  }

  public expand () {
    if (this.expandableBlock) this.expandableBlock.expand();
  }

  setCurrencyList(){
    this.currencyEntityService.setCustomEndpoint('GetAll');
    this.currencyEntityService.data.subscribe( result => {
      this.currencyList = [];
      result.forEach( currency => {
        this.currencyList.push({text: `${currency['Code']}`, value: currency['Id'], name: currency['Name']});
        if(this.product && this.product.CurrencyId) this.inputChangeHandler(this.product.CurrencyId, 'CurrencyId');
      });
    });
    this.currencyEntityService.fromEntity('CCurrency').take(100).page(0).executeQuery();
  }

  setVatList() {
    this.vatList = cloneDeep(this.appSettingsService.getLocalSettings('vatList'));
    this.vatList.unshift({text: 'Seçiniz', value: '-1'});
  }

  emitAction(event) {
    if (!event.params) event.params = {};
    event.params.productFactory = this.productFactory;
    event.params.product = this.product;
    event.params.performance = this.performance;
    event.params.performanceProduct = this.performanceProduct;
    this.actionEvent.emit(event);
  }

  inputChangeHandler(event, name: string, target?: any) {
    if(!this.product) return;
    if(!target) target = this.product;

    switch (name) {
      case 'Name':
        target.set("Name", event, true);
      break;
      case "allowCustomProductSelectionType":
        this.allowCustomProductSelectionType = event;
        if(this.productFactory) this.productFactory.allowCustomProductSelectionType = event;
      break;
      case "CategoryColorSeat":
        if(this.performanceProduct) this.performanceProduct.CategoryColorSeat = event.color;
      break;
      case 'CurrencyId':
				this.product.CurrencyId = event;
				this.selectedCurrency = this.currencyList.find( item => item.value == this.product.CurrencyId);
			break;
      default: 
        target.set(name, event);
      break;
    }
  }

  selectionTypeListChangeHandler(selectionTypes: ProductSelectionType[]) {
		if(this.productFactory) this.productFactory.setProductSelectionTypes(selectionTypes);
  }
  
  addNewPrice(event?: any) {
    this.toggleAllPriceBlocks();
    if(this.productFactory) {
      this.productFactory.addPriceListFactory(this.productFactory.multiplePerformanceService.createPriceListFactory({
        IsEnabled: true,
        Type: 1
      }));
    }else{
      this.emitAction({action: "addNewPrice"});
    }
    this.changeDetector.detectChanges();
  }

  removePrice(priceList: PriceList, index) {
		if(!this.product || !this.product.PriceLists) return;
		if(index != null) {
			this.product.PriceLists.splice(index, 1);
		}else{
			let existPriceList: PriceList = this.product.PriceLists.find( item => item.Id == priceList.Id);
			if(existPriceList) this.product.PriceLists.splice(this.product.PriceLists.indexOf(existPriceList), 1);
		}
		this.changeDetector.detectChanges();
	}

  toggleAllPriceBlocks() {
		this.allPriceCollapsed ? this.priceBlocks.forEach( priceBlock => priceBlock.expand() ) : this.priceBlocks.forEach( priceBlock => priceBlock.collapse() );
	}

	productPriceBlockChangeHandler(event, index, priceListFactory) {
    this.changeDetector.detectChanges();
  }
  
  productPriceBlockActionHandler(event, index, priceListFactory) {
		switch(event.action) {
			case 'remove':
        if(!this.product || !this.product.PriceLists) return;
        if(this.useFactory && this.productFactory) {
          this.productFactory.removePriceListFactoryByModel(event.params.priceList);
        }else {
          let index = this.product.PriceLists.indexOf(event.params.variant);
          if(index >= 0) this.product.PriceLists.splice(index, 1);
        }
			break;
    }
    this.changeDetector.detectChanges();
	}

  submitHandler() {
    this.scrollToStart();
    if(this.isValid) this.collapse();
  }

  scrollToStart() {
    console.log("Scroll to block start");
    return this.hostElement.nativeElement.scrollIntoView({block:'start'});
  }
}
