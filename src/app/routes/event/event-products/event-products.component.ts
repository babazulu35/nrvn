import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { ContextMenuComponent } from './../../../modules/common-module/components/context-menu/context-menu.component';
import { ProductService } from '../../../services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, ComponentRef, ComponentFactoryResolver, Injector, OnInit, HostBinding } from '@angular/core';
import { EntityService } from '../../../services/entity.service';
import { PerformanceService } from '../../../services/performance.service';

@Component({
	selector: 'app-event-products',
	templateUrl: './event-products.component.html',
	styleUrls: ['./event-products.component.scss'],
	providers:[PerformanceService, ProductService, EntityService]
})
export class EventProductsComponent implements OnInit {
	@HostBinding('class.or-event-products') true;

	pageID: number;
	products = {};
	productPerformances = [];
	performanceIds = [];
	count: number = 0;
	pageSize: number = 10;
	subscription;
	isLoading: boolean = false;
	noDataInContent: boolean = false;

	constructor(
		private entityService: EntityService,
		private performanceService: PerformanceService,
		private productService: ProductService,
		private route: ActivatedRoute,
		private router: Router,
		private injector: Injector,
		private resolver: ComponentFactoryResolver,
		public tetherService: TetherDialog
	) { }

	ngOnInit() {
		this.subscription = this.route.parent.params.subscribe(params => {
			this.isLoading = true;
			this.pageID = +params['id'];
			this.entityService.setCustomEndpoint('GetAll');
			this.entityService.fromEntity('EPerformanceProduct')
			.where('Performance/Event/Id', '=', params['id'])
			.expand(['Product'])
			.expand(['Product', 'Localization'])
			.expand(['Product', 'PriceLists','Variants'])
			.expand(['Product', 'Currency'])
			.expand(['Performance'])
			.expand(['Performance', 'Localization'])
			.take(40)
			.page(0)
			.executeQuery();
		});

		this.entityService.data.subscribe(entities => {
			this.products = {};
			this.productPerformances = [];
			this.performanceIds = [];

			entities.forEach(entity =>{
				let product = entity['Product'];
				let performance = entity['Performance'];
				let price = product['PriceLists'][0];

				if(price) {
					product.CurrentPrice = price['NominalPrice'];
					product.SalesBeginDate = price['BeginDate'];
					product.SalesEndDate = price['EndDate'];
				}

				if(!this.products[performance["Id"]]){
					this.products[performance["Id"]] = {'performance': performance, 'products': []};
					this.performanceIds.push(performance["Id"]);
				}

				this.products[performance["Id"]]['products'].push(product);
			});

			this.performanceIds.forEach(id => {
				this.productPerformances.push({
					'performance': this.products[id]['performance'],
					'products': this.products[id]['products']
				});
			});

			// this.productPerformances[0]['products'].push(product);

				//
				// let performanceFilter = '';
				// let self = this;

				// products.forEach(product => {
				// 	if(performanceIds.indexOf(product["PerformanceId"]) === -1){ performanceIds.push(product["PerformanceId"]) }

				// 	if(!this.products[product["PerformanceId"]]){
				// 		this.products[product["PerformanceId"]] = [];
				// 	}
				// 	this.products[product["PerformanceId"]].push(product);
				// });

				// performanceIds.forEach(item => {
				// 	performanceFilter += 'Id eq ' + item + ' or ';
				// });

				// performanceFilter = performanceFilter.slice(0,-3);
				// this.performanceService.query({pageSize:performanceIds.length, filter: [{filter:performanceFilter}]});
				// this.performanceService.data.subscribe(performances => {
				// 	if(performances){
				// 		performances.forEach(performance => {
				// 			this.productPerformances.push({performance:performance, products: this.products[performance.Id]});
				// 		});
				// 	}
				// });

			this.isLoading = false;
		});

		this.entityService.count.subscribe(count => {
			this.count = count;
		});
	}

	openContextMenu(e, product) {
		let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector)
		let instance: ContextMenuComponent = component.instance;

		instance.actionEvent.subscribe(action => {
			console.log("instance event", action);
		});

		instance.data = [
			/* { action: "copyEvent", parameters: '', label: 'Kopyala', group: "events" },*/
			/* { action: "changeStatus",group:"events", parameters: willChangeEventSaleStatus, label: event.status === 1 ? 'Satışa Aç' : 'Durdur' },*/
			/*{ action: "changeStatus",group:"events", parameters: willChangeEventPublishStatus, label: event.status === 6 ? 'Yayınla' : 'Yayından Kaldır' },*/
			{ label: 'Tarih / Fiyat Güncelle', icon: 'calender', action: 'datePriceEdit'},
			{ label: 'Kopyala', icon: 'layers', action: 'duplicate'},
			{ label: 'Düzenle', icon: 'edit', action: "edit"},
			{ label: 'Sil', icon: 'delete', action: 'delete'},
		]

		this.tetherService.context(component,
			{
				target: e.target,
				attachment: "top right",
				targetAttachment: "top right",
				targetOffset: '-13px 0px'
			}
		).then(result => {
			if (result) {
				switch (result['action']) {
					case "editEvent":
						this.router.navigate(['/prodcut', product.Id, 'edit']);
						break;
					case "visibilityOn":
					case "visibilityOff":
					case "archive":
					case "delete":
						// this.productService.callItemAction(event, result['action']);
						break;
				}
			}
		}).catch(reason => {
			console.log("dismiss reason : ", reason);
		});
	}
}
