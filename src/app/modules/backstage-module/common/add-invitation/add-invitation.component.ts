import { NotificationService } from './../../../../services/notification.service';
import { AuthenticationService } from './../../../../services/authentication.service';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { RsvpType } from './../../../../models/rsvp-type.enum';
import { PerformanceProduct } from './../../../../models/performance-product';
import { GuestFormComponent } from './../../../common-module/components/guest-form/guest-form.component';
import { WizardHeaderComponent } from './../../../common-module/components/wizard-header/wizard-header.component';
import { ReservationService } from './../../../../services/reservation.service';
import { EntityService } from './../../../../services/entity.service';
import { Component, OnInit, Input, Output, ViewChild, EventEmitter, HostBinding, Inject, ChangeDetectorRef } from '@angular/core';


import * as moment from 'moment';

@Component({
  selector: 'app-add-invitation',
  templateUrl: './add-invitation.component.html',
  styleUrls: ['./add-invitation.component.scss'],
  providers: [
    { provide: 'performanceProductEntityService', useClass: EntityService },
    ReservationService
  ]
})
export class AddInvitationComponent implements OnInit {
  @ViewChild(WizardHeaderComponent) wizardHeader: WizardHeaderComponent;
  @ViewChild(GuestFormComponent) guestForm: GuestFormComponent;

  static readonly RsvpType = RsvpType;
  public RsvpType = RsvpType;

  @HostBinding('class.oc-add-invitation') true;

  @Input() rsvpType:number;
  @Input() performanceId: number;
  @Input() title: string;

  public productList: {id: number, title: string, price: number, currency: string, params?: {}}[];

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
  public invitationOptions: {};
  public guestFormIsOpen: boolean;
  public isLoading: boolean;
  
  public hoursRange: {value: any, text: string}[];
  public expirationTypes: {value: number, label: string}[];
  public ticketPerUserRange: {value: any, text: string}[];

  public validation: {
		Product: { isValid: any, message: string },
    Customer: { isValid: any, message: string },
    RsvpName: { isValid: any, message: string },
    ExpirationTime: { isValid: any, message: string },
    Count: { isValid: any, message: string },
    TicketPerUser: { isValid: any, message: string },
    IsRsvp: { isValid: any, message: string },
    BestAvailable: { isValid: any, message: string },
	} = {
		Product: {
			message: "Ürün seçimi zorunludur.",
			isValid(): boolean {
				return this.product;
			}
		},
    Customer: {
      message: "Müşteri seçimi zorunludur.",
			isValid(): boolean {
				return this.currentLevel.key == "product" || this.rsvpType == RsvpType.TargetGroup ? true : (this.guestForm ? this.guestForm.isValid : this.customer);
			}
    },
    RsvpName: {
      message: "Davetiye adı zorunludur",
			isValid(): boolean {
				return this.currentLevel.key != "invitationOptions" ? true : this.invitationOptions && this.invitationOptions.RsvpName;
			}
    },
    ExpirationTime: {
      message: "Geçerlilik süresi seçmelisiniz",
			isValid(): boolean {
				return this.currentLevel.key != "invitationOptions" ? true : this.invitationOptions && !this.invitationOptions.ExpirationType ? true : this.invitationOptions.ExpirationTime > 0;
			}
    },
    TicketPerUser: {
      message: "Davetiyenin sağladığı giriş hakkı davetiye adından daha büyük olamaz",
			isValid(): boolean {
				return this.currentLevel.key != "invitationOptions" || this.rsvpType != RsvpType.TargetGroup ? true : this.invitationOptions && this.invitationOptions.Count >= this.invitationOptions.TicketPerUser;
			}
    },
    Count: {
      message: "Rezervasyon adedi bilgisi zorunludur",
			isValid(): boolean {
				return this.currentLevel.key != "invitationOptions" ? true : this.invitationOptions && this.invitationOptions.Count > 0;
			}
    },
    IsRsvp: {
      message: "Davetiye adedini ve giriş hakkını doğru şekilde girmelisiniz",
			isValid(): boolean {
				return this.currentLevel.key != "invitationOptions"  || this.rsvpType != RsvpType.TargetGroup ? true :  (this.invitationOptions && this.invitationOptions.IsRsvp ? true : this.invitationOptions && this.invitationOptions.Count > 0 && this.invitationOptions.TicketPerUser > 0 && this.invitationOptions.Count % this.invitationOptions.TicketPerUser == 0);
			}
    },
    BestAvailable: {
      message: "Davetiye adedi seçmelisiniz",
			isValid(): boolean {
				return this.currentLevel.key != "invitationOptions" ? true : this.invitationOptions && !this.invitationOptions.BestAvailable ? true : this.invitationOptions.Count > 0 && (this.rsvpType != RsvpType.TargetGroup ? true :  this.invitationOptions.TicketPerUser > 0);
			}
    }
	};

	public get isValid():boolean {
		if( this.validation
			&& this.validation.Product.isValid.call(this)
      && this.validation.Customer.isValid.call(this)
      && this.validation.RsvpName.isValid.call(this)
      && this.validation.ExpirationTime.isValid.call(this)
      && this.validation.TicketPerUser.isValid.call(this)
      && this.validation.Count.isValid.call(this)
      && this.validation.IsRsvp.isValid.call(this)
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
    @Inject('performanceProductEntityService') public performanceProductEntityService: EntityService,
    public reservationService: ReservationService,
    public notificationService: NotificationService
  ) { }

  ngOnInit() {
    if(!this.title) switch(this.rsvpType) {
      case RsvpType.Individual:
        this.title= "Kişiye / Kuruma Özel Davetiye Ekleyin";
      break;
      case RsvpType.TargetGroup:
        this.title= "Toplu Gönderim";
      break;
    }
    this.hoursRange = [];
		this.hoursRange.push({value: 0, text: "Süre seçin"});
		this.hoursRange.push({value: 4*60, text: "4 saat"});
		this.hoursRange.push({value: 12*60, text: "12 saat"});
		this.hoursRange.push({value: 24*60, text: "1 gün"});
		this.hoursRange.push({value: 2*24*60, text: "2 gün"});
		this.hoursRange.push({value: 4*24*60, text: "4 gün"});
		this.hoursRange.push({value: 7*24*60, text: "1 hafta"});

    this.ticketPerUserRange = [];
    this.ticketPerUserRange.push({value: 0, text: "Seçiniz"});
    this.ticketPerUserRange.push({value: 1, text: "1 + 0"});
    this.ticketPerUserRange.push({value: 2, text: "1 + 1"});
    this.ticketPerUserRange.push({value: 3, text: "1 + 2"});
    this.ticketPerUserRange.push({value: 4, text: "1 + 3"});
    this.ticketPerUserRange.push({value: 5, text: "1 + 4"});
    this.ticketPerUserRange.push({value: 6, text: "1 + 5"});
    this.ticketPerUserRange.push({value: 7, text: "1 + 6"});
    this.ticketPerUserRange.push({value: 8, text: "1 + 7"});
    this.ticketPerUserRange.push({value: 9, text: "1 + 8"});
    this.ticketPerUserRange.push({value: 10, text: "1 + 9"});

    this.expirationTypes = [];
    this.expirationTypes.push({value: 0, label: "Süre yok"});
    this.expirationTypes.push({value: 1, label: "Performans başlangıcına belirli bir zaman kala"});
    this.expirationTypes.push({value: 2, label: "Davetiye oluşturulduktan belirli bir zaman sonra"});

    this.levels = [];
    if(this.rsvpType == RsvpType.TargetGroup) {
      this.levels.push({key: "product", title: "ÜRÜN SEÇİN", hasScroll: false});
      this.levels.push({key: "invitationOptions", title: "Davetiye AYARLARI", hasScroll: true});
    }
    else if(this.rsvpType == RsvpType.Individual) {
      this.levels.push({key: "product", title: "ÜRÜN SEÇİN", hasScroll: false});
      this.levels.push({key: "customer", title: "MÜŞTERİ EKLEYİN", hasScroll: false});
      this.levels.push({key: "invitationOptions", title: "Davetiye AYARLARI", hasScroll: true});
    }
    
    if (this.performanceId) {
      this.performanceProductEntityService.data.subscribe( entities => {
        if (entities && entities.length) {
          this.productList = [];
          entities.forEach( data => {
            const performanceProduct: PerformanceProduct = new PerformanceProduct(data);
            const priceLists = performanceProduct.Product.PriceLists.filter(p =>
              moment(p.BeginDate).isSameOrBefore(moment.now()) && (!p.EndDate || moment(p.EndDate).isSameOrAfter(moment.now()))
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
                  id: performanceProduct.Product.Id, 
                  title: performanceProduct.Product.Localization.Name, 
                  price: currentPrice.NominalPrice,
                  currency: performanceProduct.Product.Currency.Code,
                  params: {performanceProduct: performanceProduct}
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
    this.gotoLevel(0);
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
      case "invitationOptions":
        this.invitationOptions = {
          ExpirationType: this.performanceProduct.Performance.InviteFriendExpirationTime,
          ExpirationTime: this.performanceProduct.Performance.InviteFriendExpirationType
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
        this.invitationOptions["Count"] = event;
        this.invitationOptions["Capacity"] = event;
        if(!this.invitationOptions["IsRsvp"] && this.invitationOptions["Count"] > 0 && this.invitationOptions["TicketPerUser"] > 0 && this.invitationOptions["Count"] % this.invitationOptions["TicketPerUser"] != 0){
          this.notificationService.add({type: "danger", text: "Davetiye sayısı kişilere kalansız olarak bölünemiyor"});
        }
        if(this.invitationOptions["Count"] > 0 && this.invitationOptions["TicketPerUser"] > 0 && !this.validation.TicketPerUser.isValid) {
          this.notificationService.add({type: "danger", text: this.validation.TicketPerUser.message});
        }
      break;
      case "TicketPerUser":
        this.invitationOptions[name] = event;
        if(!this.invitationOptions["IsRsvp"] && this.invitationOptions["Count"] > 0 && this.invitationOptions["TicketPerUser"] > 0 && this.invitationOptions["Count"] % this.invitationOptions["TicketPerUser"] != 0){
          this.notificationService.add({type: "danger", text: "Oluşturulacak davetiye sayısı giriş hakkına kalansız olarak bölünemiyor"});
        }
        if(this.invitationOptions["Count"] > 0 && this.invitationOptions["TicketPerUser"] > 0 && !this.validation.TicketPerUser.isValid) {
          this.notificationService.add({type: "danger", text: this.validation.TicketPerUser.message});
        }
      break;
      case "ExpirationType":
        this.invitationOptions[name] = event
        this.invitationOptions['ExpirationTime'] = this.performanceProduct.Performance.InviteFriendExpirationTime || 0;
      break;
      case "IsRsvp":
        this.invitationOptions[name] = event;
        this.invitationOptions['ExpirationType'] = this.performanceProduct.Performance.InviteFriendExpirationType || 0;
        this.invitationOptions['ExpirationTime'] = this.performanceProduct.Performance.InviteFriendExpirationTime || 0;
      break;
      default: 
        target ? this[target][name] = event : this.invitationOptions[name] = event;
      break;
    }
    this.changeDetector.detectChanges();
  }

  productListHandler($event){
    this.product = $event;
    this.performanceProduct = $event.params.performanceProduct;
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
      rsvpType: this.rsvpType,
      product:this.product,
      customer:this.customer,
      invitationOptions:this.invitationOptions,
      seats: seats
    });
  }

  submitClickHandler(event){
    if(!this.currentLevel) return;
    if(this.isValid){
	    switch(this.currentLevel.key) {
	      case "invitationOptions":
          if(this.invitationOptions["BestAvailable"]) {
            this.reservationService.setCustomEndpoint('BestAvailableSeats', true);
            this.reservationService.create(
              {
                PerofrmanceId: this.performanceId,
                SeatCount: this.invitationOptions["Count"]
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
