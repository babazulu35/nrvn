import { AuthenticationService } from './../../../../services/authentication.service';
import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { CustomerSearchTypeaheadComponent } from './../../components/customer-search-typeahead/customer-search-typeahead.component';
import { GuestFormComponent } from './../../components/guest-form/guest-form.component';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, HostBinding, ViewChild, EventEmitter, Output, Input,ContentChild,OnDestroy } from '@angular/core';

@Component({
  selector: 'app-customer-search',
  templateUrl: './customer-search-box.component.html',
  styleUrls: ['./customer-search-box.component.scss']
})

export class CustomerSearchBoxComponent implements OnInit {
  @HostBinding('class.oc-customer-search-box') true;
  @ViewChild(GuestFormComponent) guestForm: GuestFormComponent;
  @ViewChild(CustomerSearchTypeaheadComponent) customerTypeahead: GuestFormComponent;

  @HostBinding('class.oc-customer-search-box--border') 
  @Input() hasBorder: boolean = false;

  @Output() resultEvent: EventEmitter<any> = new EventEmitter();
  @Output() dismissEvent: EventEmitter<any> = new EventEmitter();
  @Output() formSubmitEvent: EventEmitter<any> = new EventEmitter();

  @Input() title: string;
  @Input() guestFormHasIdNo: boolean = true;
  @Input() guestFormHasCityTown: boolean = true;
  @Input() guestFormShowQuickFill: boolean = true;

  public containerController: { key: string, title: string }
  public isGuestMode:boolean = false;
  public formData:any;
  public addUser:boolean = false;
  public resultEventSubscription:any;
  public dismissEventSubscription:any;
  customer: {
    Name?: string,
    Surname?: string,
    PhoneNumber?: string,
    Email?: string,
    TCNumber?: string
  }

  public validation: {
    Form: { isValid: any, message: string }
	} = {
    Form: {
      message: "Müşteri seçimi zorunludur.",
			isValid(): boolean {
				return this.isGuestMode && this.guestForm && this.guestForm.isValid;
			}
    }
	};

	public get isValid():boolean {
		if( this.validation
			&& this.validation.Form.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
	};

  constructor(
    public tetherService: TetherDialog
    ) {
  }

  ngOnInit() {
    if(!this.title) this.title = this.isGuestMode ? "Konuk Hesabı Ekle" : "Müşteri Arayın"    
  }

  public dismiss() {
    if(this.isGuestMode) {
      this.isGuestMode = false;
      this.setTitle();
    }else{
      this.tetherService.dismiss();
    }
  }

  public customerActionHandler(event) {
    switch(event.action) {
      case "showGuestUserForm":
        this.isGuestMode = true;
      break;
      case "search":
        this.customer = {}
        if(!event.params.value) return;
        switch(event.params.queryType) {
          case 1:
            let nameParts: string[] = event.params.value.split(" ");
            let surname = nameParts.length > 1 ? nameParts.pop() : null;
            let name = nameParts.join(" ");
            this.customer.Name = name;
            this.customer.Surname = surname;
          break;
          case 2:
            this.customer.PhoneNumber = event.params.value;
          break;
          case 3:
            this.customer.Email = event.params.value;
          break;
        }
      break;
    }
    this.setTitle();
  }

  public customerResultHandler(event) {
    this.tetherService.close(event.params.customer);
  }

  public submitClickHandler() {
    if(this.isValid && this.isGuestMode && this.guestForm) this.tetherService.close(this.guestForm.customer);
  }

  private setTitle() {
    this.title = this.isGuestMode ? "Konuk Hesabı Ekle" : "Müşteri Arayın"
  }
}
