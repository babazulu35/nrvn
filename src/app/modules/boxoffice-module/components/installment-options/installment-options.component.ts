import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { Installments } from '../../../../models/installments';

@Component({
  selector: 'app-installment-options',
  templateUrl: './installment-options.component.html',
  styleUrls: ['./installment-options.component.scss']
})
export class InstallmentOptionsComponent implements OnInit {
  @HostBinding('class.c-installment-options') true;
  @Input() installmentOptions;
  
  selectedData:{bkmCode:string,installmentCount:number};
  

  constructor( public tether: TetherDialog,) { }

  ngOnInit() {
    console.log("installment optins",this.installmentOptions);
  }

  pushInstallment() {
    this.tether.close(this.selectedData);
  }
  
  installmentsChangeAction(event,bankBkmCode) {

      this.selectedData = {
        bkmCode:bankBkmCode,
        installmentCount:event
      }
  }

  close() {
    this.tether.close();
  }

}
