import { VariantPrice } from './../../../../../models/variant-price';
import { GroupSaleSeat } from './../../../models/group-sale-seat';
import { GroupSaleCreate } from './../../../models/group-sale-create';
import { PriceAdjustmentType } from './../../../../../models/price-adjustment-type.enum';
import { AuthenticationService } from './../../../../../services/authentication.service';
import { PriceList } from './../../../../../models/price-list';
import { Variant } from './../../../../../models/variant';
import { Performance } from './../../../../../models/performance';
import { Component, OnInit, Injector, ComponentFactoryResolver, ChangeDetectorRef } from '@angular/core';
import { GroupSaleService } from '../../../services/group-sale.service';
import { AppSettingsService } from '../../../../../services/app-settings.service';
import { Router } from '@angular/router';
import { TetherDialog } from '../../../../common-module/modules/tether-dialog/tether-dialog';
import { NotificationService } from '../../../../../services/notification.service';
import { ProductBlockCapacity } from '../../../../common-module/components/product-block-capacity-statistics/product-block-capacity-statistics.component';
import { Subscription } from 'rxjs';
import { CrmAnonymousUser } from '../../../../../models/crm-anonymous-user';
import { Product } from '../../../../../models/product';
import * as moment from 'moment';
import * as _ from 'lodash';

class TotalAmount {
  product?: number;
  ticketing?: number;
  service?: number;
  result?: number;
}

@Component({
  selector: 'app-group-sale-settings',
  templateUrl: './group-sale-settings.component.html',
  styleUrls: ['./group-sale-settings.component.scss']
})
export class GroupSaleSettingsComponent implements OnInit {

  isLoading: boolean;
  performance: Performance;
  groupSaleCreate: GroupSaleCreate;

  productBlockCapacities: ProductBlockCapacity[];
  selectedSeatsProducts: {
    product: Product,
    variantList: {text: string, value: any}[],
    variant?: Variant,
    count?: number,
    totalAmount?: number,
    totalServiceFee?: number,
    totalTicketingFee?: number
  }[];

  customers: CrmAnonymousUser[];

  totalSeatCount: number;
  totalStandingSeatCount: number;
  
  realTotalAmount: TotalAmount = {};
  discountedTotalAmount: TotalAmount = {};

  defaultCurrencyCode: string;

  performanceSubscription: Subscription;
  productBlockCapacitiesSubscription: Subscription;
  customerSubscription: Subscription;
  groupSaleCreateSubscription: Subscription;
  
  public validation: {
    Customer: { isValid: any, message: string },
    TotalAmount: { isValid: any, message: string },
		TotalTicketingFee: { isValid: any, message: string },
		TotalServiceFee: { isValid: any, message: string },
		InvoiceNo: { isValid: any, message: string }
	} = {
    Customer: {
      message: "Ürün seçimi zorunludur.",
			isValid(): boolean {
				return this.customers && this.customers.length
			}
    },
    TotalAmount: {
			message: "Toplam tutar bilgisi zorunludur.",
			isValid(): boolean {
				return this.groupSaleCreate && this.groupSaleCreate.TotalAmount >= 0;
			}
		},
		TotalTicketingFee: {
			message: "Toplam biletleme bedeli bilgisi zorunludur.",
			isValid(): boolean {
				return this.groupSaleCreate && this.groupSaleCreate.TotalTicketingFee >= 0;
			}
		},
		TotalServiceFee: {
			message: "Toplam hizmet bedeli bilgisi zorunludur.",
			isValid(): boolean {
				return this.groupSaleCreate && this.groupSaleCreate.TotalServiceFee >= 0;
			}
		},
		InvoiceNo: {
			message: "Faturan no zorunludur.",
			isValid(): boolean {
				return this.groupSaleCreate && this.groupSaleCreate.InvoiceNo && this.groupSaleCreate.InvoiceNo.length > 0;
			}
		},
  };
  
  public get isValid():boolean {
		if( this.validation
      && this.validation.Customer.isValid.call(this)
      && this.validation.TotalAmount.isValid.call(this)
      && this.validation.TotalTicketingFee.isValid.call(this)
      && this.validation.TotalServiceFee.isValid.call(this)
      && this.validation.InvoiceNo.isValid.call(this)
			){
			return true;
		}else{
      // if(this.validation) console.log(
      //   this.validation.Name.isValid.call(this),
      //   this.validation.ExpirationTime.isValid.call(this),
      //   this.validation.Customer.isValid.call(this)
      // )
			return false
		}
  };

  constructor(
    private groupSaleService: GroupSaleService,
    private appSettingsService: AppSettingsService,
    private authenticationService: AuthenticationService,
    private router:Router,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    public tetherService: TetherDialog,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.performanceSubscription = this.groupSaleService.performance$.subscribe( performance => {
      if(performance) {
        this.performance = performance;
        if(!this.groupSaleService.seats || !this.groupSaleService.seats.length) this.backClickHandler(null);
      }
    });

    this.groupSaleCreateSubscription = this.groupSaleService.groupSaleCreate$.subscribe( groupSaleCreate => {
      if(groupSaleCreate) this.groupSaleCreate = groupSaleCreate
    });

    this.productBlockCapacitiesSubscription = this.groupSaleService.productBlockCapacities$.subscribe( productBlockCapacities => {
      if(this.productBlockCapacities == productBlockCapacities) return;
      this.productBlockCapacities = productBlockCapacities;
      if(this.productBlockCapacities) {
        this.totalSeatCount = 0;
        this.totalStandingSeatCount = 0;
        this.selectedSeatsProducts = [];
        let existSelectedSeatProduct;
        let productSeatCount: number = 0;
        let variant: Variant;
        let variantOptions: {text: string, value: any}[];
        let activePriceList: PriceList;
        let filteredPriceList: PriceList[];

        this.productBlockCapacities.forEach( productBlockCapacity => {
          if(!this.defaultCurrencyCode) this.defaultCurrencyCode = productBlockCapacity.product.Currency.Code;
          productSeatCount = 0;
          if(productBlockCapacity.blockSeats) productBlockCapacity.blockSeats.forEach( blockSeat => {
            if(blockSeat.block.IsStanding) {
              if(blockSeat.seatIds) this.totalStandingSeatCount += blockSeat.seatIds.length;
            }else{
              if(blockSeat.seatIds) this.totalSeatCount += blockSeat.seatIds.length;
            }
            if(blockSeat.seatIds) productSeatCount += blockSeat.seatIds.length;
          });
          existSelectedSeatProduct = this.selectedSeatsProducts.find( item => item.product.Id == productBlockCapacity.product.Id);
          if(!existSelectedSeatProduct) {
            variantOptions = [];
            productBlockCapacity.product.PriceLists = _.sortBy(productBlockCapacity.product.PriceLists, 'BeginDate');
            filteredPriceList = productBlockCapacity.product.PriceLists.filter( priceList => priceList.EndDate == null || moment(priceList.EndDate).isSameOrAfter(moment()));
            activePriceList = filteredPriceList && filteredPriceList.length ? filteredPriceList.shift() : productBlockCapacity.product.PriceLists[productBlockCapacity.product.PriceLists.length-1]
            if(activePriceList && activePriceList.Variants) activePriceList.Variants.forEach( variantItem => variantOptions.push({text: variantItem.VariantType.Localization.Name, value: variantItem}));
            
            existSelectedSeatProduct = {
              product: productBlockCapacity.product,
              variantList: variantOptions
            }
            if(productSeatCount > 0) this.selectedSeatsProducts.push(existSelectedSeatProduct);
          }
          existSelectedSeatProduct.count = productSeatCount;
          if(activePriceList && activePriceList.Variants) this.variantChangeHandler(activePriceList.Variants[0], existSelectedSeatProduct);
        });
      }
    });

    this.customerSubscription = this.groupSaleService.customer$.subscribe( customer => {
      this.customers = customer ? [customer] : null;
    })
  }

  ngOnDestroy() {
    if(this.performanceSubscription) this.performanceSubscription.unsubscribe();
    if(this.groupSaleCreateSubscription) this.groupSaleCreateSubscription.unsubscribe();
    if(this.productBlockCapacitiesSubscription) this.productBlockCapacitiesSubscription.unsubscribe();
  }

  backClickHandler(event:any) {
    if(!this.performance) return;
    this.router.navigate(['/performance', this.performance.Id, 'group-sale', 'seat-editor']);
  }

  customersChangeHandler(event:CrmAnonymousUser[]) {
    this.groupSaleService.setCustomer(event[0]);
  }

  variantChangeHandler(variant:Variant, existSelectedSeatProduct?:any) {
    if(!existSelectedSeatProduct) existSelectedSeatProduct = this.selectedSeatsProducts.find( item => item.product.Id == variant.ProductId);
    if(existSelectedSeatProduct && variant.Prices) {
      let existVariantPrice: VariantPrice = variant.Prices.find( variantPrice => variantPrice.SalesChannel.Name == this.authenticationService.getUserChannelCode());
      existSelectedSeatProduct.variant = variant;
      existSelectedSeatProduct.totalAmount = variant.DefaultPrice * existSelectedSeatProduct.count;
      existSelectedSeatProduct.totalServiceFee = variant.DefaultServiceFeeAdjType == PriceAdjustmentType.Percent ? ((variant.DefaultPrice * variant.DefaultServiceFee)/100) * existSelectedSeatProduct.count : variant.DefaultServiceFee * existSelectedSeatProduct.count;
      existSelectedSeatProduct.totalTicketingFee = existVariantPrice ? existVariantPrice.TicketingFee * existSelectedSeatProduct.count : 0;
      this.calculate();
    }else{
      this.notificationService.add({type: 'danger', text: 'Seçilen koltuklara tanımlı ürün veya varyant bulunamadı. Lütfen yeniden deneyin.'});
      this.reset();
    }
    
  }

  inputChangeHandler(event, name: string, target?:any) {
    switch(name) {
      default:
        if(target) target[name] = event;
      break;
    }
    this.calculate();
  }

  calculate(){
    
    this.realTotalAmount.product = this.realTotalAmount.ticketing = this.realTotalAmount.service = this.realTotalAmount.result = 0;
    let groupSaleSeats: GroupSaleSeat[];
    this.selectedSeatsProducts.forEach( selectedSeatProduct => {
      groupSaleSeats = this.groupSaleService.seats.filter( seat => seat.ProductId == selectedSeatProduct.product.Id);
      groupSaleSeats.map( seat => seat.VariantId = selectedSeatProduct.variant.Id);
      this.realTotalAmount.product += selectedSeatProduct.totalAmount;
      this.realTotalAmount.ticketing += selectedSeatProduct.totalTicketingFee;
      this.realTotalAmount.service += selectedSeatProduct.totalServiceFee;
    });
    this.realTotalAmount.result = (this.realTotalAmount.product + this.realTotalAmount.ticketing + this.realTotalAmount.service);
    this.discountedTotalAmount.result = 0;
    if(!isNaN(this.discountedTotalAmount.product)) this.discountedTotalAmount.result += this.discountedTotalAmount.product;
    if(!isNaN(this.discountedTotalAmount.ticketing)) this.discountedTotalAmount.result += this.discountedTotalAmount.ticketing;
    if(!isNaN(this.discountedTotalAmount.service)) this.discountedTotalAmount.result += this.discountedTotalAmount.service;
    
    this.groupSaleCreate.TotalAmount = this.discountedTotalAmount.product;
    this.groupSaleCreate.TotalServiceFee = this.discountedTotalAmount.service;
    this.groupSaleCreate.TotalTicketingFee = this.discountedTotalAmount.ticketing;
    this.changeDetector.detectChanges();
  }

  getAmountStatus(amountKey: string):string {
    let statusText: string;
    let diff: number = 0;
    if(!isNaN(this.realTotalAmount[amountKey]) && !isNaN(this.discountedTotalAmount[amountKey])) {
      diff = this.realTotalAmount[amountKey] - this.discountedTotalAmount[amountKey];
    }
    if(diff > 0) {
      statusText = `<b>%${((diff/this.realTotalAmount[amountKey])*100).toFixed(2)}</b> iskonto yaptınız.`;
    }else if(diff < 0) {
      statusText = "";
    }else {
      switch(amountKey) {
        case "product":
          statusText = "Ürün bedeli almıyorsunuz.";
        break;
        case "ticketing":
          statusText = "Biletleme bedeli almıyorsunuz.";
        break;
        case "service":
          statusText = "Hizmet bedeli almıyorsunuz.";
        break;
        case "result":
          statusText = "";
        break;
      }
    }
    return statusText;
  }

  reset() {
    this.groupSaleService.reset();
    this.isLoading = false;
    this.router.navigate(['/performance', this.performance.Id, 'group-sale']);
  }

  submitClickHandler(event) {
    this.isLoading = true;
    this.groupSaleService.createGroupSale().then( result => {
      this.notificationService.add({type: "success", text: "Grup satış işlemi başarıyla gerçekleşti."});
      this.reset();
    }).catch(error => {
      this.notificationService.add({type: "danger", text: error.Message || "Bilinmeyen bir hata oluştu."});
      this.isLoading = false;
    });
  }

  csvChangeHandler(e) {

  }

  csvValidateFile(e) {

  }

}
