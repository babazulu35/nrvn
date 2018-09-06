import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { PriceList } from './../../../../models/price-list';
import { PerformanceProduct } from './../../../../models/performance-product';
import { Component, OnInit, HostBinding, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-performance-product-select-list',
  templateUrl: './performance-product-select-list.component.html',
  styleUrls: ['./performance-product-select-list.component.scss']
})
export class PerformanceProductSelectListComponent implements OnInit {
  @HostBinding('class.c-performance-product-select-list') true;

  @Output() changeEvent:EventEmitter<PerformanceProduct> = new EventEmitter();
  @Output() actionEvent:EventEmitter<{action: string, performanceProduct?: PerformanceProduct, params?:any}> = new EventEmitter();

  @Input() set performanceProducts(performanceProducts: PerformanceProduct[]) {
    if(!performanceProducts) {
      this.items = null;
      return;
    }
    this.items = [];
    performanceProducts.forEach( performanceProduct => {
      this.items.push({
        performanceProduct: performanceProduct,
        defaultPriceList: this.getDefaultPriceList(performanceProduct)
      });
    });
    if(this.items && !this.selectedItem) this.selectItem(this.items[0]);
  };

  @Input() set selectedPerformanceProduct(performanceProduct: PerformanceProduct) {
    if(!this.items) return;
    let existItem = this.items.find( item => item.performanceProduct == performanceProduct);
    this.selectItem(existItem);
  }

  @Input() actions: {action: string, label: string, icon?: string, params?: any}[];

  items: {
    performanceProduct: PerformanceProduct,
    defaultPriceList?: PriceList
    isDisabled?: boolean,
    isSelected?:boolean
  }[];

  selectedItem: {
    performanceProduct: PerformanceProduct
    defaultPriceList?: PriceList
    isDisabled?: boolean,
    isSelected?:boolean
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private tetherService: TetherDialog
  ) { }

  ngOnInit() {
    if(!this.actions) {
      this.actions = [];
      this.actions.push({action: "clearCapacity", label: "Kapasite Temizle", icon: "delete"});
    }
  }

  itemClickHandler($event, item) {
    this.selectItem(item)
  }

  selectItem(item) {
    if(!item || item.isDisabled) return;
    this.selectedItem = item;
    this.items.map( existItem => existItem.isSelected = existItem == this.selectedItem );
    this.changeEvent.emit(this.selectedItem ? this.selectedItem.performanceProduct : null);
    this.changeDetector.detectChanges();
  }

  openActionsMenu(event: any) {
    this.tetherService.context({
      title: "İŞLEMLER",
      data: this.actions
    }, {target: event.target, attachment: "top right", targetAttachment: "top right",}).then( result => {
      this.actionEvent.emit({
        action: result.action,
        performanceProduct: this.selectedItem ? this.selectedItem.performanceProduct : null
      })
    }).catch(e => {});
  }

  private getDefaultPriceList(performanceProduct: PerformanceProduct): PriceList {
    let priceList: PriceList;
    if(performanceProduct && performanceProduct.Product && performanceProduct.Product.PriceLists && performanceProduct.Product.PriceLists.length) {
      //performanceProduct.Product.PriceLists.find( item => item.); //filter pricelist
      priceList = performanceProduct.Product.PriceLists[0];
    }
    return priceList;
  }

}
