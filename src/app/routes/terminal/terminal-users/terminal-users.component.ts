import { Component, OnInit, Inject, Injector, ComponentFactoryResolver, OnDestroy, DoCheck } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { EntityService } from './../../../services/entity.service';
import { GenericDataService } from '../../../services/generic-data.service';
import { NotificationService } from '../../../services/notification.service';

import * as moment from 'moment';

@Component({
	selector: 'app-terminal-users',
	templateUrl: './terminal-users.component.html',
	styleUrls: ['./terminal-users.component.scss'],
	providers: [
		GenericDataService,
		{provide: 'entityServiceInstance1', useClass: EntityService },
	],
})
export class TerminalUsersComponent implements OnInit, OnDestroy {
	subscription;
	errorMessage: any;

	terminalId: number;
	terminal: any;
	terminalUsers = [];
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
		public tetherDialog: TetherDialog,
		private terminalEntityService: EntityService,
		private injector: Injector,
		private resolver: ComponentFactoryResolver,
		private route: ActivatedRoute,
		private terminalUserService: GenericDataService,
		private notificationService: NotificationService,
		@Inject('entityServiceInstance1') private entityService: EntityService,
	) {
		this.entityService.setCustomEndpoint('GetAll');
		this.terminalUserService.setEndpoint('CTerminalUser');
	}

	ngOnInit() {

		this.terminalId = this.route.snapshot.params['id'];
		this.isLoading = true;
		this.terminalEntityService.fromEntity('CTerminal')
								  .expand(['SalesSubChannels', 'SalesSubChannel'])
								  .where('Id', '=', this.terminalId)
								  .take(1).page(1)
								  .executeQuery();

		this.terminalEntityService.data.subscribe(
			response => {
				if (response && response.length && response.length > 0 ) {
					this.terminal = response[0];
					this.subscription = this.entityService.queryParamSubject.subscribe(
						params => {
							this.isPromising = true;
							this.updateLocalParams(params);

							let query = this.entityService.fromEntity('CTerminalUser')
								.where('TerminalId', '=', this.terminalId)
								.and('EndDate', '<', (new Date()).toJSON())
								.expand(['User'])
								.take(params['pageSize'])
								.page(params['page']);

							let sort = params['sort'] ? (typeof params['sort'] === 'string'  ? JSON.parse(params['sort']) : params['sort']) : null;
							if (sort && sort[0]) {
								query.orderBy(sort[0]['sortBy'], sort[0]['type']);
							}
							if (params['search']) {
								query.search(params['search']['key'], params['search']['value']);
							}
							if (params['filter'] && params['filter'].length > 0 && params['filter'][0].filter) {
								query.whereRaw(`TerminalId eq ${this.terminalId} and ${params['filter'][0].filter}`);
							}

							query.executeQuery();
						}, error => this.errorMessage = <any>error

					);

				}
			},
			error => this.errorMessage = <any>error
		);

		this.entityService.data.subscribe(
			response => {
				if (response) {
					this.terminalUsers = response;

					this.noDataInContent = this.terminalUsers.length === 0;

					if (!this.noDataInContent) {
						this.prepareTerminalUsers();
					}

					this.isPromising = false;
					this.isLoading = false;
				}
			},
			error => this.errorMessage = <any>error
		);

		this.entityService.getCount().subscribe(
			count => this.count = count,
			error => this.errorMessage = <any>error
		);
	}

	private prepareTerminalUsers() {
		if (this.terminal && this.terminal.SalesSubChannels
						  && this.terminal.SalesSubChannels.length > 0
						  && this.terminalUsers
						  && this.terminalUsers.length > 0) {
			let salesSubChannels = this.terminal.SalesSubChannels.filter(s => s.IsActive);
			if (salesSubChannels && salesSubChannels.length > 0) {
				this.terminalUsers.forEach( terminalUser => {
					let salesSubChannel = salesSubChannels.filter(s => s.BeginDate <= terminalUser.BeginDate);
					salesSubChannel = salesSubChannel.filter(s => s.EndDate >= terminalUser.EndDate);
					if (salesSubChannel && salesSubChannel.length
										&& salesSubChannel.length > 0
										&& salesSubChannel[0]
										&& salesSubChannel[0].SalesSubChannel
										&& salesSubChannel[0].SalesSubChannel.Name) {
						terminalUser['SalesSubChannelName'] = salesSubChannel[0].SalesSubChannel.Name;
					}
				});
			}
		}
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	updateLocalParams(params: Object = {}) {
		this.currentPage = params['page'] ? params['page'] : 1
		this.pageSize = params['pageSize'] ? params['pageSize'] : 10
	}

	onInputChange(event) {
		this.entityService.setSearch({ key: 'User/FirstName', value: event });
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

}
