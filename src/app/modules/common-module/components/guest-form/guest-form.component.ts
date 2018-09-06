import { AppSettingsService } from './../../../../services/app-settings.service';
import { Component, OnInit, Output, EventEmitter, HostListener, Input, ChangeDetectorRef, HostBinding } from '@angular/core';
import { FormGroup } from "@angular/forms";

@Component({
  selector: 'app-guest-form',
  templateUrl: './guest-form.component.html',
  styleUrls: ['./guest-form.component.scss']
})
export class GuestFormComponent implements OnInit {
  @HostBinding('class.c-guest-form') true;

  public guestForm: FormGroup = new FormGroup({});

  @Output() formEvent: EventEmitter<any> = new EventEmitter();

  @Input() hasIdNo: boolean = true;
  @Input() hasCityTown: boolean = true;
  @Input() customer: {
    Name?: string,
    Surname?: string,
    PhoneNumber?: string,
    Email?: string,
    TCNumber?: string,
    City?: string,
    Town?: string
  }
  @Input() showQuickFill:boolean;

  private customerCache: any;
  private defaultCustomer: {
    Name?: string,
    Surname?: string,
    PhoneNumber?: string,
    Email?: string,
    TCNumber?: string,
    City?: string,
    Town?: string
  }

	get isValid():boolean {
		return this.guestForm.valid;
	};    

  constructor(
    private appSettingsService: AppSettingsService,
    private changeDetector: ChangeDetectorRef
  ) { 
    this.defaultCustomer = JSON.parse(JSON.stringify(this.appSettingsService.getLocalSettings('defaultCustomer')));
  }

  ngOnInit() {
    if(!this.customer) this.customer = {};
    // this.guestForm.valueChanges.subscribe( value => {
    //   this.customerCache = value;
    //   this.formEvent.emit(value)
    // });
    this.changeDetector.detectChanges();
  }

  inputChangeEventHandler(event, name) {
    this.customer[name] = event;
    this.customerCache = this.customer;
    this.formEvent.emit(this.customer);
    this.changeDetector.detectChanges();
  }

  quickFillChangeHandler(value) {
    if(value) {
      if(!this.customer){
        this.customer = this.defaultCustomer;
      }else{
        this.customer = Object.assign(this.customer, this.customerCache);
        if(!this.customer.Name) this.customer.Name = this.defaultCustomer.Name;
        if(!this.customer.Surname) this.customer.Surname = this.defaultCustomer.Surname;
        if(!this.customer.Email) this.customer.Email = this.defaultCustomer.Email;
        if(!this.customer.TCNumber) this.customer.TCNumber = this.defaultCustomer.TCNumber;
      }
    }else{
      if(this.customer) {
        if(this.customer.Name == this.defaultCustomer.Name) this.customer.Name = null;
        if(this.customer.Surname == this.defaultCustomer.Surname) this.customer.Surname = null;
        if(this.customer.Email == this.defaultCustomer.Email) this.customer.Email = null;
        if(this.customer.TCNumber == this.defaultCustomer.TCNumber) this.customer.TCNumber = null;
      }else {
        this.customer = this.defaultCustomer;
      }
    }
    this.changeDetector.detectChanges();
  }

}
