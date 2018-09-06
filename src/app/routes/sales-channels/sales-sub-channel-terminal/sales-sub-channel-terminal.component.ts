import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { EntityService } from './../../../services/entity.service';

@Component({
	selector: 'app-sales-sub-channel-terminal',
	templateUrl: './sales-sub-channel-terminal.component.html',
	styleUrls: ['./sales-sub-channel-terminal.component.scss'],
	providers: [
		EntityService,
		{provide: 'entityService1', useClass: EntityService },
	],
})
export class SalesSubChannelTerminalComponent implements OnInit {
	subscription;
	errorMessage: any;

	salesSubChannel: any;
	salesSubChannelTerminals = [];
	count: number;
	noDataInContent = false;
	isLoading = false;
	isPromising = false;

	showPagination = true;
	pageSizes: Array<Object> = [{text: '10', value: 10}, {text: '20', value: 20}];
	pageSize = 10;
	currentPage = 1;

	pills: Array<any> = [
		{text: 'TÜMÜ', filter: '', isActive: false},
		{text: 'AKTİF', filter: 'IsActive eq true', isActive: false},
		{text: 'PASİF', filter: 'IsActive eq false', isActive: false},
	];

	constructor(
		private route: ActivatedRoute,
		public tetherDialog: TetherDialog,
		private salesSubChannelService: EntityService,
		@Inject('entityService1') private entityService: EntityService,
	) {
		this.entityService.setCustomEndpoint('GetAll');
	}

	ngOnInit() {		

		this.subscription = this.route.params.subscribe(params => {
			let param = +params['id'];
			this.salesSubChannelService.setCustomEndpoint('GetAll');
			this.salesSubChannelService.fromEntity('CSalesSubChannel')
				.expand(['Parent'])
				.where('Id', '=', param)
				.take(1).page(1).executeQuery();
		});

		this.salesSubChannelService.data.subscribe(
			entities => {
				if (entities && entities[0]) {
					this.salesSubChannel = entities[0];

					this.entityService.setQueryParams({page: this.currentPage, pageSize: this.pageSize});
				}
			}, error => this.errorMessage = <any>error);

		this.subscription = this.entityService.queryParamSubject.subscribe(
			params => {
				if (!this.salesSubChannel) {
					return;
				}

				this.isLoading = true;
				this.updateLocalParams(params);

				let query = this.entityService.fromEntity('CSalesSubChannelTerminal')
					.where('SalesSubChannelId', '=', this.salesSubChannel.Id)
					.and('EndDate', '<', (new Date()).toJSON())
					.expand(['Terminal'])					
					.take(params['pageSize'])
					.page(params['page']);

				let sort = params['sort'] ? (typeof params['sort'] === 'string'  ? JSON.parse(params['sort']) : params['sort']) : null;
				if(sort && sort[0]) {
					query.orderBy(sort[0]['sortBy'], sort[0]['type'])
				}
				if(params['search']) {
					query.search(params['search']['key'], params['search']['value']);
				}
				if (params['filter'] && params['filter'].length > 0 && params['filter'][0].filter) {
					query.whereRaw(`SalesSubChannelId eq ${this.salesSubChannel.Id} and ${params['filter'][0].filter}`);
				}

				query.executeQuery();
			}, error => this.errorMessage = <any>error

		);

		this.entityService.data.subscribe(
			entities => {				
				this.salesSubChannelTerminals = entities;
				this.noDataInContent = this.salesSubChannelTerminals.length === 0;

				this.isLoading = false;
				this.isPromising = false;
			},
			error => this.errorMessage = <any>error
		);

		this.entityService.getCount().subscribe(
			count => this.count = count,
			error => this.errorMessage = <any>error
		);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	updateLocalParams(params: Object = {}) {
		this.currentPage = params['page'] ? params['page'] : 1;
		this.pageSize = params['pageSize'] ? params['pageSize'] : 10;
	}

	onInputChange(event) {
		this.entityService.setSearch({ key: 'Terminal/Name', value: event });
	}

	toggleSortTitle(sort) {
		if(sort){
			this.entityService.setOrder(sort, true);
		} else {
			this.entityService.flushOrder();
		}
	}

	pillFilter(pill) {
		this.entityService.setFilter(pill);
	}

	transistPage(page) {
		this.entityService.setPage(page);
	}

	changePageSize(pageSize) {
		this.entityService.setPageSize(pageSize);
	}
}
