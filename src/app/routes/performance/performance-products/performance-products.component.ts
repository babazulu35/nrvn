import { PerformanceService } from './../../../services/performance.service';
import { AuthenticationService } from './../../../services/authentication.service';
import { Performance } from './../../../models/performance';
import { NotificationService } from './../../../services/notification.service';
import { AccessIntegrationService } from './../../../services/access-integration.service';
import { Component, OnInit, HostBinding, Inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { EntityService } from '../../../services/entity.service';
import { SeatStatus } from '../../../models/seat-status.enum';


@Component({
	selector: 'app-performance-products',
	templateUrl: './performance-products.component.html',
	styleUrls: ['./performance-products.component.scss'],
	providers:[
		ProductService, EntityService, AccessIntegrationService, PerformanceService,
		{provide: 'entityServiceInstance1', useClass: EntityService },
		{provide: 'entityServiceInstance2', useClass: EntityService },
		{provide: 'entityServiceInstance3', useClass: EntityService },
	]
})
export class PerformanceProductsComponent implements OnInit, AfterViewInit {
	@HostBinding('class.or-performance-products') true;
	subscription;
	errorMessage: any;

	performance: Performance;
	products = [];
	pageID: number;
	isLoading: boolean = false;
	noDataInContent: boolean = true;
	canSendAccessCode: boolean;
	isPromising: boolean;

	totalCapacity: number = 0;
	openCapacity: number = 0;
	soldTicketCount: number = 0;

	flags: {PublishDateFieldOn: boolean} = {
		PublishDateFieldOn: false
	};
	newPublishDate: string;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private productService: ProductService,
		private entityService: EntityService,
		private performanceService: PerformanceService,
		@Inject('entityServiceInstance1') private capacityService: EntityService,
		@Inject('entityServiceInstance2') private openCapacityService: EntityService,
		@Inject('entityServiceInstance3') private soldTicketService: EntityService,
		private accessIntegrationServcie: AccessIntegrationService,
		private notificationService: NotificationService,
		private authenticationService: AuthenticationService,
		private changeDetector: ChangeDetectorRef,
	) { }

	ngOnInit() {
		this.subscription = this.route.parent.params.subscribe(params => {
			this.isLoading = true;
			this.pageID = +params['id'];

			this.performanceService.flushCustomEndpoint();
			this.performanceService.find(this.pageID, true);
			this.performanceService.data.subscribe( result => this.setPerformance(result && result[0] ? result[0] : null) );

			this.entityService.setCustomEndpoint('GetAll');
			this.entityService.fromEntity('EPerformanceProduct')
			.where('PerformanceId', '=', params['id'])
			.expand(['Product', 'Localization'])
			.expand(['Product', 'PriceLists','Variants'])
			.expand(['Product', 'PriceLists','Localization'])
			.expand(['Product', 'Currency'])
			.expand(['Performance'])
			.take(40)
			.page(0)
			.executeQuery();

			this.capacityService.setCustomEndpoint('GetAll');
			this.capacityService.fromEntity('EVenueSeat')
			.where('VenueRow/PerformanceId', '=', params['id'])
			.and('Status', '!=', SeatStatus.Deleted, 'SeatStatus')
			.and('Status', '!=', SeatStatus.Failed, 'SeatStatus')
			.take(1).page(0)
			.executeQuery();

			this.soldTicketService.setCustomEndpoint('GetAll');
			this.soldTicketService.fromEntity('EVenueSeat')
			.where('VenueRow/PerformanceId', '=', params['id'])
			.and('Status', '=', "cast('2', Nirvana.Shared.Enums.SeatStatus)")
			.take(1).page(0)
			.executeQuery();

			this.openCapacityService.setCustomEndpoint('GetAll');
			this.openCapacityService.fromEntity('EVenueSeat')
			.where('VenueRow/PerformanceId', '=', params['id'])
			.and('Status', '=', "cast('1', Nirvana.Shared.Enums.SeatStatus)")
			.take(1).page(0)
			.executeQuery();
		});

		this.capacityService.getCount().subscribe(
			count => { this.totalCapacity = count; },
			error => this.errorMessage = <any>error
		);

		this.soldTicketService.getCount().subscribe(
			count => { this.soldTicketCount = count; },
			error => this.errorMessage = <any>error
		);

		this.openCapacityService.getCount().subscribe(
			count => { this.openCapacity = count; },
			error => this.errorMessage = <any>error
		);
	}

	ngAfterViewInit() {
		this.entityService.data.subscribe(entities => {
			this.products = [];

			entities.forEach(entity => {
				let product = entity['Product'];
				product['CategoryColorSeat'] = entity['CategoryColorSeat'];
				let price = null;

				if (product['PriceLists']) {
					if (product['PriceLists'].length === 1) {
						price = product['PriceLists'][0];
					} else {
						let sortedPrices = product.PriceLists.sort((p1, p2) => {
							if (Date.parse(p1.BeginDate) > Date.parse(p2.BeginDate)) {
								return 1;
							} else if (Date.parse(p1.BeginDate) < Date.parse(p2.BeginDate)) {
								return -1;
							} else {
								return 0;
							}
						});

						if (this.performance && this.performance.Date && (Date.parse(this.performance.Date) > Date.now())) {
							let prices = sortedPrices.filter(p => (Date.parse(p.EndDate) > Date.now()) || p.EndDate === null);
							if (prices && prices.length) {
								price = prices ? prices[0] : null;
							} else {
								price = sortedPrices[sortedPrices.length - 1];
							}
						} else {
							price = sortedPrices[sortedPrices.length - 1];
						}
					}
				}

				if (price) {
					product.CurrentPrice = price['NominalPrice'];
					product.SalesBeginDate = price['BeginDate'];
					product.SalesEndDate = price['EndDate'];
					product.ActualSalesTotal = price['ActualSalesTotal'];
					product.AllowedSalesTotal = price['AllowedSalesTotal'];
					product.isPast = price['EndDate'] ? Date.parse(price['EndDate']) < Date.now() : false;
				}
				this.products.push(product);
			});
			this.isLoading = false;
			if(this.products.length == 0) {
			  this.noDataInContent = true;
			} else {
			  this.noDataInContent = false;
			}
		});
		this.changeDetector.detectChanges();
	}

	productActionHandler(event, product) {
		if (!product) return;
		
		switch(event.action) {
			case "edit":
				this.router.navigate(['product', product.Id, 'edit'], {queryParams: {performanceId: this.pageID}});
			break;
		}
	}

	setPerformance(performance: any) {
		if(!performance || performance.Id != this.pageID) return;
		this.performance = performance;
		this.flags.PublishDateFieldOn = this.performance.PublishDate != null;
		let hasAuthentication: boolean = this.authenticationService.roleHasAuthenticate(AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN, AuthenticationService.ROLE_PROMOTER);
		this.canSendAccessCode = this.performance && this.performance.AccessIntegrationTypeId && hasAuthentication;
	}

	accessCodeActionHandler(event) {
		if(!this.performance) return;
		switch(event.action) {
			case "sendAccessCode":
				this.isPromising = true;
				this.accessIntegrationServcie.batchAddAccessCode(this.performance.Id).subscribe( result => {
					this.notificationService.add({type: "success", text: "Erişim kodu başarıyla gönderildi."});
					this.isPromising = false;
				}, error => {
					this.notificationService.add({type: "danger", text: "Erişim kodu gönderilemedi! ("+ error.ErrorCode + ": " +error.Message + ")"});
					this.isPromising = false;
				});
			break;
		}
	}

	checkHandler(value, name:string, target: string = "event") {
		switch(name) {
			case 'PublishDateFieldOn':
				this.flags.PublishDateFieldOn = value;
				if(!value) {
					this.newPublishDate = null;
					this.savePublishDate();
				}
			break;
		}
	}

	dateChangeHandler(value, name){
		switch(name) {
			case 'PublishDate':
				this.newPublishDate = value;
			break;
		}
	}

	savePublishDate(){
		if(this.newPublishDate != this.performance.PublishDate){
			this.performance.set('PublishDate', this.newPublishDate);
			let save = this.performanceService.update({Id: this.performance.Id, 'PublishDate' : this.newPublishDate});
			save.subscribe(result=>{
				this.notificationService.add({text: 'Yayınlanma tarihi güncellendi', type:'success'});
			}, error => {
				this.notificationService.add({text: 'Yayınlanma tarihi güncellenemedi. ' + (error.Message || ""), type:'danger'});
			});
		}
	}

}
