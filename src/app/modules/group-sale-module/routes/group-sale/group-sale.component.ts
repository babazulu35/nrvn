import { Performance } from './../../../../models/performance';
import { GroupSaleService } from './../../services/group-sale.service';
import { Component, OnInit, Inject } from '@angular/core';
import { PerformanceService } from '../../../../services/performance.service';
import { EntityService } from '../../../../services/entity.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SeatStatus } from '../../../../models/seat-status.enum';
import { TicketType } from '../../../../models/ticket-type.enum';

@Component({
  selector: 'app-group-sale',
  templateUrl: './group-sale.component.html',
  styleUrls: ['./group-sale.component.scss'],
  providers: [
    GroupSaleService, 
    EntityService,
    {provide: 'getPerformanceStatisticsService', useClass: PerformanceService }
  ]
})
export class GroupSaleComponent implements OnInit {
  performance: Performance;
  isLoading: boolean;

  blocks: {BlockId: number, Name: string,
    Statistics: {
      key: string, count: number //Count: number, SeatStatus: number, SeatStatus_Desc: string, TicketType: number, TicketType_Desc: string
    }[]
  }[];

  seatStatistics;

  constructor(
    @Inject('getPerformanceStatisticsService') private getPerformanceStatisticsService: PerformanceService,
    public groupSaleService: GroupSaleService,
    private performanceEntityService: EntityService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { 
    this.seatStatistics = this.groupSaleService.seatStatistics;
  }

  ngOnInit() {
    this.activatedRoute.url.subscribe( url => {
      try {
        let parts = this.router.url.split('/performance/');
        if(parts[1]) {
          let performanceId:number = parseInt(parts[1].split("/")[0]);
          if(!this.performance || this.performance.Id != performanceId) this.getPerformance(performanceId);
        }
      }catch(e){
        console.log("Perfromans Id bulunamadı");
      }
    });

    this.isLoading = true;
    this.performanceEntityService.data.subscribe( entities => {
      if(entities && entities[0]) this.performance = this.groupSaleService.setPerformance(entities[0]);
      this.isLoading = false;

      if(this.performance) {
        this.statisticsDataHandler();
        this.resetStatistics();
      }
    });
  }

  getPerformance(id) {
    this.isLoading = true;
    
    this.performanceEntityService.setCustomEndpoint("GetAll");
    this.performanceEntityService
      .fromEntity('EPerformance')
      .where('Id', '=',  id)
      .expand(['Localization'])
      .expand(['VenueTemplate','Venue','Localization'])
      .expand(['VenueTemplate','Venue','Town','City'])
      .expand(['Products', 'Product', 'Localization'])
      .expand(['Products', 'Product', 'Seats'])
      .expand(['Products', 'Product', 'Currency'])
      .expand(['Products', 'Product', 'PriceLists', 'Variants', 'VariantType', 'Localization'])
      .expand(['Products', 'Product', 'PriceLists', 'Variants', 'Prices', 'SalesChannel'])
      // .filterOnExpand('Status', '=', '1', 4)
      .take(1)
      .page(0)
      .executeQuery();
  }

  resetStatistics(){
    this.isLoading = true;
    this.getPerformanceStatisticsService.setCustomEndpoint('GetPerformanceStatistics');
    this.getPerformanceStatisticsService.query({pageSize: 10000}, [{key: "performanceId", value: this.performance.Id}]);
  }

  statisticsDataHandler() {
    this.getPerformanceStatisticsService.data.subscribe( result => {
      this.blocks = [];
      let statistics: {
        "SeatStatus": number,
        "TicketType": number,
        "Count": number
      }[];
      let stat: {
        "SeatStatus": number,
        "TicketType": number,
        "Count": number
      };
      if(result && result.length) result.forEach( item => {
        let block = {
          BlockId: item["BlockId"],
          Name: item["Name"],
          Statistics: []
        };
        statistics = item["Statistics"];
        if(statistics && statistics.length) {
          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.OnSale );
          block.Statistics.push({key: "onSaleCount", count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Pending );
          block.Statistics.push({key: "pendingCount", count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Selected );
          block.Statistics.push({key: "selectedCount", count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Hold );
          block.Statistics.push({key: "blockedCount", count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Killed );
          block.Statistics.push({key: "canceledCount", count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Sold && statItem.TicketType == TicketType.Sale);
          block.Statistics.push({key: "soldIndividualCount", count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Sold && statItem.TicketType == TicketType.Seosanal);
          block.Statistics.push({key: "soldSeasonalCount", count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Sold && statItem.TicketType == TicketType.Comp);
          block.Statistics.push({key: "soldCompCount", count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Sold && statItem.TicketType == TicketType.Group);
          block.Statistics.push({key: "soldGroupCount", count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Reserved && statItem.TicketType == TicketType.Sale);
          block.Statistics.push({key: "reservedIndividualCount", count: stat ? stat.Count : 0});

          stat = statistics.find( statItem => statItem.SeatStatus == SeatStatus.Reserved && statItem.TicketType == TicketType.Comp);
          block.Statistics.push({key: "reservedCompCount", count: stat ? stat.Count : 0});
        }
        this.blocks.push(block);
      });

      this.setStatisticCount("onSaleCount");
      this.setStatisticCount("pendingCount");
      this.setStatisticCount("soldCount");
      this.setStatisticCount("blockedCount");
      this.setStatisticCount("canceledCount");
      this.setStatisticCount("selectedCount");
      this.setStatisticCount("soldIndividualCount");
      this.setStatisticCount("soldSeasonalCount");
      this.setStatisticCount("soldCompCount");
      this.setStatisticCount("soldGroupCount");
      this.setStatisticCount("reservedIndividualCount");
      this.setStatisticCount("reservedCompCount");
      this.groupSaleService.setSeatStatistic('soldCount', this.seatStatistics.soldIndividualCount + this.seatStatistics.soldSeasonalCount + this.seatStatistics.soldGroupCount + this.seatStatistics.soldCompCount);
      this.groupSaleService.setSeatStatistic('totalCapacityCount', this.seatStatistics.onSaleCount + this.seatStatistics.pendingCount + this.seatStatistics.soldCount + this.seatStatistics.blockedCount + this.seatStatistics.canceledCount + this.seatStatistics.reservedCompCount + this.seatStatistics.reservedIndividualCount + this.seatStatistics.selectedCount);
      this.isLoading = false;
    });
  }

  setStatisticCount(key: string) {
    let count: number = 0;
    this.blocks.forEach( block => {
      block.Statistics.forEach( stat => {
        if(stat.key == key) count += stat.count;
      });
    });
    this.groupSaleService.setSeatStatistic(key, count);
  }

}
