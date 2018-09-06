import { Component, OnInit, Input, ComponentFactoryResolver, ComponentRef,Injector } from '@angular/core';

import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';
import { SeatListModalComponent } from './../../common/seat-list-modal/seat-list-modal.component';

@Component({
  selector: 'app-seat-viewer',
  templateUrl: './seat-viewer.component.html',
  styleUrls: ['./seat-viewer.component.scss'],
  entryComponents: [SeatListModalComponent]
})
export class SeatViewerComponent implements OnInit {
  
  

  @Input() seatData:any;

  setDat = [];
  section = [];
  block = [];
  row = [];
  seat = [];
  list:SeatListModalComponent;

  constructor(
    private resolve: ComponentFactoryResolver,
    private injector: Injector,
    private tetherService: TetherDialog,
  ) { }

  ngOnInit() {   
    for(let i = 0 ; i < this.seatData.length; i++) {    
      if(this.section.indexOf(this.seatData[i].Section) == -1) {
         this.section.push(this.seatData[i].Section);
      }
      if(this.block.indexOf(this.seatData[i].BlockName) == -1) {
        this.block.push(this.seatData[i].BlockName);
      }
      if(this.row.indexOf(this.seatData[i].RowName) == -1) {
        this.row.push(this.seatData[i].RowName);
      }      
      this.seat.push({seats: this.seatData[i].SeatName});
    }
    this.setDat.push({
        section: this.section,
        block: this.block,
        row: this.row,
        seats: {
          seatData:this.seat
        }      
    })
  }

  openSeatListModal() {
    let component: ComponentRef<SeatListModalComponent> = this.resolve.resolveComponentFactory(SeatListModalComponent).create(this.injector);
    this.list = component.instance;
    this.list.seatList = this.seatData;
    this.tetherService.modal(component,{
      	escapeKeyIsActive: true,
      	dialog: {
        	style: { maxWidth: "600px", width: "80vw", height: "auto" }
      	},
      }).then( result => {
        
        console.log("Result List Modal",result);

      }, error => {
        console.log(error);
      });
  }

}
