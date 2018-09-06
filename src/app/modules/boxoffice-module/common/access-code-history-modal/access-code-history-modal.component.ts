import { Component, OnInit, Input, OnChanges, HostBinding } from '@angular/core';
import { AccessCodeHistoryType } from './../../../../models/accesscode-history-type.enum';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog'
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-access-code-history-modal',
  templateUrl: './access-code-history-modal.component.html',
  styleUrls: ['./access-code-history-modal.component.scss']
})
export class AccessCodeHistoryModalComponent implements OnInit {

  @HostBinding('class.c-access-code-history-modal') true;
  performanceName;
  ticketType;
  performanceCreateDate;
  ticketHistories;

  constructor(
    public tether: TetherDialog
  ) { }


  ngOnInit() {

  }

  close() {
    this.tether.close();
  }


}
