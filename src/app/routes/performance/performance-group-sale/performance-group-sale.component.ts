import { PerformanceService } from './../../../services/performance.service';
import { VenueTemplateEditorComponent } from './../../../modules/common-module/components/venue-template-editor/venue-template-editor.component';
import { CustomerSearchBoxComponent } from './../../../modules/common-module/common/customer-search-box/customer-search-box.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { GroupSaleContactComponent } from './../../../modules/backstage-module/common/group-sale-contact/group-sale-contact.component';
import { Performance } from './../../../models/performance';
import { NotificationService } from './../../../services/notification.service';
import { VenueSeatService } from './../../../services/venue-seat.service';
import { ProductService } from './../../../services/product.service';
import { VenueSeat } from './../../../models/venue-seat';
import { SeatStatus } from './../../../models/seat-status.enum';
import { Product } from './../../../models/product';
import { EntityService } from './../../../services/entity.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild, ComponentRef, ComponentFactoryResolver, Injector, ChangeDetectionStrategy } from '@angular/core';
import { SeatColors } from '../../../models/seat-colors';


declare var $:any;

@Component({
  selector: 'app-performance-group-sale',
  templateUrl: './performance-group-sale.component.html',
  styleUrls: ['./performance-group-sale.component.scss'],
  providers: [
    {provide: 'performanceEntityService', useClass: EntityService },
    {provide: 'totalCapacityCountService', useClass: EntityService },
    {provide: 'onSaleCountService', useClass: EntityService },
    {provide: 'soldCountService', useClass: EntityService },
    {provide: 'blockedCountService', useClass: EntityService },
    {provide: 'canceledCountService', useClass: EntityService },

    VenueSeatService, ProductService
  ],
  entryComponents: [GroupSaleContactComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceGroupSaleComponent implements OnInit {
  @ViewChild(VenueTemplateEditorComponent) venueTemplateEditor: VenueTemplateEditorComponent;

  performance: Performance;
  venueSeats: VenueSeat[];

  selectedSeats: {Status: number}[];
  get selectedPendingSeats(): {Status: number}[] {
    return !this.selectedSeats ? null : this.selectedSeats.filter( item => item.Status == SeatStatus.Pending);
  }
  get selectedSoldSeats(): {Status: number}[] {
    return !this.selectedSeats ? null : this.selectedSeats.filter( item => item.Status == SeatStatus.Sold);
  }
  get selectedOnSaleSeats(): {Status: number}[] {
    return !this.selectedSeats ? null : this.selectedSeats.filter( item => item.Status == SeatStatus.OnSale || item.Status == SeatStatus.Hold);
  }
  get selectedKilledSeats(): {Status: number}[] {
    return !this.selectedSeats ? null : this.selectedSeats.filter( item => item.Status == SeatStatus.Killed);
  }

  get totalSelectedStandingCapacity(): number {
    let capacity: number = 0;
    if(this.standingBlocks) {
      this.standingBlocks.forEach( block => capacity += block.currentCapacity || 0 );
    }
    return capacity;
  }

  blocks: {BlockId: number, Name: string,
    Statistics: {
      key: string, count: number //Count: number, SeatStatus: number, SeatStatus_Desc: string, TicketType: number, TicketType_Desc: string
    }[]}[];
  
  selectedBlocks: {old: {}[], new: {}[]} = {old: [], new: []};
  selectedBlock: {Id?: number, IsStanding?: boolean, RowCount?: number, RowMaxSeat?: number};
  standingBlockCapacity:  {
    availableCount: number,
    blockedCount: number,
    canceledCount: number
  }

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

  statistics: {}[];
  infoStatistics: {}[];
  statusStatistics: {}[];
  selectedSeatsStatistics: {}[];
  totalCapacityCount: number;
  onSaleCount: number;
  soldCount: number;
  blockedCount: number;
  canceledCount: number;

  routeSubscription: any;
  isLoading: boolean = false;
  isPromising: boolean = false;
  isEditorEnabled: boolean = true;

  groupSaleContact: GroupSaleContactComponent;

  postGroupSaleData: {
    PerformanceId: number,
    Description: string,
    TotalAmount: number,
    TotalTicketingFee: number,
    TotalServiceFee: number,
    InvoiceNo: string,
    Customer?: {
      CrmMemberId?: number,
      Phone?: string,
      FirstName?: string,
      LastName?: string,
      Email?: string
    },
    Seats?: {
      SeatId: number,
      RowId?: number,
      TargetSeatStatus?: number,
      PerformanceId?: number
    }[];
	}

  get isValid():boolean {
    return (this.selectedOnSaleSeats && this.selectedOnSaleSeats.length > 0) || this.totalSelectedStandingCapacity > 0;
  }

  constructor(
    @Inject('performanceEntityService') private performanceEntityService: EntityService,
    @Inject('totalCapacityCountService') private totalCapacityCountService: EntityService,
    @Inject('onSaleCountService') private onSaleCountService: EntityService,
    @Inject('soldCountService') private soldCountService: EntityService,
    @Inject('blockedCountService') private blockedCountService: EntityService,
    @Inject('canceledCountService') private canceledCountService: EntityService,

    private venueSeatService: VenueSeatService,
    private notificationService: NotificationService,
    private productService: ProductService,

    private router: Router,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tetherService: TetherDialog
  ) { }

  ngOnInit() {
    this.routeSubscription = this.route.parent.params.subscribe( params =>  {
      if(!params) return;
      this.isLoading = true;
      this.performanceEntityService.data.subscribe( entities => {
        if(entities[0]) {
          this.performance = entities[0];

          this.resetStatistics();

        }
      });

      this.statisticsDataHandler();

      this.performanceEntityService.setCustomEndpoint('GetAll');
      this.performanceEntityService.fromEntity('EPerformance')
        .where('Id', '=', params["id"])
        .take(1).page(0)
        .executeQuery();
    });
  }

  ngOnDestroy() {
    this.routeSubscription = null;
  }

  resetStatistics(){
    this.totalCapacityCountService.setCustomEndpoint('GetAll');
    this.totalCapacityCountService.fromEntity('EVenueSeat').where('VenueRow/PerformanceId', '=', this.performance.Id).and('Status', '!=', SeatStatus.Deleted, 'SeatStatus').and('Status', '!=', SeatStatus.Failed, 'SeatStatus').take(1).page(0).executeQuery();

    this.onSaleCountService.setCustomEndpoint('GetAll');
    this.onSaleCountService.fromEntity('EVenueSeat').where('VenueRow/PerformanceId', '=', this.performance.Id).and('Status', '=', "cast('"+SeatStatus.OnSale+"', Nirvana.Shared.Enums.SeatStatus)").take(1).page(0).executeQuery();

    this.soldCountService.setCustomEndpoint('GetAll');
    this.soldCountService.fromEntity('EVenueSeat').where('VenueRow/PerformanceId', '=', this.performance.Id).and('Status', '=', "cast('"+SeatStatus.Sold+"', Nirvana.Shared.Enums.SeatStatus)").take(1).page(0).executeQuery();

    this.blockedCountService.setCustomEndpoint('GetAll');
    this.blockedCountService.fromEntity('EVenueSeat').where('VenueRow/PerformanceId', '=', this.performance.Id).and('Status', '=', "cast('"+SeatStatus.Pending+"', Nirvana.Shared.Enums.SeatStatus)").take(1).page(0).executeQuery();

    this.canceledCountService.setCustomEndpoint('GetAll');
    this.canceledCountService.fromEntity('EVenueSeat').where('VenueRow/PerformanceId', '=', this.performance.Id).and('Status', '=', "cast('"+SeatStatus.Killed+"', Nirvana.Shared.Enums.SeatStatus)").take(1).page(0).executeQuery();
  }

  statisticsDataHandler() {
    this.totalCapacityCountService.count.subscribe( count => this.setStatistics('totalCapacityCount', count) );
    this.onSaleCountService.count.subscribe( count => this.setStatistics('onSaleCount', count) );
    this.soldCountService.count.subscribe( count => this.setStatistics('soldCount', count) );
    this.blockedCountService.count.subscribe( count => this.setStatistics('blockedCount', count) );
    this.canceledCountService.count.subscribe( count => this.setStatistics('canceledCount', count) );
  }

  setStatistics(prop, value) {
    this[prop] = value;
    this.infoStatistics = [];
    if(this.totalCapacityCount != null) this.infoStatistics.push({color: "000000", key: 'totalCapacityCount', label: 'TOPLAM KAPASİTE', value: this.totalCapacityCount});
    if(this.onSaleCount != null) this.infoStatistics.push({color: SeatColors.ON_SALE, key: 'onSaleCount', label: 'SATIŞTA', value: this.onSaleCount});
    this.statusStatistics = [];
    if(this.soldCount != null) this.statusStatistics.push({color: SeatColors.SOLD, key: 'soldCount', label: 'SATIŞ', value: this.soldCount});
    if(this.blockedCount != null) this.statusStatistics.push({color: SeatColors.PENDING, key: 'blockedCount', label: 'SATIŞTA DEĞİL', value: this.blockedCount});
    if(this.canceledCount != null) this.statusStatistics.push({color: SeatColors.KILL, key: 'canceledCount', label: 'SATILAMAZ', value: this.canceledCount});
    this.statistics = [this.infoStatistics, this.statusStatistics];
    this.changeDetector.detectChanges();
  }

  setSelectedSeatsStatistics() {
    let seatStatistics = [];
    seatStatistics.push({key: 'totalSeatCapacity', label: 'NUMARALI KOLTUKLAR', value: this.selectedOnSaleSeats ? this.selectedOnSaleSeats.length : 0});
    seatStatistics.push({key: 'totalStandingCapacity', label: 'NUMARASIZ KOLTUKLAR', value: this.totalSelectedStandingCapacity});
    let seatTotal = [];
    seatTotal.push({key: 'totalSelectedCapacity', label: 'TOPLAM SEÇİLEN KAPASİTE', value: seatStatistics[0].value + seatStatistics[1].value});
    this.selectedSeatsStatistics = [seatStatistics, seatTotal];
  }

  venueEditorEventHandler(event) {
    switch(event.type) {
      case VenueTemplateEditorComponent.EVENT_LAYOUT_READY:
        this.isLoading = false;
        this.standingBlocks = [];
        let standingBlock: { id: number, title: string, currentCapacity?: number, currentSeats?: {Id:number}[], oldCapacity?: number, availableCapacity?: number, totalCapacity: number, availableSeats?: {Id:number}[]};

        if(event.payload && event.payload.Sections) {
          event.payload.Sections.forEach( section => {
            if(section.Blocks) section.Blocks.forEach( block => {
              if(block.IsStanding) {
                standingBlock = {
                  id: block.Id,
                  title: block.Name,
                  totalCapacity: block.RowCount * block.RowMaxSeat
                }
                block.Rows.forEach( row => {
                  if(row.Seats) {
                    standingBlock.availableSeats = row.Seats.filter( seat => seat.Status != SeatStatus.Reserved && (seat.Status == SeatStatus.OnSale || seat.Status == SeatStatus.Hold));
                    standingBlock.availableCapacity = standingBlock.availableSeats.length;
                    //standingBlock.currentSeats = row.Seats.filter( seat => seat.Status == SeatStatus.Reserved);
                    standingBlock.currentCapacity = 0; //standingBlock.currentSeats.length;
                    standingBlock.oldCapacity = standingBlock.currentCapacity;
                  }
                });
                this.standingBlocks.push(standingBlock);
              }
            })
          });
          this.venueTemplateEditor.resize();
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
        this.setSelectedSeatsStatistics();
      break;
    }
    this.changeDetector.detectChanges();
  }

  public standingBlockChangeHandler(event) {
    let existBlock;
    event.forEach( block => {
      existBlock = this.standingBlocks.find( standingBlock => standingBlock.id == block.id );
      if(existBlock) existBlock.currentCapacity = block.currentCapacity;
    });
    this.setSelectedSeatsStatistics();
  }

  submit(event) {
    this.venueSeats = [];
    if(this.selectedOnSaleSeats) this.selectedOnSaleSeats.forEach( seat => this.addSeat(seat));
    let standingSeat: any;
    this.standingBlocks.forEach( block => {
      for(let i:number = 0; i<block.currentCapacity; i++) {
          standingSeat = block.availableSeats[i];
          if(standingSeat) this.addSeat(standingSeat);
        }
    });
    this.openGroupSaleContact();
  }

  private addSeat(seat: any) {
    let venueSeat: VenueSeat;
    venueSeat = new VenueSeat();
    venueSeat.Id = seat["Id"];
    venueSeat.VenueGateId = seat["GateId"];
    venueSeat.IsStanding = seat["IsStanding"];
    venueSeat.VenueRowId = seat["RowId"];
    venueSeat.SeatPriority = seat["SeatPriority"];
    venueSeat.Status = seat["Status"];
    venueSeat.TicketType = seat["TicketType"];
    this.venueSeats.push(venueSeat);
  }
  
  openGroupSaleContact(){
    let component:ComponentRef<GroupSaleContactComponent> = this.resolver.resolveComponentFactory(GroupSaleContactComponent).create(this.injector);
    this.groupSaleContact = component.instance;
    let sub: any = this.groupSaleContact.levelChangeEvent.subscribe( event => {
      this.changeDetector.detectChanges();
    })

    this.tetherService.modal(component, {
      escapeKeyIsActive: true,
      dialog: {
          style: { maxWidth: "600px", width: "80vw", height: "55vh" }
      }
    }).then(result => {
      this.postGroupSaleData = {
        PerformanceId: this.performance.Id,
        Description: result["groupSaleOptions"]["Description"],
        TotalAmount: result["groupSaleOptions"]["TotalAmount"],
        TotalTicketingFee: result["groupSaleOptions"]["TotalTicketingFee"],
        TotalServiceFee: result["groupSaleOptions"]["TotalServiceFee"],
        InvoiceNo: result["groupSaleOptions"]["InvoiceNo"]
      };
      if(result["customer"]) {
        if(result["customer"]["MemberId"]) {
          this.postGroupSaleData.Customer = {
            CrmMemberId: result["customer"]["MemberId"]
          }
        }else{
          this.postGroupSaleData.Customer = {
            FirstName: result["customer"]['Name'],
            LastName: result["customer"]['Surname'],
            Email: result["customer"]['Email'],
            Phone: result["customer"]['PhoneNumber'],
          }
        }
      }
      this.saveGroupSale();
      this.groupSaleContact = null;
      if(sub) sub.unsubscribe();
    }).catch( reason => {
      this.groupSaleContact = null;
      if(sub) sub.unsubscribe();
    });

    window.dispatchEvent(new Event("resize"));
    $(window).trigger('resize');
  }

  saveGroupSale() {
    this.postGroupSaleData.Seats = [];
    this.venueSeats.forEach( item => {
      this.postGroupSaleData.Seats.push({
        PerformanceId : this.performance.Id,
        RowId: item.VenueRowId,
        SeatId: item.Id,
        TargetSeatStatus: item.Status
      });
    });

    this.isLoading = true;
    this.changeDetector.detectChanges();
    this.productService.setCustomEndpoint('PostGroupSale', true);
    this.productService.save(this.postGroupSaleData).subscribe( result => {
      this.resetStatistics();
      this.notificationService.add({type: "success", text: "Grup satış başarıyla gerçekleşti."});
      // this.selectedSeats.forEach( seat => {
      //   seat.Status = SeatStatus.Sold;
      //   this.venueTemplateEditor.setSeat(seat);
      // });
      this.selectedSeats = null;
      this.isEditorEnabled = false;
      let self = this;
      setTimeout(function() {
        self.isEditorEnabled = true;
      }, 500);
      this.changeDetector.detectChanges();
    }, error => {
      this.isLoading = false;
      this.resetStatistics();
      this.notificationService.add({type: "danger", text: "Grup satış yapılamadı. " + error.Message});
    });
  }
}
