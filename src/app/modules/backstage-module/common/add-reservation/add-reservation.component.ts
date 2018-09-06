import { NotificationService } from './../../../../services/notification.service';
import { AuthenticationService } from './../../../../services/authentication.service';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { PerformanceProduct } from './../../../../models/performance-product';
import { GuestFormComponent } from './../../../common-module/components/guest-form/guest-form.component';
import { WizardHeaderComponent } from './../../../common-module/components/wizard-header/wizard-header.component';
import { ReservationService } from './../../../../services/reservation.service';
import { EntityService } from './../../../../services/entity.service';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, HostBinding, ViewChild, EventEmitter, Output, Input, ContentChild, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';

import * as moment from 'moment';

@Component({
  selector: 'app-add-reservation',
  templateUrl: './add-reservation.component.html',
  styleUrls: ['./add-reservation.component.scss'],
  providers: [
    {provide: 'performanceProductEntityService', useClass: EntityService },
    ReservationService
  ]
})
export class AddReservationComponent implements OnInit {
  @ViewChild(WizardHeaderComponent) wizardHeader: WizardHeaderComponent;
  @ViewChild(GuestFormComponent) guestForm: GuestFormComponent;

  @HostBinding('class.oc-add-reservation') true;

  @Input() performanceId: number;
  @Input() title: string;

  public productList: {id: number, title: string, price: number, currency: string}[];

  public currentLevel: { key: string, title: string, hasScroll?: boolean, params?:any };
  public currentLevelIndex: number = 0;
  public levels: { key: string, title: string, hasScroll?: boolean, params?:any }[];

  public performanceProduct: PerformanceProduct;
  public product: {};
  public customer: {
    PhoneNumber: string,
    Name: string,
    Surname: string,
    Email: string,
    MemberId?: number
  };
  public reservationOptions: {};
  public guestFormIsOpen: boolean;
  public isLoading: boolean;
  public isPromising: boolean;
  
  public hoursRange: {value: any, text: string}[];
  public expirationTypes: {value: number, label: string}[];

  public validation: {
		Product: { isValid: any, message: string },
    Customer: { isValid: any, message: string },
    Count: { isValid: any, message: string },
    ExpirationTime: { isValid: any, message: string },
    BestAvailable: { isValid: any, message: string },
	} = {
		Product: {
			message: "Ürün seçimi zorunludur.",
			isValid(): boolean {
				return this.product;
			}
		},
    Customer: {
      message: "Ürün seçimi zorunludur.",
			isValid(): boolean {
				return this.currentLevel.key == "product" ? true : this.guestForm ? this.guestForm.isValid : this.customer;
			}
    },
    Count: {
      message: "Geçerlilik süresi seçmelisiniz",
			isValid(): boolean {
				return this.currentLevel.key != "reservationOptions" ? true : this.reservationOptions && this.reservationOptions.Count > 0;
			}
    },
    ExpirationTime: {
      message: "Geçerlilik süresi seçmelisiniz",
			isValid(): boolean {
				return this.currentLevel.key != "reservationOptions" ? true : this.reservationOptions && !this.reservationOptions.ExpirationType ? true : this.reservationOptions.ExpirationTime > 0;
			}
    },
    BestAvailable: {
      message: "Rezervasyon adedi seçmelisiniz",
			isValid(): boolean {
				return this.currentLevel.key != "reservationOptions" ? true : this.reservationOptions && !this.reservationOptions.BestAvailable ? true : this.reservationOptions.Count > 0;
			}
    }
	};

	public get isValid():boolean {
		if( this.validation
			&& this.validation.Product.isValid.call(this)
      && this.validation.Customer.isValid.call(this)
      && this.validation.Count.isValid.call(this)
      && this.validation.ExpirationTime.isValid.call(this)
      && this.validation.BestAvailable.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
	};

  constructor(
    public tetherService: TetherDialog,
    public authenticationService : AuthenticationService,
    public changeDetector: ChangeDetectorRef,
    @Inject('performanceProductEntityService') public performanceProductEntityService:EntityService,
    public reservationService: ReservationService,
    public notificationService: NotificationService
    ) {
  }

  ngOnInit() {
    if(!this.title) this.title = "Rezervasyon Yapın";
    this.hoursRange = [];
		this.hoursRange.push({value: 0, text: "Süre seçin"});
		this.hoursRange.push({value: 4*60, text: "4 saat"});
		this.hoursRange.push({value: 12*60, text: "12 saat"});
		this.hoursRange.push({value: 24*60, text: "1 gün"});
		this.hoursRange.push({value: 2*24*60, text: "2 gün"});
		this.hoursRange.push({value: 4*24*60, text: "4 gün"});
		this.hoursRange.push({value: 7*24*60, text: "1 hafta"});

    this.expirationTypes = [];
    this.expirationTypes.push({value: 0, label: "Süre yok"});
    this.expirationTypes.push({value: 1, label: "Etkinlik başlangıcına belirli bir zaman kala"});
    this.expirationTypes.push({value: 2, label: "Rezervasyon yapıldıktan belirli bir zaman sonra"});

    this.levels = [];
    this.levels.push({key: "product", title: "ÜRÜN SEÇİN", hasScroll: false});
    this.levels.push({key: "customer", title: "MÜŞTERİ EKLEYİN", hasScroll: false});
    this.levels.push({key: "reservationOptions", title: "REZERVASYON AYARLARI", hasScroll: true});
    this.gotoLevel(0);

    if (this.performanceId) {
      this.performanceProductEntityService.data.subscribe( entities => {
        if (entities && entities.length) {
          this.productList = [];
          entities.forEach( data => {
            this.performanceProduct = new PerformanceProduct(data);
            const priceLists = this.performanceProduct.Product.PriceLists.filter(p =>
              moment(p.BeginDate).isSameOrBefore(moment.now()) && ((!p.EndDate && p.AllowedSalesTotal > p.ActualSalesTotal)
                || (p.EndDate && p.AllowedSalesTotal && (p.AllowedSalesTotal > p.ActualSalesTotal) && moment(p.EndDate).isSameOrAfter(moment.now()))
                || (p.EndDate && !p.AllowedSalesTotal && moment(p.EndDate).isSameOrAfter(moment.now())))
            );
            if (priceLists && priceLists.length > 0) {
              let currentPrice = priceLists[0];
              for (let priceList of priceLists) {
                if (priceList.BeginDate > currentPrice.BeginDate) {
                  currentPrice = priceList;
                }
              }
              this.productList.push(
                {
                  id: this.performanceProduct.Product.Id,
                  title: this.performanceProduct.Product.Localization.Name,
                  price: currentPrice.NominalPrice,
                  currency: this.performanceProduct.Product.Currency.Code
                }
              );
            }
          });
          this.isLoading = false;
        }else{
          this.isLoading = false;
        }
      }, error => this.isLoading = false);

      this.isLoading = true;
      this.performanceProductEntityService.setCustomEndpoint('GetAll');
      this.performanceProductEntityService
        .fromEntity('EPerformanceProduct')
        .where('PerformanceId', '=', this.performanceId)
        .andRaw('(Product/PriceLists/any(p:p/BeginDate le ' + moment().toISOString()
                 + ')) and ((Product/PriceLists/any(p:p/EndDate ge ' + moment().toISOString()
                 + ')) or (Product/PriceLists/any(p:p/EndDate eq null)))')
        .expand(['Product', 'Localization'])
        .expand(['Product', 'PriceLists'])
        .expand(['Product', 'Currency'])
        .expand(['Performance'])
        .take(1000)
        .page(0)
        .executeQuery();
    }
  }

  nextLevel() {
    this.gotoLevel(Math.min(this.currentLevelIndex + 1, this.levels.length-1));
  }

  levelHandler(event) {
    if(event.nextLevel == true) {
      this.nextLevel();   
    }
  }
  
  previousLevel() {
    this.gotoLevel(Math.max(this.currentLevelIndex - 1, 0));
    if(this.currentLevelIndex == 0 || this.currentLevelIndex == 2) {
    }
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

    switch(this.currentLevel.key) {
      case "product":
        this.guestFormIsOpen = false;
      break;
      case "customer":
        if(!this.guestFormIsOpen) this.customer = null;
      break;
      case "reservationOptions":
        this.reservationOptions = {
          ExpirationType: this.performanceProduct.Performance.ReservationExpirationType,
          ExpirationTime: this.performanceProduct.Performance.ReservationExpirationTime
        };
      break;
    }
    this.tetherService.position();
    this.changeDetector.detectChanges();
  }
  
  wizardActionHandler(event:{action: string, params?: any}) {
    switch(event.action) {
      case "goBack":
        this.previousLevel();
      break;
    }
  }

  public inputChangeHandler(event:any, name:string, target?:string) {
    switch(name) {
      case "Count":
        this.reservationOptions["Count"] = event;
        this.reservationOptions["Capacity"] = event;
      break;
      case "ExpirationType":
        this.reservationOptions[name] = event
        this.reservationOptions['ExpirationTime'] = this.performanceProduct.Performance.ReservationExpirationTime || 0;
        this.changeDetector.detectChanges();
      break;
      case "BestAvailable":
        this.reservationOptions[name] = event;
        // this.reservationOptions['Count'] = 0;
        // this.reservationOptions['Capacity'] = 0;
      break;
      default: 
        target ? this[target][name] = event : this.reservationOptions[name] = event;
      break;
    }
  }

  productListHandler($event){
    this.product = $event;
  }

  public customerActionHandler(event) {
    switch(event.action) {
      case "showGuestUserForm":
        this.guestFormIsOpen = true;
      break;
      case "selectItem":
        this.customer = event.params.customer;
      break;
    }
  }

  public closeBox(seats){
    this.tetherService.close({
      product:this.product,
      customer:this.customer,
      reservationOptions:this.reservationOptions,
      seats: seats
    });
  }

  submitClickHandler(event){
    if(!this.currentLevel) return;
    if(this.isValid){
	    switch(this.currentLevel.key) {
	      case "reservationOptions":
          if(this.reservationOptions["BestAvailable"]) {
            this.reservationService.setCustomEndpoint('BestAvailableSeats', true);
            this.reservationService.create(
              {
                PerofrmanceId: this.performanceId,
                SeatCount: this.reservationOptions["Count"]
              }).subscribe( result => {
              this.closeBox(result);
              }, error => {
                this.notificationService.add({type: 'danger', text: 'Girdiğiniz kapasite kadar uygun koltuk yok ' + error.Message})
              });
          }else{
            this.closeBox(null);
          }
	      break;
        case "customer":
        if(this.guestForm && this.guestForm.customer) {
					this.customer = {
						Name: this.guestForm.customer.Name,
						Surname: this.guestForm.customer.Surname,
						PhoneNumber: this.guestForm.customer.PhoneNumber,
						Email: this.guestForm.customer.Email
					}
				};
          this.nextLevel();
        break;
	      default:
	      	this.nextLevel();
	      break;
	    }
    }
  }
}