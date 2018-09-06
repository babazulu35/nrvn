import { VariantFactory } from './../../factories/variant.factory';
import { PriceListFactory } from './../../factories/price-list.factory';
import { PriceList } from './../../../../models/price-list';
import { Performance } from './../../../../models/performance';
import { Component, OnInit, ViewChild, Output, HostBinding, EventEmitter, Input, ComponentFactoryResolver, Injector, ChangeDetectorRef, ComponentRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { ExpandableBlockComponent } from '../../../common-module/components/expandable-block/expandable-block.component';
import { TextInputComponent } from '../../../base-module/components/text-input/text-input.component';
import { Product } from '../../../../models/product';
import { Firm } from '../../../../models/firm';
import { PriceListType } from '../../../../models/price-list-type.enum';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';
import { NotificationService } from '../../../../services/notification.service';
import { VariantPrice } from '../../../../models/variant-price';
import { Variant } from '../../../../models/variant';
import { AddVariantPriceBoxComponent } from '../../../backstage-module/common/add-variant-price-box/add-variant-price-box.component';
import { AddVariantBoxComponent } from '../../../backstage-module/common/add-variant-box/add-variant-box.component';

import * as moment from 'moment';
import { EntityService } from '../../../../services/entity.service';
import { PriceAdjustmentType } from '../../../../models/price-adjustment-type.enum';
declare var $: any;

@Component({
  selector: 'app-relative-product-price-block',
  templateUrl: './relative-product-price-block.component.html',
  styleUrls: ['./relative-product-price-block.component.scss'],
  entryComponents: [AddVariantBoxComponent, AddVariantPriceBoxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: 'variantTypeEntityService', useClass: EntityService },
  ]
})
export class RelativeProductPriceBlockComponent implements OnInit {
  @ViewChild(ExpandableBlockComponent) expandableBlock: ExpandableBlockComponent;
  @ViewChild(TextInputComponent) firstTextInput: TextInputComponent;
  
  @HostBinding('class.c-relative-price-block') true;

  @Output() actionEvent: EventEmitter<Object> = new EventEmitter<Object>();
  @Output() changeEvent: EventEmitter<PriceListFactory | PriceList> = new EventEmitter<PriceList>();

  @Input() useFactory: boolean;
  @Input() priceListFactory: PriceListFactory;
  @Input() priceList: PriceList;
  @Input() performance: Performance;
  @Input() product: Product;
  @Input() firm: Firm;

  @Input() variantTypeList: { value: any, text: string }[];
  @Input() contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  @Input() currency: { value: any, text: string, name?: string };

  addVariantBox: AddVariantBoxComponent;
  addVariantPriceBox: AddVariantPriceBoxComponent;

  index;
  
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
  get hasQuota(): boolean {
    return (this.priceList.Type == PriceListType.DateAndQuota) || (this.priceList.Type == PriceListType.Quota);
  }
  get getAvailableNextPriceLists():{text: string, value: PriceList}[] {
    let list: {text: string, value: PriceList}[] = [];
    list.push({ text: "Seçmek İstemiyorum", value: null });
    if(this.product && this.product.PriceLists) {
      this.product.PriceLists.forEach( item => {
        if(item != this.priceList && item.NextPriceList != this.priceList) {
          list.push({text: item.get('Name', true), value: item});
        }
      });
      return list;
    }else{
      return null;
    }
  }

  validation: {
		Name: { isValid: any, message: string },
		BeginDate: { isValid: any, message: string },
		EndDate: { isValid: any, message: string },
    NominalPrice: { isValid: any, message: string },
    Type: { isValid: any, message: string },
    AllowedSalesTotal: { isValid: any, message: string },
    NextPrice: {isValid: any, message: string },
    Variants: {isValid: any, message: string },
    SalesChannel: {isValid: any, message: string }
	} = {
		Name: {
			message: 'Fiyat Blok Adı zorunludur.',
			isValid():boolean {
				return this.priceList && this.priceList.isValid('Name', true);
			}
		},
		BeginDate: {
			message: 'Fiyat başlangıç tarihi zorunludur',
			isValid():boolean {
        let valid:boolean = this.priceList && this.priceList.BeginDate && moment(this.priceList.BeginDate).isValid();
        if(!valid && this.priceListFactory && this.priceListFactory.beginDateType != 0) valid = Math.abs(this.priceListFactory.beginDateRelatedDuration) > 0 || Math.abs(this.priceListFactory.beginDateRelatedDuration) === 0;
        return valid;
			}
		},
		EndDate: {
			message: 'Fiyat bitiş tarihi zorunludur',
			isValid():boolean {
        let valid:boolean = this.priceList != null;
        if (valid && (this.priceList.Type === PriceListType.Date || this.priceList.Type === PriceListType.DateAndQuota)) {
          valid = this.priceList.EndDate && moment(this.priceList.EndDate).isValid();
          if(!valid && this.priceListFactory && this.priceListFactory.endDateType != 0) valid = Math.abs(this.priceListFactory.endDateRelatedDuration) > 0 || Math.abs(this.priceListFactory.endDateRelatedDuration) === 0;
        }
        return valid;
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
          return this.priceList != null;
        }
      }
    },
    NextPrice: {
      message: 'Fiyat Geçişi alanı zorunludur.',
      isValid() {
        if (this.priceList && (this.priceList.Type === PriceListType.Quota || this.priceList.Type === PriceListType.DateAndQuota)) {
          return this.priceList && (this.priceList.NextPriceList !== null);
        } else {
          return this.priceList != null;
        }
      }
    },
    Variants: {
      message: 'En az bir variyant girişi zorunludur.',
      isValid() {
        return this.priceList && this.priceList.Variants && this.priceList.Variants.length > 0;
      }
    },
    SalesChannel: {
      message: 'Variyantlara bağlı en az bir satış kanalı girişi zorunludur.',
      isValid() {
        return this.priceList && this.priceList.Variants && this.priceList.Variants.length > 0 && !(this.priceList.Variants.some( variant => !variant.Prices || !variant.Prices.length ));
      }
    }
	};

	public get isValid(): boolean {
    if (this.priceList && this.validation
      && this.validation.Name.isValid.call(this)
      && this.validation.BeginDate.isValid.call(this)
      && this.validation.EndDate.isValid.call(this)
      && this.validation.NominalPrice.isValid.call(this)
      && this.validation.Type.isValid.call(this)
      && this.validation.AllowedSalesTotal.isValid.call(this)
      && this.validation.NextPrice.isValid.call(this)
      //&& this.validation.Variants.isValid.call(this)
      && this.validation.SalesChannel.isValid.call(this)
    ) {
        return true;
      } else {
			  return false;
		}
  };

  constructor(
    @Inject('variantTypeEntityService') private variantTypeEntityService: EntityService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tetherService: TetherDialog,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    if(this.useFactory && this.priceListFactory){
      if(!this.priceList) this.priceList = this.priceListFactory.model;
      if(!this.performance) this.performance = this.priceListFactory.multiplePerformanceService.basePerformanceFactory.model;
      if(!this.variantTypeList) this.variantTypeList = this.priceListFactory.multiplePerformanceService.variantTypeList;
    }

    this.index = this.product.PriceLists.indexOf(this.priceList);

    if(!this.variantTypeList) {
      this.variantTypeEntityService.setCustomEndpoint('GetAll');
      this.variantTypeEntityService.data.subscribe( result => {
        this.variantTypeList = [];
        this.variantTypeList.push({text: 'Seçiniz', value: '-1'});
        result.forEach( variantType => {
          this.variantTypeList.push({text: `${variantType['Localization']['Name']}`, value: variantType['Id']});
        });
        if(this.useFactory && this.priceListFactory) this.priceListFactory.multiplePerformanceService.variantTypeList = this.variantTypeList;
      });
      this.variantTypeEntityService.fromEntity('PVariantType').expand(['Localization']).take(100).page(0).executeQuery();
    }    
  }

  public collapse() {
    if (this.expandableBlock) this.expandableBlock.collapse();
    this.changeDetector.detectChanges();
  }

  public expand () {
    if (this.expandableBlock) this.expandableBlock.expand();
    this.changeDetector.detectChanges();
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
    if(!this.priceList) return;
    if(!target) target = this.priceList;
    let conflictedPriceList: PriceList;
    switch (name) {
      case 'Name':
      case 'Info':
        target.set(name, event, true);
      break;
      case 'BeginDateOptions':
        if(this.useFactory && this.priceListFactory) {
          this.priceListFactory.beginDateType = event;
          if(this.priceListFactory.beginDateType == 0) {
            this.priceListFactory.endDateType = null;            
          }

          this.priceListFactory.beginDateRelatedDuration = 0;
          
          if(this.priceList) this.priceList.BeginDate = null;
        }
      break;
      case 'EndDateOptions':
        if(this.useFactory && this.priceListFactory) {
          this.priceListFactory.endDateType = event;
          if(this.priceListFactory.endDateType == 0) {
            this.priceListFactory.endDateRelatedDuration = 0; 
          }
          if(this.priceList) this.priceList.EndDate = null;
        }
      break;
      case "beginDateRelatedDuration":
        if(this.useFactory && this.priceListFactory) this.priceListFactory.beginDateRelatedDuration = event.value;
      break;
      case "endDateRelatedDuration":
        if(this.useFactory && this.priceListFactory) {
          this.priceListFactory.endDateRelatedDuration = event.value;
          if(event.date) this.priceList.EndDate = event.date;
        }
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
        this.priceList.Type = event;
        switch(this.priceList.Type) {
          case PriceListType.Date:
            this.priceList.AllowedSalesTotal = null;
          break;
          case PriceListType.DateAndQuota:
            this.priceList.EndDate = null;
            if(this.priceListFactory) {
              this.priceListFactory.endDateRelatedDuration = null;
              this.priceListFactory.endDateType = null;
            }
          break;
        }
      break;
      case 'NextPrice':
        this.priceList.NextPriceList = event;
        this.priceList.NextPriceListId = this.priceList.NextPriceList ? this.priceList.NextPriceList.Id : 0;
      break;
      default:
        target.set(name, event);
      break;
    }
    this.changeEvent.emit(this.priceList);
  }

  openVariantContextMenu(event, variant: Variant) {
    this.tetherService.context({
      title: 'İŞLEMLER',
      data: [
        {action: 'edit', label: 'Varyantı Düzenle', params: {variant: variant}},
        {action: 'remove', label: 'Varyantı Sil', params: {variant: variant}},
      ]
    }, {
      target: event.target
    }).then( result => this.variantContextActionHandler(result)).catch( reason => {});
  }

  openAddVariantBox(variant: Variant, event?: any) {
    let component: ComponentRef<AddVariantBoxComponent> = this.resolver.resolveComponentFactory(AddVariantBoxComponent).create(this.injector);
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
        this.changeEvent.emit(this.priceListFactory || this.priceList);
        this.changeDetector.detectChanges();
      }
    ).catch( reason => {});
  }

  addNewVariant(variant: Variant) {
    variant.ProductId = this.priceList.ProductId;
    variant.PriceListId = this.priceList.Id;
    if(this.useFactory && this.priceListFactory) {
      this.priceListFactory.addVariantFactory(this.priceListFactory.multiplePerformanceService.createVariantFactory(variant));
    }else {
      if (!this.priceList.Variants) this.priceList.Variants = [];
      this.priceList.Variants.push(variant);
    }
    console.log(variant, this.priceListFactory);
  }

  variantContextActionHandler(event) {
    switch (event.action) {
      case 'edit':
        this.openAddVariantBox(event.params.variant);
      break;
      case 'remove':
      case 'delete':
        if(this.useFactory && this.priceListFactory) {
          this.priceListFactory.removeVariantFactoryByModel(event.params.variant);
        }else {
          let index = this.priceList.Variants.indexOf(event.params.variant);
          if(index >= 0) this.priceList.Variants.splice(index, 1);
        }
        this.changeEvent.emit(this.priceListFactory || this.priceList);
        this.changeDetector.detectChanges();
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
    let component: ComponentRef<AddVariantPriceBoxComponent> = this.resolver.resolveComponentFactory(AddVariantPriceBoxComponent).create(this.injector);
    this.addVariantPriceBox = component.instance;
    this.addVariantPriceBox.product = this.product;
    this.addVariantPriceBox.firm = this.firm;
    this.addVariantPriceBox.variant = variant;
    if(!variantPrice) {
      variantPrice = new VariantPrice();
      variantPrice.TicketingFee = this.priceListFactory ? this.priceListFactory.multiplePerformanceService.baseProductFactory.defaultTicketingFee : null;
    }
    this.addVariantPriceBox.variantPrice = variantPrice;
    this.addVariantPriceBox.isEditMode = isEditMode;

    this.tetherService.modal(component, {dialog: {style: {width: '50vw', height: 'auto'}}}).then(
      result => {
        let variantPrices: VariantPrice[] = result.variantPrices as VariantPrice[];
        let variant: Variant = result.variant as Variant;
        variantPrices.forEach( variantPrice => this.addNewVariantPrice(variantPrice, variant));
        this.changeEvent.emit(this.priceListFactory || this.priceList);
        this.changeDetector.detectChanges();
      }
    ).catch( reason => {});
  }

  addNewVariantPrice(variantPrice: VariantPrice, variant: Variant) {
    if(!variant) return;
    if(variantPrice) variantPrice.VariantId = variant.Id;

    if(this.useFactory && this.priceListFactory) {
      let variantFactory: VariantFactory = this.priceListFactory.getVariantFactoryByModel(variant);
      if(variantFactory) variantFactory.addVariantPriceFactory(variantFactory.multiplePerformanceService.createVariantPriceFactory(variantPrice));
    }else {
      if (!variant.Prices) variant.Prices = [];
      let existVariantPrice = variant.Prices.find( item => item.SalesChannelId == variantPrice.SalesChannelId);
      if (existVariantPrice) {
        $.extend(true, existVariantPrice, variantPrice);
      }else{
        variant.Prices.push(variantPrice);
      }
    }
  }

  variantPriceContextActionHandler(event) {
    switch (event.action) {
      case 'edit':
        this.openAddVariantPriceBox(event.params.variantPrice, event.params.variant, true);
      break;
      case 'remove':
      case 'delete':
        if(this.useFactory && this.priceListFactory) {
          let existVariantFactory: VariantFactory = this.priceListFactory.getVariantFactoryByModel(event.params.variant);
          if(existVariantFactory) existVariantFactory.removeVariantPriceFactoryByModel(event.params.variantPrice);
        }else {
          let existVariantPrice = event.params.variant.Prices.find( item => item.Id == event.params.variantPrice.Id);
          if (existVariantPrice) event.params.variant.Prices.splice(event.params.variant.Prices.indexOf(event.params.variantPrice), 1);
        }
      break;
    }
    this.changeDetector.detectChanges();
  }

  submitHandler() {
    if(this.isValid) this.collapse();
  }

}
