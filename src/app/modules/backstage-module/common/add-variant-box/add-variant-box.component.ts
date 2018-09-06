import { Firm } from './../../../../models/firm';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { VariantType } from './../../../../models/variant-type';
import { PriceAdjustmentType } from './../../../../models/price-adjustment-type.enum';
import { Variant } from './../../../../models/variant';
import { PriceList } from './../../../../models/price-list';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { Component, OnInit, Input, HostBinding, HostListener, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-add-variant-box',
  templateUrl: './add-variant-box.component.html',
  styleUrls: ['./add-variant-box.component.scss']
})
export class AddVariantBoxComponent implements OnInit {
  @ViewChildren(TextInputComponent) textInputs: QueryList<TextInputComponent>;
  @HostBinding('class.oc-add-variant-box') true;

  @HostListener('keyup.enter') enterHandler(){
    this.submit();
  };

  @Input() title: string;
  @Input() priceList: PriceList;
  @Input() variant: Variant;
  @Input() firm: Firm;
  @Input() variantTypeList: { value: any, text: string }[];
  @Input() currency: { value: any, text: string, name?: string };

  isEditMode: boolean;

  public priceAdjustmentTypes: { value: any, text: string }[];

  public validation: {
		VariantType: { isValid: any, message: string },
    DefaultPrice: { isValid: any, message: string },
    DefaultServiceFee: { isValid:any, message: string},
	} = {
		VariantType: {
			message: "Varyant Adı zorunludur.",
			isValid(): boolean {
				return this.variant && this.variant.VariantTypeId != null && this.variant.VariantTypeId != 0;
			}
		},
		DefaultPrice: {
			message: "Fiyat bilgisi zorunludur!",
			isValid():boolean {
				return this.variant && this.variant.DefaultPrice > 0;
			}
    },
    DefaultServiceFee: {
      message: "Hizmet bedeli değeri uygun değildir!",
      isValid(): boolean {
        return this.variant && parseInt(this.variant.DefaultServiceFee) >= 0;
      }
    }
	};

	public get isValid():boolean {
		if( this.priceList && this.validation
			&& this.validation.VariantType.isValid.call(this)
      && this.validation.DefaultPrice.isValid.call(this)
      && this.validation.DefaultServiceFee.isValid.call(this)
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
    public tether: TetherDialog,
    public changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.priceAdjustmentTypes = [];
    this.priceAdjustmentTypes.push({value: PriceAdjustmentType.NotSet, text: "Σ"});
    this.priceAdjustmentTypes.push({value: PriceAdjustmentType.Percent, text: "%"});
    if(!this.title) this.title = this.variant && this.variant.VariantTypeId > 0 ? "Varyant Düzenle" : "Varyant Ekle";
    if(!this.variant) {
      this.variant = new Variant();
      this.variant.DefaultServiceFeeAdjType = PriceAdjustmentType.NotSet;
      // this.variant.DefaultServiceFee = 0; // varsayılan değer atanmayacak boş geliyor.
      this.variant.IsActive = true;
    }else{
      this.isEditMode = true;
    }
    if(this.variant.DefaultPrice == null && this.priceList) this.variant.DefaultPrice = this.priceList.NominalPrice;
    // if(this.variant.DefaultServiceFee == null && this.firm) this.variant.DefaultServiceFee = this.firm.ServiceFee; //firm ilişkisi kaldırıldı
    this.changeDetector.detectChanges();
  }

  ngAfterViewInit() {
    this.textInputs.first.focus();
  }

  public inputChangeHandler(event, name:string) {
    switch(name) {
      case "VariantTypeId":
        this.variant.VariantTypeId = event;
        this.variant.VariantType = new VariantType({
          Id: this.variant.VariantTypeId,
          Localization: {
            Name: this.variantTypeList.find( item => this.variant.VariantTypeId == item.value ).text
          }
        });
      break;
      case "DefaultServiceFee":
        this.variant.DefaultServiceFeeAdjType = event.option;
        this.variant.DefaultServiceFee = event.value;
      break;
      default:
        this.variant[name] = event;
      break;
    }
  }

  public submit(event?:any) {
    if(this.isValid) this.tether.close(this.variant);
  }

}
