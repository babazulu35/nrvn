import { TemplateService } from './../../../../services/template.service';
import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { VenueTemplateEditorComponent } from './../../components/venue-template-editor/venue-template-editor.component';
import { Component, OnInit, HostBinding, ViewChild, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-capacity-editor',
  templateUrl: './capacity-editor.component.html',
  styleUrls: ['./capacity-editor.component.scss'],
  providers: [TemplateService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CapacityEditorComponent implements OnInit {
  @HostBinding('class.oc-capacity-editor') true;
  @ViewChild(VenueTemplateEditorComponent) venueTemplateEditor: VenueTemplateEditorComponent;

  @Input() breadcrumbs: {title:string, link?:string}[];
  @Input() maxCapacity: number;

  @Input() role: string = VenueTemplateEditorComponent.ROLE_PRODUCT;
  @Input() productId: number;
  @Input() performanceId: number;
  @Input() firmCode: number;
  @Input() channelCode: number;
  
  public isLoading: boolean;
  public isPromising: boolean;

  public selectedSeats:{}[] = [];
  public capacity: number = 0;

  public standingBlocks:{
    id: number,
    title: string,
    currentCapacity?: number,
    oldCapacity?: number,
    availableCapacity?: number
    totalCapacity: number,
    availableSeats?: {Id: number}[],
    currentSeats?: {Id: number}[]
  }[];

  get isValid() {
    return this.selectedSeats && this.selectedSeats.length || this.standingBlocks && this.standingBlocks.find( block => block.currentCapacity > 0);
  }

  constructor(
    public templateService: TemplateService,
    public tetherService: TetherDialog,
    public changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isLoading = true;
  }

  public venueEditorEventHandler(event) {
    switch(event.type) {
      case VenueTemplateEditorComponent.EVENT_LAYOUT_READY:
        this.isLoading = false;
        this.standingBlocks = [];
        let standingBlock: { id: number, title: string, currentCapacity?: number, currentSeats?: {Id:number}[], oldCapacity?: number, availableCapacity?: number, totalCapacity: number, availableSeats?: {Id:number}[]};

        if(event.payload && event.payload.Sections) {
          event.payload.Sections.forEach( section => {
            if(section.Blocks) section.Blocks.forEach( block => {
              console.log(block);
              if(block.IsStanding) {
                standingBlock = {
                  id: block.Id,
                  title: block.Name,
                  totalCapacity: block.RowCount * block.RowMaxSeat
                }
                block.Rows.forEach( row => {
                  if(row.Seats) {
                    standingBlock.availableSeats = row.Seats.filter( seat => seat.ProductId == 0 || seat.ProductId == this.productId);
                    standingBlock.availableCapacity = standingBlock.availableSeats.length;
                    standingBlock.currentSeats = row.Seats.filter( seat => seat.ProductId == this.productId);
                    standingBlock.currentCapacity = standingBlock.currentSeats.length;
                    standingBlock.oldCapacity = standingBlock.currentCapacity;
                  }
                });
                this.standingBlocks.push(standingBlock);
              }
            })
          });
          this.venueTemplateEditor.resize();
          this.changeDetector.detectChanges();
        }
      break;
      case VenueTemplateEditorComponent.EVENT_SELECT:
        this.selectedSeats = [];
        event.payload.forEach( item => {
          switch(item._type) {
            case VenueTemplateEditorComponent.TYPE_SEAT:
              if(!item.IsStanding) this.selectedSeats.push(item);
            break;
          }
        });
      break;
    };
    
  }

  public standingBlockChangeHandler(event) {
    let existBlock;
    event.forEach( block => {
      existBlock = this.standingBlocks.find( standingBlock => standingBlock.id == block.id );
      if(existBlock) existBlock.currentCapacity = block.currentCapacity;
    });

  }

  public submit() {
    if(this.standingBlocks && this.standingBlocks.length) {
      this.standingBlocks.forEach( block => {

        console.log(block)
        if(block.currentCapacity < block.oldCapacity) {
          for(let i:number = 0; i<block.currentCapacity; i++) {
            this.selectedSeats.push(block.currentSeats[i]);
          }
        }else{
          
          for(let i:number = 0; i<block.currentCapacity; i++) {
            this.selectedSeats.push(block.availableSeats[i]);
          }
        }
      })
    }
    this.capacity = this.selectedSeats.length;
    this.tetherService.close( {seats: this.selectedSeats, capacity: this.capacity} );
  }

}
