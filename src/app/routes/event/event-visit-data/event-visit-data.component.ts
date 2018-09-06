import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { TetherDialog } from '../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { AuthenticationService } from './../../../services/authentication.service';
import { EventService } from './../../../services/event.service';
import { ReportEventService } from '../../../services/report-event.service';
import { ReportParentEventService } from '../../../services/report-parent-event.service';


@Component({
	selector: 'app-event-visit-data',
	templateUrl: './event-visit-data.component.html',
	styleUrls: ['./event-visit-data.component.scss'],
	providers: [
		ReportEventService,
		{provide: 'ReportEventService1', useClass: ReportEventService },
		{provide: 'ReportEventService2', useClass: ReportEventService },
		{provide: 'ReportEventService3', useClass: ReportEventService },
		{provide: 'ReportEventService4', useClass: ReportEventService },
		ReportParentEventService,
		{provide: 'ReportParentEventService1', useClass: ReportParentEventService },
		{provide: 'ReportParentEventService2', useClass: ReportParentEventService },
		{provide: 'ReportParentEventService3', useClass: ReportParentEventService },
		{provide: 'ReportParentEventService4', useClass: ReportParentEventService },
	],
})
export class EventVisitDataComponent implements OnInit {
	errorMessage: any;
	private subscription;

	event;
	eventType: string;
	private pageID: number;

	clickDetailReferrerData;
	clickDetailSMChannelData;
	clickDetailSourceData;
	transactionsByVistorsData;
	dataSets:any;
	chartState:number;
	pieChartPercent:number;
	pieChartMax:number = 100;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private tetherDialog: TetherDialog,
		private authenticationService: AuthenticationService,
		private eventService: EventService,
		private reportEventService: ReportEventService,
		private reportParentEventService: ReportParentEventService,
		@Inject('ReportEventService1') private clickDetailReferrerService: ReportEventService,
		@Inject('ReportEventService2') private clickDetailSMChannelService: ReportEventService,
		@Inject('ReportEventService3') private clickDetailSourceService: ReportEventService,
		@Inject('ReportEventService4') private transactionsByVistorsService: ReportEventService,
		@Inject('ReportParentEventService1') private parentClickDetailReferrerService: ReportParentEventService,
		@Inject('ReportParentEventService2') private parentClickDetailSMChannelService: ReportParentEventService,
		@Inject('ReportParentEventService3') private parentClickDetailSourceService: ReportParentEventService,
		@Inject('ReportParentEventService4') private parentTransactionsByVistorsService: ReportParentEventService,
	) {
		this.clickDetailReferrerService.setCustomEndpoint('EventClickDetailReferrer', true);
		this.clickDetailSMChannelService.setCustomEndpoint('EventClickDetailSMChannel', true);
		this.clickDetailSourceService.setCustomEndpoint('EventClickDetailSource', true);
		this.transactionsByVistorsService.setCustomEndpoint('EventTransactionsByVistors', true);

		this.parentClickDetailReferrerService.setCustomEndpoint('ParentEventClickDetailReferrer', true);
		this.parentClickDetailSMChannelService.setCustomEndpoint('ParentEventClickDetailSMChannel', true);
		this.parentClickDetailSourceService.setCustomEndpoint('ParentEventClickDetailSource', true);
		this.parentTransactionsByVistorsService.setCustomEndpoint('ParentEventTransactionsByVistors', true);
	}

	ngOnInit() {
		this.route.parent.parent.params.subscribe(params=>{
			this.pageID = +params["id"]
		});
	
	this.pieChartPercent = 25;

    this.dataSets = [
      {
        currentState:1,
        label: this.chartLabelFix(["15/06 Pzt","16/06 Sa","17/06 Çar","18/06 Perş","19/06 Cum","20/06 Cmt","21/06 Paz"],"string"),
       
        datas:[
           {filterData:"Two Door Cinema Club",borderColor: "#FF9BFF", data: this.chartLabelFix([200,300,147,621,374,16,674], "number")},
        ]
      },
      {
        currentState:2,
        label: this.chartLabelFix(["22/06 Pzt","23/06 Sa","24/06 Çar","25/06 Perş","26/06 Cum","27/06 Cmt","28/06 Paz"],"string"),
        datas:[
           {filterData:"Two Door Cinema Clubs",borderColor: "#FF9BFF", data: this.chartLabelFix([481,130,47,221,474,146,374], "number")},
           
        ]        
      }
    ];  
		// --------------------- parent route service data ---------------------
		this.eventService.data.subscribe(events=>{
			this.event = events[0];

			let user = this.authenticationService.getAuthenticatedUser();
			if(!(user && user.FirmId)){return}

			if(this.event && this.event.ChildEventCount > 0) { // çatı etkinlik
				this.eventType = "master"
				this.reportParentEventService.setQueryParams({parentEventId: this.pageID, platformId: user.FirmId});
				this.prepareForMasterEvent();
			} else {
				this.eventType = "normal"
				this.reportEventService.setQueryParams({eventId: this.pageID, platformId: user.FirmId});
				this.prepareForNormalEvent();
			}
		});
		// ---------------------------------------------------------------------
	}

	ngOnDestroy() {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
	}

	private prepareForMasterEvent(){
		this.subscription = this.reportParentEventService.queryParamSubject.subscribe(params => {
			if (!params) { return }

			this.parentClickDetailReferrerService.fetch(params);
			this.parentClickDetailSMChannelService.fetch(params);
			this.parentTransactionsByVistorsService.fetch(params);
			this.parentClickDetailSourceService.fetch(params);
		}, error => this.errorMessage = <any>error);


		// Referans Siteler
		this.parentClickDetailReferrerService.data.subscribe(response => {
			this.clickDetailReferrerData = response;
		});

		// Sosyal Medya
		this.parentClickDetailSMChannelService.data.subscribe(response => {
			this.clickDetailSMChannelData = response;
		});

		// ------------------------------ Sidebar ------------------------------
		// İlk Bakış
		this.parentTransactionsByVistorsService.data.subscribe(response => {
			this.transactionsByVistorsData = response;
		});

		// Ziyaretçi Kaynakları
		this.parentClickDetailSourceService.data.subscribe(response=>{
			this.clickDetailSourceData = response;
		});
		// ---------------------------------------------------------------------
	}

	private prepareForNormalEvent(){
		this.subscription = this.reportEventService.queryParamSubject.subscribe(params => {
			if (!params) { return }

			this.clickDetailReferrerService.fetch(params);
			this.clickDetailSMChannelService.fetch(params);
			this.transactionsByVistorsService.fetch(params);
			this.clickDetailSourceService.fetch(params);
		}, error => this.errorMessage = <any>error);


		// Referans Siteler
		this.clickDetailReferrerService.data.subscribe(response => {
			this.clickDetailReferrerData = response;
		});

		// Sosyal Medya
		this.clickDetailSMChannelService.data.subscribe(response => {
			this.clickDetailSMChannelData = response;
		});

		// ------------------------------ Sidebar ------------------------------
		// İlk Bakış
		this.transactionsByVistorsService.data.subscribe(response => {
			this.transactionsByVistorsData = response;
		});

		// Ziyaretçi Kaynakları
		this.clickDetailSourceService.data.subscribe(response => {
			this.clickDetailSourceData = response;
		});
		// ---------------------------------------------------------------------
	}

	openReportsMenu(event) {
		let instance = {
			title: "DEĞİŞTİR",
			data: [
				{ label: 'Bilet Satış İstatistikleri', action: "statistics"},
				{ label: 'Etkinlik Sayfası Ziyaret Bilgileri', action: 'visitdata'},
				// { label: 'Demografik Dağılımlar', action:'demographic'}
			]
		};

		this.tetherDialog.context(instance,
		{
			overlay:{},
			target: event.target,
			attachment: "top left",
			targetAttachment: "top left",
		}).then(result =>  {
			this.router.navigate(['event', this.pageID, 'reports', result.action]);
			console.log("Context Result",result);
		}).catch(reason => {});
	}
	chartLabelFix(label:any,type:string):any[] {
		// Ux için Yapıldı
		if(type=="string") {
			// Add empty space to last element
			label.splice(label.length,0,"");
			// Add empty space to first element
			label.splice(0,0,"");
			return label;

		} else if ( type=="number") {
			label.splice(label.length,0,null);
			// Add empty space to first element
			label.splice(0,0,null);
			return label;
		}
	}
	resultEventHandler(event) {
	    this.chartState = event;
  }		
}
