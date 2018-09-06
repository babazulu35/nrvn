import { NotificationService } from './../../../../services/notification.service';
import { GuestFormComponent } from './../guest-form/guest-form.component';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { Http, Headers } from '@angular/http';
import { environment } from './../../../../../environments/environment';
import { AuthenticationService } from './../../../../services/authentication.service';
import { Component, OnInit, Output, EventEmitter, HostBinding, ComponentRef, Injector, ComponentFactoryResolver, ElementRef, ChangeDetectorRef, HostListener, ViewChild, Input } from '@angular/core';

@Component({
  selector: 'app-customer-search-select',
  templateUrl: './customer-search-select.component.html',
  styleUrls: ['./customer-search-select.component.scss']
})
export class CustomerSearchSelectComponent implements OnInit {
  @ViewChild('guestForm') guestForm: GuestFormComponent;
  @HostBinding('class.c-customer-search-select') true;

  @HostBinding('class.c-customer-search-select--empty') get isEmpty(): boolean { return !this.customer }

  @HostListener('document:keydown', ['$event']) keyDownHandler(event) {
    switch(event.keyCode) {
      case 13: //Enter
        if(this.guestForm && this.guestForm.isValid) this.guestSubmitClickHandler(this.customer);
      break;
    }
  }

  @Output() changeEvent:EventEmitter<any> = new EventEmitter();
  @Output() actionEvent: EventEmitter<{action: string, customer: any}> = new EventEmitter();

  get fullname():string {
    let fullname: string;
    if(this.customer) {
      if(this.customer.Name) fullname = this.customer.Name;
      if(this.customer.Surname) fullname += " "+this.customer.Surname;
    }
    return fullname;
  }

  isPromising: boolean;

  @Input() customer: {
    MemberId?: any,
    Name?: string,
    Surname?: string,
    DateOfBirth?: any,
    Gender?: string,
    PhoneNumber: string,
    Email?: string,
    ProfilePicture?: string
  }

  constructor(
    private elementRef: ElementRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private changeDetector: ChangeDetectorRef,
    private authenticationService: AuthenticationService,
    private appSettingsService: AppSettingsService,
    private notificationService: NotificationService,
    private http: Http,
    public tether: TetherDialog
  ) { }

  ngOnInit() {

  }

  actionHandler(action:string, event?:any) {
    switch(action) {
      case "edit":
      this.customer = null;
      break;
      case "remove":
        this.customer = null;
      break;
    }
    this.actionEvent.emit({action: action, customer: this.customer});
  }

  phoneChangeHandler(event) {
    this.searchCustomerByPhone(event);
  }

  openGuestForm(content: any) {
    this.tether.modal(content, {
      escapeKeyIsActive: true,
      dialog: {
          style: { maxWidth: "600px", width: "80vw", height: "auto" }
      },
      attachment: "top right",
      targetAttachment: "80px right",
      offset: "0px 25px"
    }).then( result => {
      this.changeEvent.emit(this.customer);
    }).catch( reason => {});
  }

  searchCustomerByPhone(number: string) {
    if(this.customer && this.customer.PhoneNumber == number) return;
    if(number){
      this.isPromising = true;
	  	let limit = 10;
	  	let channelCode = this.authenticationService.getUserChannelCode();
	  	let firmCode  = this.authenticationService.getUserFirmCode();
	  	let apiUrl = environment.api.boxoffice;
	    let crmApiUrl = environment.api.boxoffice + '/api/v1.0/'+ firmCode +'/'+ channelCode +'/Crm/CallService/SearchCustomers';
      crmApiUrl += '?page=1';
      crmApiUrl += '&limit=' + limit;
      crmApiUrl += '&query=' + number;
      crmApiUrl += '&queryType=2';
      let listData = []
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'bearer ' + this.authenticationService.getToken());
      
      this.http.post(crmApiUrl, {}, { headers: headers }).subscribe( response => {
        let payload = response.json();
        if(payload['EntityModel'] && payload['EntityModel']['Items'] && payload['EntityModel'] && payload['EntityModel']['Items'][0]) {
          this.customer = payload['EntityModel'] && payload['EntityModel']['Items'][0];
          this.changeEvent.emit(this.customer);
        }else{
          this.customer = JSON.parse(JSON.stringify(this.appSettingsService.getLocalSettings("defaultCustomer")));
          this.customer.PhoneNumber = number;
          this.changeEvent.emit(this.customer);
        }
        this.isPromising = false;
      }, error => {
        this.isPromising = false;
        this.notificationService.add({text: error.Message, type: "danger"});
      });
    }
  }

  guestSubmitClickHandler(event) {
    this.tether.close(this.customer);
  }

}