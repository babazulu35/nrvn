import { FormGroup } from '@angular/forms';
import { Component, OnInit, HostBinding, Input, HostListener } from '@angular/core';
import { TetherDialog } from "../../../common-module/modules/tether-dialog/tether-dialog";
import { ShoppingCartService } from "../../../../services/shopping-cart.service";
import * as moment from 'moment';

@Component({
  selector: 'app-claim-modal',
  templateUrl: './claim-modal.component.html',
  styleUrls: ['./claim-modal.component.scss']
})

export class ClaimModalComponent implements OnInit {
  @HostBinding('class.c-claim-modal') true;
  @HostListener('document:keydown', ['$event'])
    keyupHandler(event) {
      if(event.keyCode == 13) {
        this.add();
      }
  }

  @Input() campaign:any;
  campaignForm: FormGroup = new FormGroup({});
  isValid: boolean;
  today = new Date();
  minDate = '1920-01-11T00:00:00.000Z'
  dataDate = [];

  constructor(
    public tether: TetherDialog,
    public shoppingCartService: ShoppingCartService
  ) { }

  ngOnInit( ) {
    this.dataDate = [];
    this.campaignForm.valueChanges.subscribe( value => this.isValid = this.campaignForm.valid );
  }
  
  dismiss(){
    this.tether.close({action:'dismiss'});
  }
  add() {
    if(!this.isValid) return;
 
    if(this.campaign.Fields.map(result => result.Type).find(type => type === 4) > -1) { 
      let selectedDate;
      for(selectedDate of this.dataDate)
      {
        this.campaignForm.controls[selectedDate.name].setValue(moment.utc(selectedDate.event).utcOffset(3).format('YYYY-MM-DDT00:00:00-00:00'));
      }
      
    }
    this.tether.close({action:'add', form: this.campaignForm.value })
    
  }

  dateChangeHandler(event,name) {
    this.dataDate.push({
      'name':name,
      'event':event
    })
  }
}
