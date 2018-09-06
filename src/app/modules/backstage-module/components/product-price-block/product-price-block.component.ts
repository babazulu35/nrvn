import { Firm } from './../../../../models/firm';
import { VariantPrice } from './../../../../models/variant-price';
import { Variant } from './../../../../models/variant';
import { PriceList } from './../../../../models/price-list';
import { NotificationService } from './../../../../services/notification.service';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { ExpandableBlockComponent } from './../../../common-module/components/expandable-block/expandable-block.component';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { Performance } from './../../../../models/performance';
import { Product } from './../../../../models/product';
import { AddVariantPriceBoxComponent } from './../../common/add-variant-price-box/add-variant-price-box.component';
import { AddVariantBoxComponent } from './../../common/add-variant-box/add-variant-box.component';
import { Component, OnInit, HostBinding, Input, Output, EventEmitter, ComponentRef, ComponentFactoryResolver, Injector, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import * as moment from 'moment';
import { PriceListType } from '../../../../models/price-list-type.enum';
import { NextPriceInfo } from '../../../../models/next-price-info';
declare var $: any;

@Component({
  selector: 'app-product-price-block',
  templateUrl: './product-price-block.component.html',
  styleUrls: ['./product-price-block.component.scss'],
  entryComponents: [AddVariantBoxComponent, AddVariantPriceBoxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductPriceBlockComponent implements OnInit {
  @ViewChild(ExpandableBlockComponent) expandableBlock: ExpandableBlockComponent;
  @ViewChild(TextInputComponent) firstTextInput: TextInputComponent;

  @HostBinding('class.c-product-price-block') true;

  @Output() actionEvent: EventEmitter<Object> = new EventEmitter<Object>();
  @Output() changeEvent: EventEmitter<PriceList> = new EventEmitter<PriceList>();
  @Output() nextPriceChangedEvent: EventEmitter<NextPriceInfo> = new EventEmitter<NextPriceInfo>();

  @Input() performance: Performance;
  @Input() product: Product;
  @Input() firm: Firm;
  @Input() priceList: PriceList;

  @Input() variantTypeList: { value: any, text: string }[];
  @Input() contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  @Input() currency: { value: any, text: string, name?: string };

  get availableVariantTypeList(): { value: any, text: string, disabled?: boolean }[] {
    let availableVariantTypeList: { value: any, text: string, disabled?: boolean }[];
    if (this.priceList) {
      availableVariantTypeList = [];
      let variantType: { value: any, text: string, disabled?: boolean };
      this.variantTypeList.forEach( item => {

        if(this.priceList && this.priceList.Variants) {
          if(!this.priceList.Variants.find( variant => variant.VariantTypeId == item.value)) {
            variantType = {value: item.value, text: item.text }
            availableVariantTypeList.push(variantType);
          }
        }else{
          variantType = {value: item.value, text: item.text }
          availableVariantTypeList.push(variantType);
        }
      });
    }
    return availableVariantTypeList;
  }

  get activeVariants() {
    return this.priceList.Variants;
  }

  get nextPriceListOptions(): {text: string, value: number}[] {
    let _nextPriceListOptions: {text: string, value: number}[] = [];
    if (this.product && this.product.PriceLists) {
      this.product.PriceLists.forEach(p => {
        if (p.BeginDate > this.priceList.BeginDate) {
          _nextPriceListOptions.push({text: p.Localization.Name, value: p.Id ? p.Id : p.FakeId});
        }
      });
    }
    _nextPriceListOptions.push({text: 'Seçmek İstemiyorum', value: 0});
    return _nextPriceListOptions;
  }

  addVariantBox: AddVariantBoxComponent;
  addVariantPriceBox: AddVariantPriceBoxComponent;
  nextPriceInfo: NextPriceInfo;

  validation: {
		Name: { isValid: any, message: string },
		BeginDate: { isValid: any, message: string },
		EndDate: { isValid: any, message: string },
    NominalPrice: { isValid: any, message: string },
    Type: { isValid: any, message: string },
    AllowedSalesTotal: { isValid: any, message: string },
    NextPriceId: {isValid: any, message: string },
	} = {
		Name: {
			message: 'Fiyat Blok Adı zorunludur.',
			isValid():boolean {
				return this.priceList && this.priceList.Localization && this.priceList.Localization.Tr && this.priceList.Localization.Tr.Name && this.priceList.Localization.Tr.Name.length > 0;
			}
		},
		BeginDate: {
			message: 'Fiyat başlangıç tarihi zorunludur',
			isValid():boolean {
				return this.priceList && this.priceList.BeginDate && moment(this.priceList.BeginDate).isValid();
			}
		},
		EndDate: {
			message: 'Fiyat bitiş tarihi zorunludur',
			isValid():boolean {
        if (this.priceList.Type === PriceListType.Date || this.priceList.Type === PriceListType.DateAndQuota) {
          return this.priceList && this.priceList.EndDate && moment(this.priceList.EndDate).isValid();
        } else {
          return this.priceList;
        }
			}
		},
		NominalPrice: {
			message: 'Fiyat bilgisi zorunludur!',
			isValid():boolean {
				return this.priceList && this.priceList.NominalPrice > 0;
			}
    },
    Type: {
      message: 'Fiyat Geçişi bilgisi zorunludur',
      isValid(): boolean {
        return this.priceList && this.priceList.Type && this.priceList.Type > 0;
      }
    },
    AllowedSalesTotal: {
      message: 'Kota bilgisi zorunludur',
      isValid(): boolean {
        if (this.priceList.Type === PriceListType.Quota || this.priceList.Type === PriceListType.DateAndQuota) {
          return this.priceList && this.priceList.AllowedSalesTotal > 0;
        } else {
          return this.priceList;
        }
      }
    },
    NextPriceId: {
      message: 'Fiyat Geçişi alanı zorunludur.',
      isValid() {
        if (this.priceList && (this.priceList.Type === PriceListType.Quota || this.priceList.Type === PriceListType.DateAndQuota)) {
          return this.priceList && (this.priceList.NextPriceListId !== null);
        } else {
          return this.priceList;
        }
      }
    },
	};

	public get isValid(): boolean {
    if (this.priceList && this.validation
                       && this.validation.Name.isValid.call(this)
                       && this.validation.BeginDate.isValid.call(this)
                       && this.validation.EndDate.isValid.call(this)
                       && this.validation.NominalPrice.isValid.call(this)
                       && this.validation.Type.isValid.call(this)
                       && this.validation.AllowedSalesTotal.isValid.call(this)
                       && this.validation.NextPriceId.isValid.call(this)) {
                         return true;
      } else {
			return false
		}
  };
  
  get hasQuota(): boolean {
    return (this.priceList.Type == PriceListType.DateAndQuota) || (this.priceList.Type == PriceListType.Quota);
  }

  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tetherService: TetherDialog,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    if (this.priceList && this.priceList.Id && this.hasQuota && this.priceList.NextPriceListId === null) {
      this.priceList.NextPriceListId = 0;
    }
  }

  public collapse() {
    if (this.expandableBlock) this.expandableBlock.collapse();
  }

  public expand () {
    if (this.expandableBlock) this.expandableBlock.expand();
  }

  emitAction(event) {
    if (!event.params) event.params = {};
    event.params.priceList = this.priceList;
    this.actionEvent.emit(event);
  }

  getConflictedPriceList(date:Date): PriceList {
    let conflictedPriceList: PriceList;
    if(this.product && this.product.PriceLists) {
      conflictedPriceList =  this.product.PriceLists.find( item => {
        if (item.Id !== this.priceList.Id && date && item.BeginDate && item.EndDate) {
          return moment(date).isBetween(moment(item.BeginDate), moment(item.EndDate), null, '()');
        }
        return false;
      });
    }
    return conflictedPriceList;
  }

  inputChangeHandler(event, name: string, target?: any) {
    let conflictedPriceList: PriceList;
    switch (name) {
      case 'Name':
      case 'Info':
        if (!this.priceList.Localization) this.priceList.Localization = {};
        this.priceList.Localization[name] = event;
        if (!this.priceList.Localization.Tr) this.priceList.Localization.Tr = {};
        this.priceList.Localization.Tr[name] = event;
        if (!this.priceList.Localization.En) this.priceList.Localization.En = {};
        this.priceList.Localization.En[name] = event;
      break;
      case 'BeginDate':
        this.priceList[name] = event;
        conflictedPriceList = this.getConflictedPriceList(this.priceList.BeginDate);
        if (!conflictedPriceList) {
          if (this.performance && this.performance.EndDate && moment(this.priceList.BeginDate).isSameOrAfter(this.performance.EndDate)) {
            this.priceList.BeginDate = null;
            this.notificationService.add({type: 'warning', text: 'Bilet satış başlangıç tarihi performans bitiş tarihinden sonra olamaz.'});
          }
          if (this.priceList.EndDate && moment(this.priceList.EndDate).isSameOrBefore(moment(this.priceList.BeginDate))) {
            this.notificationService.add({type: 'warning', text: 'Bilet satış bitiş tarihi başlangıç tarihinden önce ya da aynı olamaz.'});
            this.priceList.EndDate = null;
          }
        } else {
          this.tetherService.confirm({
            title: 'Bu tarih aralğında bir başka fiyat bloğu var!',
            description: conflictedPriceList.Localization.Name + ' fiyat bloğundaki tarihler silinsin mi?',
            confirmButton: {label: 'SİL', type: 'danger'},
            dismissButton: {label: 'VAZGEÇ'}
          }).then( result => {
            conflictedPriceList.BeginDate = null;
            conflictedPriceList.EndDate = null;
          }).catch(reason => {
            this.priceList.BeginDate = null;
          });
        }
      break;
      case 'EndDate':
        this.priceList[name] = event;
        conflictedPriceList = this.getConflictedPriceList(this.priceList.EndDate);
        if (!conflictedPriceList) {
          if (this.performance && this.performance.EndDate && moment(this.priceList.EndDate).isAfter(this.performance.EndDate)) {
            this.priceList.EndDate = null;
            this.notificationService.add({type: 'warning', text: 'Bilet satış bitiş tarihi performans bitiş tarihinden sonra olamaz.'});
          }
          if (this.priceList.BeginDate && moment(this.priceList.EndDate).isSameOrBefore(moment(this.priceList.BeginDate))) {
            this.notificationService.add({type: 'warning', text: 'Bilet satış bitiş tarihi başlangıç tarihinden önce ya da aynı olamaz.'});
            this.priceList.EndDate = null;
          }
        } else {
          this.tetherService.confirm({
            title: 'Bu tarih aralğında bir başka fiyat bloğu var!',
            description: conflictedPriceList.Localization.Name + ' fiyat bloğundaki tarihler silinsin mi?',
            confirmButton: {label: 'SİL', type: 'danger'},
            dismissButton: {label: 'VAZGEÇ'}
          }).then( result => {
            conflictedPriceList.BeginDate = null;
            conflictedPriceList.EndDate = null;
          }).catch(reason => {
            this.priceList.EndDate = null;
          });
        }
      break;
      case 'Type':
        this.priceList[name] = event;
        if (this.priceList[name] === PriceListType.Date) {
          this.priceList.AllowedSalesTotal = null;
        } else if (this.priceList[name] === PriceListType.Quota) {
          this.priceList.EndDate = null;
        } else {

        }
      break;
      case 'NextPrice':
      this.priceList.NextPriceListId = event;
        this.nextPriceInfo = {priceBlock: this.priceList.Id ? this.priceList.Id : this.priceList.FakeId, nextPrice: event};
        this.nextPriceChangedEvent.emit(this.nextPriceInfo);
      break;
      default:
        target ? target[name] = event : this.priceList[name] = event;
      break;
    }
    this.changeEvent.emit(this.priceList);
  }

  openVariantContextMenu(event, variant: Variant) {
    this.tetherService.context({
      title: 'İŞLEMLER',
      data: [
        {action: 'edit', label: 'Varyantı Düzenle', params: {variant: variant}},
      ]
    }, {
      target: event.target
    }).then( result => this.variantContextActionHandler(result)).catch( reason => {});
  }

  openAddVariantBox(variant: Variant, event?: any) {
    let component: ComponentRef<AddVariantBoxComponent> = this.resolver.resolveComponentFactory(AddVariantBoxComponent)
                                                                       .create(this.injector);
    this.addVariantBox = component.instance;
    this.addVariantBox.priceList = this.priceList;
    this.addVariantBox.firm = this.firm;
    this.addVariantBox.variant = variant;
    this.addVariantBox.variantTypeList = this.availableVariantTypeList;
    if (variant) {
      let selfType = this.variantTypeList.find( item => item.value == variant.VariantTypeId);
      if (selfType) this.addVariantBox.variantTypeList.push(selfType);
    }
    this.tetherService.modal(component, {dialog: {style: {width: '50vw', height: 'auto'}}}).then(
      result => {
        let variant: Variant = result as Variant;
        if (!this.priceList.Variants || this.priceList.Variants.indexOf(variant) < 0) {
          this.addNewVariant(variant);
        }
        this.changeDetector.detectChanges();
      }
    ).catch( reason => {});
  }

  addNewVariant(variant: Variant) {
    if (!this.priceList.Variants) this.priceList.Variants = [];
    variant.ProductId = this.priceList.ProductId;
    variant.PriceListId = this.priceList.Id;
    this.priceList.Variants.push(variant);
    this.changeEvent.emit(this.priceList);
  }

  variantContextActionHandler(event) {
    switch (event.action) {
      case 'edit':
        this.openAddVariantBox(event.params.variant);
      break;
      case 'remove':
      case 'delete':
        let existVariant = this.priceList.Variants.find( item => item.Id == event.params.variant.Id);
        if (existVariant) this.priceList.Variants.splice(this.priceList.Variants.indexOf(event.params.variant), 1);
      break;
    }
  }

  openVariantPriceContextMenu(event, variantPrice: VariantPrice, variant: Variant) {
    this.tetherService.context({
      title: 'İŞLEMLER',
      data: [
        {action: 'edit', label: 'Satış Kanalı Düzenle', params: {variantPrice: variantPrice, variant: variant}},
        {action: 'remove', label: 'Satış Kanalı Sil', params: {variantPrice: variantPrice, variant: variant}}
      ]
    }, {
      target: event.target
    }).then( result => this.variantPriceContextActionHandler(result)).catch( reason => {});
  }

  openAddVariantPriceBox(variantPrice: VariantPrice, variant: Variant, isEditMode = false) {
    let component: ComponentRef<AddVariantPriceBoxComponent> = this.resolver.resolveComponentFactory(AddVariantPriceBoxComponent)
                                                                            .create(this.injector);
    this.addVariantPriceBox = component.instance;
    this.addVariantPriceBox.product = this.product;
    this.addVariantPriceBox.firm = this.firm;
    this.addVariantPriceBox.variant = variant;
    this.addVariantPriceBox.variantPrice = variantPrice;
    this.addVariantPriceBox.isEditMode = isEditMode;

    this.tetherService.modal(component, {dialog: {style: {width: '50vw', height: 'auto'}}}).then(
      result => {
        let variantPrices: VariantPrice[] = result.variantPrices as VariantPrice[];
        let variant: Variant = result.variant as Variant;
        variantPrices.forEach( variantPrice => this.addNewVariantPrice(variantPrice, variant));
        this.changeDetector.detectChanges();
      }
    ).catch( reason => {});
  }

  addNewVariantPrice(variantPrice: VariantPrice, variant: Variant) {
    if (!variant.Prices) variant.Prices = [];
    let existVariantPrice = variant.Prices.find( item => item.SalesChannelId == variantPrice.SalesChannelId);
    variantPrice.VariantId = variant.Id;
    if (existVariantPrice) {
      $.extend(true, existVariantPrice, variantPrice);
    }else{
      variant.Prices.push(variantPrice);
    }
    this.changeDetector.detectChanges();
  }

  variantPriceContextActionHandler(event) {
    switch (event.action) {
      case 'edit':
        this.openAddVariantPriceBox(event.params.variantPrice, event.params.variant, true);
      break;
      case 'remove':
      case 'delete':
        let existVariantPrice = event.params.variant.Prices.find( item => item.Id == event.params.variantPrice.Id);
        if (existVariantPrice) event.params.variant.Prices.splice(event.params.variant.Prices.indexOf(event.params.variantPrice), 1);
      break;
    }
    this.changeDetector.detectChanges();
  }

}
