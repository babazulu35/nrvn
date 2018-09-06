import { ShoppingCartService } from './../../../../services/shopping-cart.service';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-add-to-basket-with-code',
  templateUrl: './add-to-basket-with-code.component.html',
  styleUrls: ['./add-to-basket-with-code.component.scss'],
})
export class AddToBasketWithCodeComponent implements OnInit {
@HostBinding('class.c-add-to-basket-code') true;
@Input() reservationCode:string;

public isValid:boolean;

  constructor(
    public tether: TetherDialog,
    public shoppingCartService: ShoppingCartService
  ) { }

  ngOnInit( ) {

  }
  typeEventHandler(event) {
    if(event !='') {
      this.isValid = true;
    }
    else {
      this.isValid = false;
    }
  }
  changeEventHandler(event){
    if(event !='') {
      this.isValid = true;
      this.reservationCode = event;
    }
    else {
      this.isValid = false;
    }
    
  }
  dismiss(){
    this.tether.dismiss();
  }
  public add() {
    this.tether.close({
      "Code": this.reservationCode.trim()
    })
  }
}
