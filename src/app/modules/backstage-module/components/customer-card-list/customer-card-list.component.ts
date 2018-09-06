import { NotificationService } from './../../../../services/notification.service';
import { CustomerSearchBoxComponent } from './../../../common-module/common/customer-search-box/customer-search-box.component';
import { Component, OnInit, ComponentFactoryResolver, Injector, Input, HostBinding, Output, EventEmitter, ComponentRef, ViewChild } from '@angular/core';
import { CrmAnonymousUser } from '../../../../models/crm-anonymous-user';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';
import { FileUploadBoxComponent } from '../../../base-module/components/file-upload-box/file-upload-box.component';

@Component({
  selector: 'app-customer-card-list',
  templateUrl: './customer-card-list.component.html',
  styleUrls: ['./customer-card-list.component.scss'],
  entryComponents: [CustomerSearchBoxComponent]
})
export class CustomerCardListComponent implements OnInit {
  @ViewChild(FileUploadBoxComponent) csvUpload: FileUploadBoxComponent;
  
  @HostBinding('class.c-customer-card-list') true;

  @HostBinding('class.c-customer-card-list--empty')
  get isEmpty(): boolean { return (!this.customers || this.customers.length == 0) && !this.csv };

  @Output() changeEvent: EventEmitter<CrmAnonymousUser[]> = new EventEmitter();
  @Output() csvChangeEvent: EventEmitter<{file: File, fileData: any, payload?: any}> = new EventEmitter();

  @Input() customers: CrmAnonymousUser[];
  @Input() csvAvailable: boolean;
  @Input() csvValidateFile: (file:File, fileData:any)=>{valid: boolean, message: string, payload?:any};
  @Input() allowMultipleCustomer: boolean = true;
  @Input() readonly: boolean;
  @Input() minCustomerCount;
  @Input() maxCustomerCount;

  @Input() csv: {
    file: File,
    fileData: any,
    payload?: any
  }
  csvRecordInfo: string;

  customerSearchBox: CustomerSearchBoxComponent;

  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tetherService: TetherDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
  }

  openCustomerSearchBox() {
    let component:ComponentRef<CustomerSearchBoxComponent> = this.resolver.resolveComponentFactory(CustomerSearchBoxComponent).create(this.injector);
    this.customerSearchBox = component.instance;

    this.customerSearchBox.guestFormHasCityTown = false;
    this.customerSearchBox.guestFormShowQuickFill = false;
    this.customerSearchBox.guestFormHasIdNo = false;

    this.tetherService.modal(component, {
      escapeKeyIsActive: true,
      dialog: {
          style: { maxWidth: "600px", width: "80vw", height: "auto" }
      },
    }).then(result => {
      let user = null;
      if(result['selected'] == true) {
        user = result["params"]["customer"]
      }
      else {
        user = result;
      }
      let customer = new CrmAnonymousUser({
        FirstName: user.Name,
        LastName: user.Surname,
        Email: user.Email,
        PhoneNumber: user.PhoneNumber,
        CrmMemberId: user.MemberId
      });

      this.addCustomer(customer);
      
      }).catch( reason => {
        console.log(reason);
      });
  }

  addCustomer(customer: CrmAnonymousUser) {
    let existCustomer = this.getCustomerByKey(customer.CrmMemberId || customer.PhoneNumber);
    if(!existCustomer) {
      if(!this.customers) this.customers = [];
      this.customers.push(customer);
      this.changeEvent.emit(this.customers);
    }else{
      this.notificationService.add({type: "danger", text: "Bu müşteri daha önce eklenmiş."});
    }
  }

  removeCustomer(customer) {
    if(!customer) return;
    let index: number = this.customers.indexOf(customer);
    if(index >= 0) this.customers.splice(index, 1);
    this.changeEvent.emit(this.customers);
  }

  removeCustomerByKey(key: any) {
    this.removeCustomer(this.getCustomerByKey(key));
  }

  getCustomerByKey(key: any): CrmAnonymousUser {
    if(!this.customers) return null;
    let existCustomer: CrmAnonymousUser = this.customers.find( customer => (customer.CrmMemberId == key || customer.PhoneNumber == key) );
    return existCustomer;
  }

  csvChangeHandler(event) {
    this.csv = event;
    this.csvChangeEvent.emit(this.csv);
    // if(this.csv) this.customers = this.csv.payload;
  }

  csvValidationHandler(event) {
    if(event.valid) {
      let customerCount: number = event.payload && event.payload.length ? event.payload.length : 0;
      let message: string;
      let minValid: boolean = this.minCustomerCount > 0 ? customerCount >= this.minCustomerCount : true;
      let maxValid: boolean = this.maxCustomerCount > 0 ? customerCount <= this.maxCustomerCount : true;
      if(minValid && maxValid) {
        message = `(Toplam <strong>${customerCount}</strong> kayıt eklendi.)`;
        // this.notificationService.add({text: message, type: "success"});
        this.csvRecordInfo = message;
      }else {
        if(this.minCustomerCount > 0 && customerCount < this.minCustomerCount) message = "CSV dosyasındaki müşteri sayısı hatalı. En az " + this.minCustomerCount + " müşteri kaydı olmalı";
        if(this.maxCustomerCount > 0 && customerCount > this.maxCustomerCount) message = "CSV dosyasındaki müşteri sayısı hatalı. En fazla " + this.maxCustomerCount + " müşteri kaydı olmalı";
        this.notificationService.add({text: message, type: "danger"});
        this.removeCsv();
      }
    }else {
      this.notificationService.add({text: event.message, type: "danger"});
    }
  }

  removeCsv() {
    this.csv = null;
    this.customers = null;
    if(this.csvUpload) this.csvUpload.removeFile(null);
  }

}
