import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { TetherDialog } from "./../../../../modules/common-module/modules/tether-dialog/tether-dialog";
import { AuthenticationService } from './../../../../services/authentication.service';
import { ReportPerformanceService } from './../../../../services/report-performance.service';


@Component({
	selector: 'app-performance-reports-visit-data',
	templateUrl: './performance-reports-visit-data.component.html',
	styleUrls: ['./performance-reports-visit-data.component.scss'],
	providers: [
		ReportPerformanceService,
		{provide: 'ReportPerformanceService1', useClass: ReportPerformanceService },
		{provide: 'ReportPerformanceService2', useClass: ReportPerformanceService },
		{provide: 'ReportPerformanceService3', useClass: ReportPerformanceService },
		{provide: 'ReportPerformanceService4', useClass: ReportPerformanceService },
	],
})
export class PerformanceReportsVisitDataComponent implements OnInit {
	errorMessage: any;
	subscription;

	private pageID: number;

	clickDetailReferrerData;
	clickDetailSMChannelData;
	clickDetailSourceData;
	transactionsByVistorsData;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private tetherDialog: TetherDialog,
		private authenticationService: AuthenticationService,
		private reportPerformanceService: ReportPerformanceService,
		@Inject('ReportPerformanceService1') private clickDetailReferrerService: ReportPerformanceService,
		@Inject('ReportPerformanceService2') private clickDetailSMChannelService: ReportPerformanceService,
		@Inject('ReportPerformanceService3') private clickDetailSourceService: ReportPerformanceService,
		@Inject('ReportPerformanceService4') private transactionsByVistorsService: ReportPerformanceService,
	) {
		this.clickDetailReferrerService.setCustomEndpoint('PerformanceClickDetailReferrer', true);
		this.clickDetailSMChannelService.setCustomEndpoint('PerformanceClickDetailSMChannel', true);
		this.clickDetailSourceService.setCustomEndpoint('PerformanceClickDetailSource', true);
		this.transactionsByVistorsService.setCustomEndpoint('PerformanceTransactionsByVistors', true);
	}

	ngOnInit() {
		this.route.parent.parent.params.subscribe(params=>{
			this.pageID = +params["id"]

			let user = this.authenticationService.getAuthenticatedUser();
			if(!(user && user.FirmId)){return}

			this.reportPerformanceService.setQueryParams({performanceId: this.pageID, platformId: user.FirmId});
		});

		this.subscription = this.reportPerformanceService.queryParamSubject.subscribe(params => {
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

	ngOnDestroy() {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
	}

	openReportsMenu(event) {
		let instance = {
			title: "DEĞİŞTİR",
			data: [
				{ label: 'Bilet Satış İstatistikleri', action: "statistics"},
				{ label: 'Performans Sayfası Ziyaret Bilgileri', action: 'visitdata'},
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
			this.router.navigate(['/performance', this.pageID, 'reports', result.action]);
			console.log("Context Result",result);
		}).catch(reason => {});
	}
}
