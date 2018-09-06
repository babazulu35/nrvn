import { TabItem } from './../../modules/common-module/components/tab-bar/tab-bar.component';
import { SeatStatistics } from './../../models/seat-statistics';
import { SeatStatus } from "../../models/seat-status.enum";
import { EntityService } from './../../services/entity.service';
import { Component, OnInit, HostBinding, ViewChild, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TitleSwitcherComponent } from './../../modules/common-module/components/title-switcher/title-switcher.component';
import { Venue } from './../../models/venue';
import { Template } from './../../models/template';
import { Performance } from './../../models/performance';
import { PerformanceStatus } from './../../models/performance-status.enum';
import { HeaderTitleService } from './../../services/header-title.service';
import { AuthenticationService } from './../../services/authentication.service';
import { PerformanceService } from '../../services/performance.service';
import { TemplateService } from '../../services/template.service';
import { VenueService } from '../../services/venue.service';
import { TicketType } from "../../models/ticket-type.enum";
import { Roles } from '../../models/roles';


@Component({
    selector: 'app-performance',
    templateUrl: './performance.component.html',
    styleUrls: ['./performance.component.scss'],
    providers: [
        PerformanceService, TemplateService, VenueService,
        {provide: 'PerformanceServiceInstance1', useClass: PerformanceService },
        {provide: 'titlePresetsService', useClass: EntityService },
        {provide: 'getPerformanceStatisticsService', useClass: PerformanceService }
    ]
})
export class PerformanceComponent implements OnInit {
    @ViewChild(TitleSwitcherComponent) titleSwitcher: TitleSwitcherComponent;
    @HostBinding('class.or-performance') true;

    performanceStatus = PerformanceStatus;
    isLoading: boolean;
    subscription;
    pageID: number;

    performance: Performance;
    template: Template;
    venue: Venue;
    totalCapacity: number;

    tabs: Array<any> = [
        { label: 'KONTROL PANELİ', routerLink: 'reports', params: {role: Roles.PERFORMANCE_DASHBOARD, isCollapsed: true} },
        { label: 'BİLETLER', routerLink: 'products', params: {role: Roles.PERFORMANCE_TICKETS, isCollapsed: true} },
        { label: 'KOLTUKLAR', routerLink: 'cancel-block', params: {role: Roles.PERFORMANCE_SEATS, isCollapsed: true} },
        { label: 'DAVETİYE', routerLink: 'invitations', params: {role: Roles.PERFORMANCE_COMP, isCollapsed: true} },
        { label: 'HAVUZ DAVETİYE', routerLink: 'pool-invitations', params: {role: Roles.PERFORMANCE_POOL_COMP, isCollapsed: true} },
        { label: 'REZERVASYON', routerLink: 'reservations', params: {role: Roles.PERFORMANCE_RESERVATIONS, isCollapsed: true} },
        { label: 'GRUP SATIŞ', routerLink: 'group-sale', params: {role: Roles.PERFORMANCE_GROUP_SALES, isCollapsed: true} },
        { label: 'RELOKASYON', routerLink: 'relocation', params: {role: Roles.PERFORMANCE_RELOCATION, isCollapsed: true} },
        { label: 'TOPLU İADE', routerLink: 'group-refund', params: {role: Roles.PERFORMANCE_BULK_REFUND, isCollapsed: true} },
    ];

    blocks: {BlockId: number, Name: string,
        Statistics: {
            key: string, count: number //Count: number, SeatStatus: number, SeatStatus_Desc: string, TicketType: number, TicketType_Desc: string
        }[]
    }[];
    seatStatistics: SeatStatistics;
    selectedTab: TabItem

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private headerTitleService: HeaderTitleService,
        private authenticationService: AuthenticationService,
        private templateService: TemplateService,
        private venueService: VenueService,
        private performanceService: PerformanceService,
        @Inject('PerformanceServiceInstance1') private titleSearchService: PerformanceService,
        @Inject('titlePresetsService') private titlePresetsService: EntityService,
        @Inject('getPerformanceStatisticsService') private getPerformanceStatisticsService: PerformanceService
    ) { }

    ngOnInit() {
        this.headerTitleService.setTitle('Performanslar');

        this.subscription = this.route.params.subscribe(params => {
            this.pageID = +params['id'];

            this.template = null;
            this.venue = null;
            this.performance = null;

            this.performanceService.flushCustomEndpoint();
            this.performanceService.find(this.pageID, true);
        });

        this.titleSearchService.data.subscribe(performances => {
            if(!(this.titleSwitcher && this.titleSwitcher.finder)) { return }

            let result: {}[] = [];
            performances.forEach( performanceItem => {
                result.push({
                    id: performanceItem.Id,
                    title: performanceItem.PerformanceName,
                    icon: "audiotrack",
                    params: {performance: performanceItem}
                })
            });

            this.titleSwitcher.finderSearchResults = Observable.of([{
                title: "ARAMA SONUÇLARI",
                list: result
            }]);
        });

        this.titlePresetsService.data.subscribe( performances => {
            if(!(this.titleSwitcher && this.titleSwitcher.finder)) { return }
            let result: {}[] = [];
            performances.forEach( performanceItem => {
                result.push({
                    id: performanceItem.Id,
                    title: performanceItem.Localization.Name,
                    icon: "audiotrack",
                    params: {performance: performanceItem}
                })
            });

            this.titleSwitcher.finderPresets = Observable.of([{
                title: "SON EKLENENLER",
                list: result
            }]);
        });

        this.performanceService.data.subscribe(performances => {
            if (!(performances && performances.length > 0)) { return }

            if (!this.performance) {
                this.performance = new Performance(performances[0]);
                this.statisticsDataHandler();
                this.resetStatistics();

                if (this.performance.Status !== PerformanceStatus.OnSale) {
                    this.tabs = this.tabs.filter(t => t['routerLink'] !== 'group-sale');
                }

                if (!(this.performance.Status === PerformanceStatus.OnSale || this.performance.Status === PerformanceStatus.SoldOut)) {
                    this.tabs = this.tabs.filter(t => t['routerLink'] !== 'relocation');
                }

                this.templateService.find(this.performance.VenueTemplateId, true);

                if (this.tabs && this.tabs.length) {
                    let authenticatedTabs = this.tabs.filter(r =>  this.authenticationService.roleHasAuthenticate(r['params']['role']));
                    if (authenticatedTabs && authenticatedTabs.length) {
                        this.router.navigate([authenticatedTabs[0].routerLink], {relativeTo: this.route});
                    }
                }
            }
        });

        this.templateService.data.subscribe( templateData => {
            if (!(templateData && templateData.length > 0)) { return }

            this.template = new Template(templateData[0]);
            if(this.template) this.venueService.find(this.template.VenueId, true);
        });

        this.venueService.data.subscribe(venues => {
            if (!(venues && venues.length > 0)) { return }

            this.venue = new Venue(venues[0]);
        });
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

            this.seatStatistics = {};
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
            this.seatStatistics.soldCount = this.seatStatistics.soldIndividualCount + this.seatStatistics.soldSeasonalCount + this.seatStatistics.soldGroupCount + this.seatStatistics.soldCompCount;
            this.seatStatistics.totalCapacityCount = this.seatStatistics.onSaleCount + this.seatStatistics.pendingCount + this.seatStatistics.soldCount + this.seatStatistics.blockedCount + this.seatStatistics.canceledCount + this.seatStatistics.reservedCompCount + this.seatStatistics.reservedIndividualCount + this.seatStatistics.selectedCount;
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
        this.seatStatistics[key] = count;
    }

    titleSearchHandler(value) {
        this.titleSearchService.setCustomEndpoint('GetPerformanceList');
        if(value && value.length > 0) {
            this.titleSearchService.query({ page: 0, pageSize: 10, search: {key: 'PerformanceName', value: value}});
        }
    }

    titleChangeHandler(event) {
        this.router.navigate(["performance", event.id]);
    }

    titleActionHandler(event) {
        switch(event.action) {
            case "finderOpen":
                this.titlePresetsService.setCustomEndpoint('GetAll');
                this.titlePresetsService
                    .fromEntity('EPerformance')
                    .orderBy('Date', 'desc')
                    .expand(['Localization'])
                    .take(4)
                    .page(0)
                    .executeQuery();
            break;
        }
    }
    
    tabChangeHandler(event) {
        this.selectedTab = event;
    }
}
