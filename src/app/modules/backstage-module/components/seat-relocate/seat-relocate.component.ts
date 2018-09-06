import { Component, OnInit, Output, EventEmitter, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-seat-relocate',
  templateUrl: './seat-relocate.component.html',
  styleUrls: ['./seat-relocate.component.scss']
})
export class SeatRelocateComponent implements OnInit {
  @HostBinding('class.c-seat-selection') true;

  @Output() actionEvent:EventEmitter<any> = new EventEmitter();
  @Output() resultEvent:EventEmitter<any> = new EventEmitter();

  @Input() seatsData:Object;
  @Input() selectedSeats:{id:number,data:string}[];

  @Input() relocatedSeats:{id:number,data:string,relocationData:{
    currentSeat:string
  }}[];
 // @Input() locatedSeat: {index:number,relocateData:string}

 @Input() relocateActive = [];
 seatClicked=[];
 statusIcon:string = 'status';
  constructor() { }

  ngOnInit() {
   this.selectedSeats = [{
       id:1,
       data:'BC-03'
     },
     {
       id:2,
       data:'BC-04'
     },
     {
       id:3,
       data:'BC-05'
     },
     {
       id:4,
       data:'BC-07'
     }
   ]

   this.relocatedSeats = [{
     id:1,
     data:'BC-13',
     relocationData:{
      currentSeat:'BC-04',
     }
   },
   {
     id:2,
     data:'BC-12',
     relocationData:{
       currentSeat:'BC-05'
     }
   }]

  }





}
