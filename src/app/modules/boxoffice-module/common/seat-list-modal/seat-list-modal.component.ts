import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-seat-list-modal',
  templateUrl: './seat-list-modal.component.html',
  styleUrls: ['./seat-list-modal.component.scss']
})
export class SeatListModalComponent implements OnInit {
  
  seatList:any;
  isLoading:boolean = false;

  constructor(
    public tether: TetherDialog

  ) { }

  ngOnInit() {
    console.log("Modal Seat List",this.seatList);
  }
  dismiss(){
    this.tether.close({action:'dismiss'});
  }

}
