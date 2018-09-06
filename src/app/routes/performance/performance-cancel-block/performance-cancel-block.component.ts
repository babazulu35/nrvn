import { SeatColors } from './../../../models/seat-colors';
import { PerformanceService } from './../../../services/performance.service';
import { VenueTemplateEditorComponent } from './../../../modules/common-module/components/venue-template-editor/venue-template-editor.component';
import { Performance } from './../../../models/performance';
import { NotificationService } from './../../../services/notification.service';
import { VenueSeatService } from './../../../services/venue-seat.service';
import { VenueSeat } from './../../../models/venue-seat';
import { SeatStatus } from './../../../models/seat-status.enum';
import { TicketType } from './../../../models/ticket-type.enum';
import { PerformanceStatus } from './../../../models/performance-status.enum';
import { EntityService } from './../../../services/entity.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ComponentRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { CancelBlockSelectProductBoxComponent } from '../../../modules/boxoffice-module/common/cancel-block-select-product-box/cancel-block-select-product-box.component';
import { TetherDialog } from '../../../modules/common-module/modules/tether-dialog/tether-dialog';

@Component({
  selector: 'app-performance-cancel-block',
  templateUrl: './performance-cancel-block.component.html',
  styleUrls: ['./performance-cancel-block.component.scss'],
  entryComponents: [CancelBlockSelectProductBoxComponent],
  providers: [
    {provide: 'getPerformanceStatisticsService', useClass: PerformanceService },
    {provide: 'performanceEntityService', useClass: EntityService },
    {provide: 'blockedSeatsService', useClass: VenueSeatService },
    {provide: 'availableSeatsService', useClass: VenueSeatService },
    {provide: 'canceledSeatsService', useClass: VenueSeatService },
    VenueSeatService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceCancelBlockComponent implements OnInit, OnDestroy {
  @ViewChild(VenueTemplateEditorComponent) venueEditor: VenueTemplateEditorComponent;

  performance: Performance;
  selectedProductId = 0;

  selectedSeats: {Status: number}[];
  get selectedHoldSeats(): {Status: number}[] { 
    return !this.selectedSeats ? null : this.selectedSeats.filter( item => item.Status == SeatStatus.Hold);
  }
  get selectedSoldSeats(): {Status: number}[] { 
    return !this.selectedSeats ? null : this.selectedSeats.filter( item => item.Status == SeatStatus.Sold);
  }
  get selectedAvailableSeats(): {Status: number}[] { 
    return !this.selectedSeats ? null : this.selectedSeats.filter( item => item.Status == SeatStatus.OnSale || item.Status == SeatStatus.Pending);
  }
  get selectedKilledSeats(): {Status: number}[] { 
    return !this.selectedSeats ? null : this.selectedSeats.filter( item => item.Status == SeatStatus.Killed);
  }

  SeatStatus = SeatStatus;
  PerformanceStatus = PerformanceStatus;

  statistics: {}[];
  infoStatistics: {}[];
  statusStatistics: {}[];

  totalCapacityCount: number;
  onSaleCount: number;

  pendingCount: number;
  soldCount: number;
  blockedCount: number;
  canceledCount: number;
  selectedCount: number;

  soldIndividualCount: number;
  soldSeasonalCount: number;
  soldCompCount: number;
  soldGroupCount: number;

  reservedIndividualCount: number;
  reservedCompCount: number;

  routeSubscription: any;
  isLoading = false;
  isStandingLayout = false;
  currentAction: string;
  currentValue: number;

  blocks: {BlockId: number, Name: string,
    Statistics: {
      key: string, count: number
    }[]}[];

  selectedBlocks: {old: {}[], new: {}[]} = {old: [], new: []};
  selectedBlock: {Id?: number, IsStanding?: boolean, RowCount?: number, RowMaxSeat?: number};
  standingBlockCapacity:  {
    availableCount: number,
    blockedCount: number,
    canceledCount: number
  }

  editorRole: string = VenueTemplateEditorComponent.ROLE_CANCEL_BLOCK;

  constructor(
    @Inject('getPerformanceStatisticsService') private getPerformanceStatisticsService: PerformanceService,
    @Inject('performanceEntityService') private performanceEntityService: EntityService,
    @Inject('blockedSeatsService') private blockedSeatsService: VenueSeatService,
    @Inject('availableSeatsService') private availableSeatsService: VenueSeatService,
    @Inject('canceledSeatsService') private canceledSeatsService: VenueSeatService,
    private venueSeatService: VenueSeatService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private tetherDialog: TetherDialog,
  ) { }

  ngOnInit() {
    this.routeSubscription = this.route.parent.params.subscribe( params =>  {
      if(!params) return;
      this.isLoading = true;
      this.performanceEntityService.data.subscribe( entities => {
        if(entities[0]) {
          this.performance = entities[0];

          this.resetStatistics();
          this.availableSeatsServicesDataHandler();
        }
      });

      this.statisticsDataHandler();

      this.performanceEntityService.setCustomEndpoint('GetAll');
      this.performanceEntityService.fromEntity('EPerformance')
        .where('Id', '=', params['id'])
        .expand(['VenueTemplate'])
        .take(1).page(0)
        .executeQuery();
    });
  }

  ngOnDestroy() {
    this.routeSubscription = null;
  }

  resetStatistics(){
    this.isLoading = true;
    this.getPerformanceStatisticsService.setCustomEndpoint('GetPerformanceStatistics');
    this.getPerformanceStatisticsService.query({pageSize: 10000}, [{key: 'performanceId', value: this.performance.Id}]);
  }

  availableSeatsServicesDataHandler() {
    this.blockedSeatsService.data.subscribe( entities => this.setStatusAndSaveSeat(entities), error => this.isLoading = false );
    this.canceledSeatsService.data.subscribe( entities => this.setStatusAndSaveSeat(entities), error => this.isLoading = false );
    this.availableSeatsService.data.subscribe( entities => this.setStatusAndSaveSeat(entities), error => this.isLoading = false );
  }

  setStatusAndSaveSeat(seats) {
    if(!seats || seats.length == 0) return;
    this.selectedSeatsActionHandler({action: this.currentAction, params:{target: seats}});
    this.currentAction = null;
    this.changeDetector.detectChanges();
  }

  statisticsDataHandler() {
    this.getPerformanceStatisticsService.data.subscribe( result => {
      this.blocks = [];
      let statistics: {
        'SeatStatus': number,
        'TicketType': number,
        'Count': number
      }[];
      let stat: {
        'SeatStatus': number,
        'TicketType': number,
        'Count': number
      };
      if(result && result.length) result.forEach( item => {
        let block = {
          BlockId: item['BlockId'],
          Name: item['Name'],
          Statistics: []
        };
        statistics = item['Statistics'];
        if(statistics && statistics.length) {
          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.OnSale );
          block.Statistics.push({key: 'onSaleCount', count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Pending );
          block.Statistics.push({key: 'pendingCount', count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Selected );
          block.Statistics.push({key: 'selectedCount', count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Hold );
          block.Statistics.push({key: 'blockedCount', count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Killed );
          block.Statistics.push({key: 'canceledCount', count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Sold && statItem.TicketType == TicketType.Sale);
          block.Statistics.push({key: 'soldIndividualCount', count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Sold && statItem.TicketType == TicketType.Seosanal);
          block.Statistics.push({key: 'soldSeasonalCount', count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Sold && statItem.TicketType == TicketType.Comp);
          block.Statistics.push({key: 'soldCompCount', count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Sold && statItem.TicketType == TicketType.Group);
          block.Statistics.push({key: 'soldGroupCount', count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Reserved && statItem.TicketType == TicketType.Sale);
          block.Statistics.push({key: 'reservedIndividualCount', count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Reserved && statItem.TicketType == TicketType.Comp);
          block.Statistics.push({key: 'reservedCompCount', count: stat ? stat.Count : 0});
        }
        this.blocks.push(block);
      });

      this.setStatisticCount('onSaleCount');
      this.setStatisticCount('pendingCount');
      this.setStatisticCount('soldCount');
      this.setStatisticCount('blockedCount');
      this.setStatisticCount('canceledCount');
      this.setStatisticCount('selectedCount');
      this.setStatisticCount('soldIndividualCount');
      this.setStatisticCount('soldSeasonalCount');
      this.setStatisticCount('soldCompCount');
      this.setStatisticCount('soldGroupCount');
      this.setStatisticCount('reservedIndividualCount');
      this.setStatisticCount('reservedCompCount');
      this.soldCount = this.soldIndividualCount + this.soldSeasonalCount + this.soldGroupCount + this.soldCompCount;
      this.totalCapacityCount = this.onSaleCount + this.pendingCount + this.soldCount + this.blockedCount + this.canceledCount + this.reservedCompCount + this.reservedIndividualCount + this.selectedCount;

      this.statistics = null;
      let infoStatistics = [];
      if(this.totalCapacityCount != null) infoStatistics.push({color: '000000', key: 'totalCapacityCount', label: 'TOPLAM KAPASİTE', value: this.totalCapacityCount});
      if(this.onSaleCount != null) infoStatistics.push({color: SeatColors.ON_SALE, key: 'onSaleCount', label: 'SATIŞTA', value: this.onSaleCount});
      if(this.soldCount != null) infoStatistics.push({color: SeatColors.SOLD, key: 'soldCount', label: 'SATIŞ', value: this.soldCount});
      
      let statusStatistics = [];
      if(this.pendingCount != null) statusStatistics.push({color: SeatColors.PENDING, key: 'pendingCount', label: 'SATIŞTA DEĞİL', value: this.pendingCount});
      if(this.blockedCount != null) statusStatistics.push({color: SeatColors.HOLD, key: 'blockedCount', label: 'BEKLEMEDE', value: this.blockedCount});
      if(this.canceledCount != null) statusStatistics.push({color: SeatColors.KILL, key: 'canceledCount', label: 'SATILAMAZ', value: this.canceledCount});

      let soldStatistics = [];
      if(this.soldIndividualCount != null) soldStatistics.push({color: SeatColors.SOLD, key: 'soldIndividualCount', label: 'SATIŞ', value: this.soldIndividualCount});
      if(this.soldGroupCount != null) soldStatistics.push({color: SeatColors.SOLD_GROUP, key: 'soldGroupCount', label: 'GRUP SATIŞ', value: this.soldGroupCount});
      if(this.soldSeasonalCount != null) soldStatistics.push({color: SeatColors.SOLD_SEASONAL, key: 'soldSeasonalCount', label: 'SEZONLUK SATIŞ', value: this.soldSeasonalCount});
      if(this.soldCompCount != null) soldStatistics.push({color: SeatColors.COMP, key: 'soldCompCount', label: 'DAVETİYE', value: this.soldCompCount});
      
      let reservedStatistics = [];
      if(this.reservedIndividualCount != null) reservedStatistics.push({color: SeatColors.RESERVED, key: 'reservedIndividualCount', label: 'REZERVASYON', value: this.reservedIndividualCount});
      if(this.reservedCompCount != null) reservedStatistics.push({color: SeatColors.COMP_SEASONAL, key: 'reservedCompCount', label: 'LCV BEKLENİYOR', value: this.reservedCompCount});

      this.statistics = [infoStatistics, statusStatistics, soldStatistics, reservedStatistics];
      this.isLoading = false;
      this.changeDetector.detectChanges();
    });
  }

  setStatisticCount(key: string) {
    let count: number = 0;
    this.blocks.forEach( block => {
      block.Statistics.forEach( stat => {
        if(stat.key == key) count += stat.count;
      });
    });
    this[key] = count;
  }

  venueEditorEventHandler(event) {
    console.log(event);
    switch(event.type) {
      case VenueTemplateEditorComponent.EVENT_LAYOUT_READY:
        this.isLoading = false;
      break;
      case VenueTemplateEditorComponent.EVENT_SELECT:
        this.selectedSeats = [];
        if (event.payload.length) {
          let hasMultipleItem = event.payload.length > 1;
          event.payload.forEach( item => {
            switch(item['_type']) {
              case VenueTemplateEditorComponent.TYPE_SEAT:
                this.selectedSeats.push(item);
              break;
            }
          });
        }
      break;
      case VenueTemplateEditorComponent.EVENT_SELECT_LAST:
        if (event.payload.target && event.payload.target._type === VenueTemplateEditorComponent.TYPE_BLOCK ) {
          if (event.payload.selected) {
            if (event.payload.target.ProductIdList) {
              if (event.payload.target.ProductIdList.length > 1) {
                let component: ComponentRef<CancelBlockSelectProductBoxComponent>;
                component = this.resolver.resolveComponentFactory(CancelBlockSelectProductBoxComponent).create(this.injector);
                component.instance.productIds = event.payload.target.ProductIdList;
                this.tetherDialog.modal(component, {
                  escapeKeyIsActive: true,
                  dialog: {
                    style: {
                      maxWidth: '600px',
                      width: '80vw',
                      height: '50vh'
                    }
                  }
                }).then(result => {
                  this.selectedProductId = result['selectedProductId'];
                  this.selectBlock(event.payload.target);
                }).catch(reason => {
                  console.log('Refund Reason Modal dismiss reason: ', reason)
                });
              } else if (event.payload.target.ProductIdList.length === 1) {
                this.selectedProductId = event.payload.target.ProductIdList[0];
                this.selectBlock(event.payload.target);
              }
            }
          } else {
            this.selectBlock(null);
          }
        }
      break;
    }
    this.changeDetector.detectChanges();
  }

  private selectBlock(block) {
    if(this.selectedBlock && block && this.selectedBlock.Id == block.Id) return;
    this.selectedBlock = block;
    
    if(this.selectedBlock) this.venueEditor.selectSeats(null);
    // this.venueEditor.selectBlocks(null);
    if(this.selectedBlock) this.venueEditor.selectBlocks([this.selectedBlock.Id]);
    this.selectedBlocks.old = this.selectedBlocks.new;
    // this.venueEditor.resize(null);
    if(!this.selectedBlock) {
      this.standingBlockCapacity = null;
      return;
    };

    if(this.selectBlock) {
        let block = this.blocks.find( item => item.BlockId == this.selectedBlock.Id);
        if(block) {
          this.standingBlockCapacity = {
            availableCount: block.Statistics.find( item => item.key == 'onSaleCount').count + block.Statistics.find( item => item.key == 'pendingCount').count,
            canceledCount: block.Statistics.find( item => item.key == 'canceledCount').count,
            blockedCount: block.Statistics.find( item => item.key == 'blockedCount' ).count
          }
        }
      }
      this.changeDetector.detectChanges();
  }

  selectedSeatsActionHandler(event) {
    if (!event.params.target) return;
    let venueSeat: VenueSeat;
    let venueSeats: VenueSeat[] = [];
    let status;
    switch (event.action) {
      case 'openToAvailable':
        status = this.performance.Status === PerformanceStatus.OnSale ? SeatStatus.OnSale : SeatStatus.Pending;
      break;
      case 'blockSeats':
        status = SeatStatus.Hold;
      break;
      case 'cancelSeats':
        status = SeatStatus.Killed;
      break;
    }
    event.params.target.forEach( seat => {
      venueSeat = new VenueSeat();
      venueSeat.Id = seat['Id'];
      venueSeat.VenueRowId = seat['VenueRowId'] || seat['RowId'];
      venueSeat.Status = status;
      venueSeats.push(venueSeat);
    });
    this.setSeatStatus(venueSeats, status);
    venueSeats = venueSeat = status = null;
  }

  standingBlocksActionHandler(event, currentStatusArr) {
    this.currentAction = event.action;
    this.setSeatStatusForStandingBlocks(event, currentStatusArr);
  }

  setSeatStatus(venueSeats:VenueSeat[], status: number) {
    this.isLoading = true;
    let seatInfoList: {
      SeatId: number,
      PerformanceId: number,
      RowId: number
    }[] = [];
    venueSeats.forEach( seat => {
      seatInfoList.push( {
        SeatId: seat.Id,
        PerformanceId: this.performance.Id,
        RowId: seat.VenueRowId
      });
    });
    this.venueSeatService.setCustomEndpoint('SetSeatStatus');
    this.venueSeatService.create({
      SeatInfoList: seatInfoList,
      Status: status
    }).subscribe( result => {
        this.isLoading = false;
        this.resetStatistics();
        this.notificationService.add({type: 'success', text: 'Koltuklar başarıyla güncellendi'});
        let seat;
        let updatedSeats: any[] = [];
        venueSeats.forEach( venueSeat => {
          seat = this.selectedSeats.find( item => item['Id'] == venueSeat.Id);
          if(seat) {
            seat.Status = venueSeat.Status;
            updatedSeats.push(seat);
          }
        });
        this.venueEditor.setSeat(updatedSeats);
        this.standingBlockCapacity = null;
        this.venueEditor.selectSeats(null);
        this.venueEditor.selectBlocks(null);
        this.selectedBlock = null;
        this.changeDetector.detectChanges();
    }, error => {
        this.isLoading = false;
        this.standingBlockCapacity = null;
        this.venueEditor.selectSeats(null);
        this.venueEditor.selectBlocks(null);
        this.selectedBlock = null;
        this.notificationService.add({type: 'danger', text: error.Message});
        this.changeDetector.detectChanges();
    });
  }

  setSeatStatusForStandingBlocks (event, currentStatusArr) {
    if (!event) return;
    if (!event.value) return;
    if (!event.action) return;

    this.isLoading = true;

    let targetStatus;
    switch (event.action) {
      case 'openToAvailable':
        targetStatus = this.performance.Status === PerformanceStatus.OnSale ? SeatStatus.OnSale : SeatStatus.Pending;
        break;
      case 'blockSeats':
        targetStatus = SeatStatus.Hold;
        break;
      case 'cancelSeats':
        targetStatus = SeatStatus.Killed;
        break;
      default:
        break;
    }

    this.venueSeatService.setCustomEndpoint('SetSeatStatus');
    this.venueSeatService.create({
      BlockInfoList: [
        {
          'PerformanceId': this.performance.Id,
          'BlockId': this.selectedBlock.Id,
          'ProductId': this.selectedProductId,
          'Count': event.value,
          'CurrentStatusList': currentStatusArr
        }
      ],
      Status: targetStatus
    }).subscribe( result => {
        this.isLoading = false;
        this.resetStatistics();
        this.notificationService.add({type: 'success', text: 'Koltuklar başarıyla güncellendi'});
        this.standingBlockCapacity = null;
        this.venueEditor.selectSeats(null);
        this.venueEditor.selectBlocks(null);
        this.selectedBlock = null;
        this.changeDetector.detectChanges();
    }, error => {
        this.isLoading = false;
        this.standingBlockCapacity = null;
        this.venueEditor.selectSeats(null);
        this.venueEditor.selectBlocks(null);
        this.selectedBlock = null;
        this.notificationService.add({type: 'danger', text: error.Message});
        this.changeDetector.detectChanges();
    });
  }

  saveSeats(venueSeats: VenueSeat[]) {
    this.isLoading = true;
    this.venueSeatService.setCustomEndpoint('PatchAll');
    this.venueSeatService.update(venueSeats).subscribe( result => {
      this.isLoading = false;
      this.resetStatistics();
      this.notificationService.add({type: 'success', text: 'Koltuklar başarıyla güncellendi'});
      let seat;
      venueSeats.forEach( venueSeat => {
        seat = this.selectedSeats.find( item => item['Id'] == venueSeat.Id);
        if(seat) {
          seat.Status = venueSeat.Status;
          this.venueEditor.setSeat(seat);
        }
      });
      this.standingBlockCapacity = null;
      this.venueEditor.selectSeats(null);
      this.venueEditor.selectBlocks(null);
      this.selectedBlock = null;
      this.changeDetector.detectChanges();
    }, error => {
      this.notificationService.add({type: 'danger', text: 'Koltuk durumu değiştirilemedi'});
      this.isLoading = false;
    });
  }

}
