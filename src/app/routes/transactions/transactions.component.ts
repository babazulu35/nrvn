import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit, HostBinding } from '@angular/core';
import { HeaderTitleService } from './../../services/header-title.service';
import { EntityService } from './../../services/entity.service';

import * as moment from 'moment';
import { AuthenticationService } from '../../services/authentication.service';
import { TransactionTypeNew } from '../../models/transaction-type-new.enum';

@Component({
	selector: 'app-transactions',
	templateUrl: './transactions.component.html',
	styleUrls: ['./transactions.component.scss'],
	providers: [EntityService, AuthenticationService],
})
export class TransactionsComponent implements OnInit {

	subscription;
	errorMessage: any;

	transactions = [];
	count: number;
	noDataInContent = false;
	isLoading = false;
	isPromising = false;

	isAllSelected = false;

	showPagination = true;
	pageSizes: Array<Object> = [{text: '10', value: 10}, {text: '20', value: 20}];
	pageSize = 10;
	currentPage = 1;
	userId;
	isBoxofficeUser = false;

	searchOptions = {
		options: [
			{value: 'refId', text: 'İşlem ID\'ye Göre' },
			{value: 'phone', text: 'GSM No\'ya göre' },
		],
		placeholders: {
			refId: 'İşlem ID\'ye göre arama yapın',
			phone: 'GSM No\'ya göre arama yapın',
		}
	}

	pills: Array<any> = [
		{text: 'TÜMÜ', filter: '', isActive: false},
		{text: 'BUGÜN', filter: this.getDateRangeFilter('today', 'PaymentDate'), isActive: false},
		{text: 'DÜN', filter: this.getDateRangeFilter('yesterday', 'PaymentDate'), isActive: false},
		{text: 'SON HAFTA', filter: this.getDateRangeFilter('lastweek', 'PaymentDate'), isActive: false},
		{text: 'SON AY', filter: this.getDateRangeFilter('lastmonth', 'PaymentDate'), isActive: false},
		{
			text: 'SATIŞ',
		 	filter: "(TransactionSubType eq cast('10', Nirvana.Shared.Enums.TransactionSubType) or TransactionSubType eq cast('11', Nirvana.Shared.Enums.TransactionSubType) or TransactionSubType eq cast('12', Nirvana.Shared.Enums.TransactionSubType))",
			 isActive: false
		},
		{
			text: 'GRUP SATIŞ',
			filter: "TransactionSubType eq cast('13', Nirvana.Shared.Enums.TransactionSubType)",
			isActive: false
		},
		{
			text: 'DAVETİYE',
			 filter: "(TransactionSubType eq cast('20', Nirvana.Shared.Enums.TransactionSubType) or TransactionSubType eq cast('21', Nirvana.Shared.Enums.TransactionSubType) or TransactionSubType eq cast('22', Nirvana.Shared.Enums.TransactionSubType))",
			 isActive: false
		},
		{
			text: 'İADE',
		 	filter: "TransactionSubType eq cast('30', Nirvana.Shared.Enums.TransactionSubType)",
		 	isActive: false
		},
	];

	constructor(
		private headerTitleService: HeaderTitleService,
		private entityService: EntityService,
		public tetherDialog: TetherDialog,
		private authenticationService: AuthenticationService,
	) {
		this.entityService.setOrder({ sortBy: 'PaymentDate', type: 'desc' });
	}

	ngOnInit() {
		this.headerTitleService.setTitle('İşlemler');
		this.headerTitleService.setLink('/transactions');

		this.userId = this.authenticationService.getAuthenticatedUser() ? this.authenticationService.getAuthenticatedUser().Id : 0;

		this.isBoxofficeUser = this.userId && this.authenticationService.hasUserOnlyRole(AuthenticationService.ROLE_BOX_OFFICE);

		this.entityService.setCustomEndpoint('GetAll');

		this.subscription = this.entityService.queryParamSubject.subscribe(
			params => {
				this.isLoading = true;
				this.updateLocalParams(params);

				let query = this.entityService.fromEntity('TBasket')
				.expand(['Terminal'])
				.expand(['Currency'])
				.expand(['SalesChannel'])
				.expand(['SalesSubChannel'])
				.expand(['MemberInfo'])
				.expand(['User'])
				.take(params['pageSize'])
				.page(params['page']);

				let sort = params['sort'] ? (typeof params['sort'] == 'string'  ? JSON.parse(params['sort']) : params['sort']) : null;
				if (sort && sort[0]) {
					query.orderBy(sort[0]['sortBy'], sort[0]['type'])
				}
				if (params['search']) {
					query.search(params['search']['key'], params['search']['value']);
				}

				if (this.isBoxofficeUser) {
					query.where('UserId', '=', this.userId);
					if (params['filter'] && params['filter'].length > 0 && params['filter'][0].filter !== '') {
						query.andRaw(params['filter'][0].filter);
					}
				} else {
					if (params['filter'] && params['filter'].length > 0) {
						query.whereRaw(params['filter'][0].filter);
					}
				}

				query.executeQuery();
			},
			error => this.errorMessage = <any>error

		);

		this.entityService.data.subscribe(
			entities => {
				// this.selectedItems = [];
				this.transactions = entities;
				this.noDataInContent = this.transactions.length === 0;

				if (!this.noDataInContent) {
					this.transactions.forEach(t => t.Type = TransactionTypeNew[t.TransactionType]);
				}

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
		this.currentPage = params['page'] ? params['page'] : 1
		this.pageSize = params['pageSize'] ? params['pageSize'] : 10
	}

	getDateRangeFilter(filter: string, key: string) {
		let startDate = null;
		let endDate = moment().endOf('day');

		switch (filter) {
			case 'today':
				startDate = moment().startOf('day');
				break;
			case 'yesterday':
				startDate = moment().startOf('day').subtract(1, 'days');
				endDate = endDate.subtract(1, 'days');
				break;
			case 'lastweek':
				startDate = moment().startOf('week');
				break;
			case 'lastmonth':
				startDate = moment().startOf('month');
				break;
		}

		if (startDate && endDate) {
			return  `${key} gt ${startDate.toISOString()} and ${key} lt ${endDate.toISOString()}`
		}
		return ''
	}

	onInputChange(event) {
		this.isPromising = true;
		switch (event.searchType) {
			case 'refId':
				this.entityService.setSearch({ key: 'RefId', value: event.searchValue });
				break;
			case 'phone':
				this.entityService.setSearch({ key: 'MemberInfo/PhoneNumber', value: event.searchValue });
				break;
		}
	}

	toggleSortTitle(sort) {
		if (sort) {
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

	openContextMenu(e, transaction) {
		let content = {
			title: 'İŞLEMLER',
			// iconSet: "",
			data: [
				{ label: 'Test', icon: 'edit', action: 'edit'},
			]
		}

		this.tetherDialog.context(content, {
			target: e.target,
			attachment: 'top right',
			targetAttachment: 'top right',
			targetOffset: '-13px 0px'
		}).then(result => {
			if (result) {
				switch (result['action']) {
					case 'edit':
						break;
				}
			}
		}).catch(reason => console.log('dismiss reason : ', reason));
	}
}
