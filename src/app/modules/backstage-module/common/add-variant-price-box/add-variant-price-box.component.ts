import { Firm } from './../../../../models/firm';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { SalesChannel } from './../../../../models/sales-channel';
import { VariantPrice } from './../../../../models/variant-price';
import { Variant } from './../../../../models/variant';
import { Product } from './../../../../models/product';
import { WizardHeaderComponent } from './../../../common-module/components/wizard-header/wizard-header.component';
import { EntityService } from './../../../../services/entity.service';

import { Component, OnInit, Input, HostBinding, HostListener, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';

import * as moment from 'moment';
import { PriceAdjustmentType } from "./../../../../models/price-adjustment-type.enum";
import * as _ from 'lodash';

@Component({
  selector: 'app-add-variant-price-box',
  templateUrl: './add-variant-price-box.component.html',
  styleUrls: ['./add-variant-price-box.component.scss'],
  providers: [EntityService]
})
export class AddVariantPriceBoxComponent implements OnInit {
  @ViewChildren(TextInputComponent) textInputs: QueryList<TextInputComponent>;
  @ViewChild(WizardHeaderComponent) wizardHeader: WizardHeaderComponent;

  @HostBinding('class.oc-add-variant-price-box') true;

  @HostListener('keyup.enter') enterHandler(){
    this.submit();
  };

  @Input() title: string;
  @Input() product: Product;
  @Input() variant: Variant;
  @Input() variantPrice: VariantPrice;
  @Input() firm: Firm;
  @Input() isEditMode: boolean;

  public selectedSalesChannels: SalesChannel[];
  public channels: {id: number, name: string, icon?: string, salesChannel: SalesChannel, selected: boolean}[];
  public priceAdjustmentTypes: { value: any, text: string }[];

  public levels: { key: string, title: string, params?:any }[];
  public currentLevel: { key: string, title: string, params?:any };
  public currentLevelIndex: number = -1;

  get availableChannels() {
    let availableChannels = this.channels;
    let self = this;
    if(this.variant && this.variant.Prices && this.channels) {
      availableChannels = this.channels.filter( channel => {
        return !this.variant.Prices.some( variantPrice => variantPrice.SalesChannel.Id == channel.id);
      });
    }
    return availableChannels;
  }

  public validation: {
    SelectedSalesChannels: { isValid: any, message: string },
		BeginDate: { isValid: any, message: string },
		EndDate: { isValid: any, message: string },
    Price: { isValid: any, message: string },
    ServiceFee: { isValid:any, message: string},
    TicketingFee: { isValid:any, message: string},
	} = {
    SelectedSalesChannels: {
      	message: "En az bir tane satış kanalı seçmek zorunludur",
        isValid(): boolean {
          return this.isEditMode ? true : this.selectedSalesChannels && this.selectedSalesChannels.length > 0;
        }
    },
		BeginDate: {
			message: "Fiyat başlangıç tarihi zorunludur",
			isValid():boolean {
				return this.currentLevel.key == "setChannelPrice" ? this.variantPrice && this.variantPrice.BeginDate && moment(this.variantPrice.BeginDate).isValid() : true;
			}
		},
		EndDate: {
			message: "Fiyat bitiş tarihi zorunludur",
			isValid():boolean {
				return this.currentLevel.key == "setChannelPrice" ? this.variantPrice && this.variantPrice.EndDate && moment(this.variantPrice.EndDate).isValid() : true;
			}
		},
		Price: {
			message: "Fiyat bilgisi zorunludur!",
			isValid():boolean {
				return this.currentLevel.key == "setChannelPrice" ? this.variantPrice && this.variantPrice.Price > 0 : true;
			}
		},
    ServiceFee: {
      message: "Hizmet bedeli değeri uygun değildir!",
      isValid(): boolean {
        return this.variantPrice && this.variantPrice.ServiceFee >= 0;
      }
    },
    TicketingFee: {
      message: "Biletleme bedeli değeri uygun değildir!",
      isValid(): boolean {
        return this.variantPrice && this.variantPrice.TicketingFee >= 0;
      }
    }
	};

	public get isValid():boolean {
		if( this.variantPrice && this.validation
      && this.validation.SelectedSalesChannels.isValid.call(this)
			// && this.validation.BeginDate.isValid.call(this)
      // && this.validation.EndDate.isValid.call(this)
      && this.validation.Price.isValid.call(this)
      && this.validation.ServiceFee.isValid.call(this)
      && this.validation.TicketingFee.isValid.call(this)
			){
			return true;
		}else{
			// if( this.priceList && this.validation) console.log(
			// 	this.validation.Name.isValid.call(this),
			// 	this.validation.BeginDate.isValid.call(this),
			// 	this.validation.EndDate.isValid.call(this),
      //   this.validation.DefaultPrice.isValid.call(this)
			// )
			return false
		}
	};

  constructor(
    public salesChannelEntityService: EntityService,
    public changeDetector: ChangeDetectorRef,
    public tether: TetherDialog
  ) { }

  ngOnInit() {
    this.levels = [
      {key: "selectSalesCahannel", title:"Satış Kanallarını Seçin"},
      {key: "setChannelPrice", title:"Satış Kanallarını Ayarlayın"},
    ];

    this.priceAdjustmentTypes = [];
    this.priceAdjustmentTypes.push({value: PriceAdjustmentType.NotSet, text: "Σ"});
    this.priceAdjustmentTypes.push({value: PriceAdjustmentType.Percent, text: "%"});
    if(!this.title) this.title = "Satış Kanalı Ekle";
    console.log("first : ", this.variant, this.firm, this.variantPrice);
    if(!this.variantPrice) this.variantPrice = new VariantPrice();

    if(this.firm) {
      if(this.variantPrice.ServiceFee == null && (!this.variant || this.variant.DefaultServiceFee == null))  this.variantPrice.ServiceFee = this.firm.ServiceFee;
      if(this.variantPrice.TicketingFee == null) this.variantPrice.TicketingFee = this.firm.TicketingFee;
    }

    if(this.variant) {
      if(this.variantPrice.Price == null) this.variantPrice.Price = this.variant.DefaultPrice;
      if(this.variantPrice.ServiceFeeAdjType == null) this.variantPrice.ServiceFeeAdjType = this.variant.DefaultServiceFeeAdjType;
      if(this.variantPrice.ServiceFee == null) this.variantPrice.ServiceFee = this.variant.DefaultServiceFee;
    }else {
      
    }

    if(this.product) {
      if(this.variantPrice.MaxProduct == null) this.variantPrice.MaxProduct = this.product.MaxProductsPerTrx;
    }

    if(!this.variantPrice.ServiceFeeAdjType) this.variantPrice.ServiceFeeAdjType = PriceAdjustmentType.NotSet;
    if(!this.variantPrice.ServiceFee) this.variantPrice.ServiceFee = 0;
    if(!this.variantPrice.TicketingFee) this.variantPrice.TicketingFee = 0;
    
    console.log("last : ", this.variant, this.firm, this.variantPrice);
    function getIconByName(name: string):string {
      let icon: string;
      switch(name) {
        case "Web":
          icon = "language";
        break;
        case "Mobil":
          icon = "smartphone";
        break;
        default:
          icon = "place";
      }
      return icon;
    }

    if(!this.isEditMode) {
      this.salesChannelEntityService.data.subscribe( result => {
        this.channels = [];
        result.forEach( item => this.channels.push({
          id: item["Id"],
          name: item["Name"],
          icon: getIconByName(item["Name"]),
          salesChannel: item as SalesChannel,
          selected: false
        }));

        this.tether.position();
      });
      this.salesChannelEntityService.setCustomEndpoint('GetAll');
      this.salesChannelEntityService
        .fromEntity('CSalesChannel')
        .take(10000)
        .page(0)
        .executeQuery();
    }
    this.isEditMode ? this.gotoLevel(1) : this.gotoLevel(0);
  }

  ngAfterViewInit() {

  }

  wizardActionHandler(event:{action: string, params?: any}) {
    switch(event.action) {
      case "goBack":
        this.previousLevel();
      break;
    }
  }

  nextLevel() {
    this.gotoLevel(Math.min(this.currentLevelIndex + 1, this.levels.length-1));
  }

  previousLevel() {
    this.gotoLevel(Math.max(this.currentLevelIndex - 1, 0));
  }

  gotoLevel(key: any) {
    if(Number.isInteger(key)) {
      this.currentLevelIndex = key;
    }else{
      let self = this;
      this.levels.forEach(function(item, index){
        if(item.key == key) {
          self.currentLevelIndex = index;
          return;
        }
      });
    }
    let targetLevel = this.levels[this.currentLevelIndex];
    if(targetLevel != this.currentLevel) {
      this.currentLevel = targetLevel;
    }

    this.changeDetector.detectChanges();
    this.tether.position();

    if(this.currentLevel && this.currentLevel.key == "setChannelPrice") {
      if(this.textInputs.first) this.textInputs.first.focus();
    }
  }

  public channelCheckedHandler(event, channel) {
    channel.selected = event;
    this.selectedSalesChannels = [];
    this.availableChannels.forEach( item => {
      if(item.selected) this.selectedSalesChannels.push(item.salesChannel);
    });
  }

  public inputChangeHandler(event, name:string) {
    switch(name) {
      case "toggleAll":
        this.channels.map( channel => this.channelCheckedHandler(event, channel));
      break;
      case "ServiceFee":
        this.variantPrice.ServiceFeeAdjType = event.option;
        this.variantPrice.ServiceFee = event.value;
      break;
      default:
        this.variantPrice[name] = event;
      break;
    }
  }

  public submit(event?:any) {
    switch(this.currentLevel.key) {
      case "selectSalesCahannel":
        if(this.isValid) this.nextLevel();
      break;
      case "setChannelPrice":
        let variantPriceInstance: VariantPrice;
        let variantPrices: VariantPrice[] = [];
        if(this.selectedSalesChannels) this.selectedSalesChannels.forEach( channel => {
          variantPriceInstance = new VariantPrice(this.variantPrice);
          variantPriceInstance.SalesChannel = channel;
          variantPriceInstance.SalesChannelId = channel.Id;
          variantPrices.push(variantPriceInstance);
        });
        if(this.isValid) this.tether.close({variant: this.variant, variantPrices: variantPrices});
      break;
    }
  }

}
