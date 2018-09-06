import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';

import { Component, OnInit, Input } from '@angular/core';
import { PrintDataService } from './../../../../services/print-data.service';
import { Observable } from 'rxjs/Observable';
declare var $: any;

@Component({
  selector: 'app-print-ticket-v2',
  templateUrl: './print-ticket-v2.component.html',
  styleUrls: ['./print-ticket-v2.component.scss']
})
export class PrintTicketV2Component implements OnInit {
  subscription;
  ticketData = [];
  ticketList:any;
  resultCounter = [];
  ticketCount:any;
  printEndStatus:number;
  ticketPrinted:any;
  isPromising:boolean = false;
  openInDialog:boolean = true;
  @Input() basketRefId:string;
  title:string = "Bilet Basma Ekranı";
  constructor(
      private printService:PrintDataService,
      private tetherDialog: TetherDialog
  ) { }

  ngOnInit() {
    this.resultCounter = [];
    console.log(this.basketRefId);
    this.ticketPrinted = this.resultCounter.length;
    this.printService.setCustomEndpoint('GetPrintTicketInfo');
 	  let save = this.printService.create({'BasketRefList':[`${this.basketRefId}`]});
		save.subscribe(item => {
			if(item){
               console.log("Service Item",item);
               this.ticketList = item;
               this.ticketCount = this.ticketList.length;
               this.printAllTicket();
			}
		}, error => {

		})    
  }
  printAllTicket() {
    
    for(let i = 0; i < this.ticketList.length; i++) {
        this.isPromising = true;
        this.ticketData[i] = {
            EventName: this.ticketList[i]['EventName'],
            EventCode: this.ticketList[i]['EventCode'],
            VenueName: this.ticketList[i]['VenueName'],
            EventFormattedDate: this.ticketList[i]['EventFormattedDate'],
            RefCode: this.ticketList[i]['RefCode'],
            CategoryName: this.ticketList[i]["CategoryName"],
            Barcode: this.ticketList[i]["Barcode"],
            SeatAllocationType: this.ticketList[i]["SeatAllocationType"],
            SeatInfo: this.ticketList[i]["SeatInfo"],
            GateCode: this.ticketList[i]["GateCode"],
            GateName: this.ticketList[i]["GateName"],
            BlockName: this.ticketList[i]["BlockName"],
            RowNumber: this.ticketList[i]["RowNumber"],
            SeatName: this.ticketList[i]["SeatName"],
            TicketBottomDescription: this.ticketList[i]["TicketBottomDescription"],
            VariantTypeName: this.ticketList[i]["VariantTypeName"]
        }
        /* console.log("TicketData",this.ticketData); */
       let res =  window['PrintManagerInstance'].printTicket(JSON.stringify(this.ticketData[i]), false);  
       if(res == true)
       {
        
          this.resultCounter.push(res);
          this.ticketPrinted = this.resultCounter.length;
       } 
       else {
           this.isPromising = false;
       }     
       if(this.resultCounter.length == this.ticketList.length) {
         console.log("Print End"); // Biletlerin Hepsi Basıldı  
           
         this.printEndStatus = 1;
         setTimeout(() => {
            this.isPromising = false; 
            this.closeModal();
         },2000)
       }      
    }
  }

  printSeperateTicket() {
      
  }
  closeModal() {
  	this.tetherDialog.close( {
  		status: 'success'
  	});
  }  

}
