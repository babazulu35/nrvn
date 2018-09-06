
import { Component, OnInit } from '@angular/core';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';
import { TransactionServiceService } from '../../../../services/transaction-service.service';

@Component({
  selector: 'app-invoice-customer-check',
  templateUrl: './invoice-customer-check.component.html',
  styleUrls: ['./invoice-customer-check.component.scss'],
  providers:[TransactionServiceService]
})
export class InvoiceCustomerCheckComponent implements OnInit {
  
  identityNumber:string;
  isValid:boolean = false;
  showError:boolean = false;
  isPromising:boolean = false;

  constructor(
    private tether:TetherDialog,
    private transaction:TransactionServiceService
  ) { }

  ngOnInit() {
  }
  
  dismiss(){
    this.tether.dismiss('self close')
  }



  checkIdentity() {
      //TODO: Dummy data delete pls in production
      //let dummyId = '' //Vkn;
      this.isPromising = true;
      if(this.showError) this.showError = false;
      this.transaction.checkInvoiceType(this.identityNumber).subscribe(result => {
  
        if(result != null) {
          this.isPromising = false;
          this.tether.close({isInvoiceUser:true, identity: this.identityNumber});
        }
        else {
          this.isValid = false;
          this.showError = true;
          this.isPromising = false;

        }

      },error => {
        if(error) {
          console.log("Error Message",error)
          this.showError = true;
          this.isPromising = false;
        }
      })
  }

  changeEventHandler(event) {
    this.identityNumber = event;
   if (this.identityNumber != "" || this.identityNumber != undefined) this.isValid = true; 
  }

  onFocus() {
    if(this.showError) this.showError = false; 
  }

  typeEventHandler(event) {
    console.log("Type Event",event);
  }

}
