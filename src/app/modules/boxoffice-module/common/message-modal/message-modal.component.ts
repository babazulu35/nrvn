import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { OkcVariables } from "../../../../classes/okc-variables";

@Component({
  selector: 'app-message-modal',
  templateUrl: './message-modal.component.html',
  styleUrls: ['./message-modal.component.scss']
})
export class MessageModalComponent implements OnInit,AfterViewInit {
  @Input() title:string = "İptal Etme Ekranı";
  okcVariables = OkcVariables;
  @Input() ticketCount:any;
  @Input() messageData:any;
  @Input() subTitle:string;
  @Output() modalOpen:EventEmitter<any> = new EventEmitter();

  data:any;
  constructor( private tetherDialog: TetherDialog) {

   }

  ngOnInit() {
    this.data = this.messageData;

  }

  ngAfterViewInit() {
    this.modalOpen.emit({modalOpen:true});
  }

  closeModal() {
  	this.tetherDialog.close( {
  		status: 'success'
  	});
  } 

}
