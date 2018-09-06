import { Component, OnInit } from '@angular/core';
import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { EntityService } from './../../services/entity.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-terminals',
	templateUrl: './terminals.component.html',
	styleUrls: ['./terminals.component.scss'],
	providers: [EntityService],
})
export class TerminalsComponent implements OnInit {

	subscription;
	errorMessage: any;

	terminals = [];
	count: number;
	noDataInContent: boolean = false;
	isLoading: boolean = false;
	isPromising: boolean = false;

	selectedItems: Array<Object> = [];
	isAllSelected: boolean = false;

	showPagination: boolean = true;
	pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
	pageSize: number = 10;
	currentPage: number = 1;
	now = new Date().toJSON();

	pills: Array<any> = [
		{ text: 'TÜMÜ', filter: "", isActive: false },
		{ text: 'AKTİF', filter: "IsActive eq true", isActive: false },
		{ text: 'PASİF', filter: "IsActive eq false", isActive: false },
		{
			text: 'ATANMAMIŞ', filter: `SalesSubChannels/all(s:s eq null) 
									 or SalesSubChannels/all(s:s/IsActive eq false) 
									 or SalesSubChannels/all(s:s/EndDate lt ${this.now}) 
									 or SalesSubChannels/all(s:s/BeginDate gt ${this.now})`, isActive: false
		},
	];

	constructor(
		public tetherDialog: TetherDialog,
		private entityService: EntityService,
		private router: Router,
	) {
		this.entityService.setCustomEndpoint('GetAll');
	}

	ngOnInit() {

		this.subscription = this.entityService.queryParamSubject.subscribe(
			params => {
				this.isLoading = true;
				this.updateLocalParams(params);

				let query = this.entityService.fromEntity('CTerminal')
					.expand(['SalesSubChannels', 'SalesSubChannel'])
					.take(params['pageSize'])
					.page(params['page']);

				let sort = params["sort"] ? (typeof params["sort"] == 'string' ? JSON.parse(params["sort"]) : params["sort"]) : null;
				if (sort && sort[0]) {
					query.orderBy(sort[0]["sortBy"], sort[0]["type"])
				}
				if (params["search"]) {
					query.search(params["search"]["key"], params["search"]["value"]);
				}
				if (params['filter'] && params['filter'].length > 0) {
					query.whereRaw(params['filter'][0].filter);
				}

				query.executeQuery();
			},
			error => this.errorMessage = <any>error

		);

		this.entityService.data.subscribe(
			entities => {
				this.selectedItems = [];

				this.noDataInContent = (entities && (entities.length === 0));
				this.terminals = [];

				if (entities && entities.length > 0) {
					let salesSubChannelName = '-';
					let beginDate = null;
					let endDate = null;
					entities.forEach(entity => {
						if (entity.SalesSubChannels) {
							let salesSubChannels = entity.SalesSubChannels.filter(s => {
								if (s.IsActive && (Date.parse(s.BeginDate) < (new Date()).getTime()) && (Date.parse(s.EndDate) > (new Date()).getTime())) {
									return true;
								}
							});

							// Terminale bağlı aktif ve geçerlilik süresi uygun tek terminal olacağı teminatı verildi -- MT
							if (salesSubChannels.length > 0) {
								salesSubChannelName = salesSubChannels[0].SalesSubChannel.Name;
								beginDate = salesSubChannels[0].BeginDate;
								endDate = salesSubChannels[0].EndDate;
							}
						}

						this.terminals.push({
							Id: entity.Id,
							IpAddress: entity.IpAddress,
							IsActive: entity.IsActive,
							Name: entity.Name,
							SalesSubChannelName: salesSubChannelName,
							BeginDate: beginDate,
							EndDate: endDate
						});

						salesSubChannelName = '-';
						beginDate = null;
						endDate = null;
					});
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

	onInputChange(event) {
		this.entityService.setSearch({ key: 'Name', value: event });
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

	selectAllItems(selectAll: boolean): void {
		if (selectAll && this.selectedItems.length < this.terminals.length) {
			this.selectedItems = [];
			this.terminals.forEach(item => {
				this.selectedItems.push(item);
			});
			this.isAllSelected = true;
		}
		if (!selectAll) {
			this.isAllSelected = false;
			this.selectedItems = [];
		}
	}

	selectItem(isSelected: boolean, transaction: any): void {
		if (isSelected) {
			this.selectedItems.push(transaction);
		} else {
			let selectedTerminal = this.selectedItems.filter(item => {
				return (transaction === item);
			})[0];
			this.selectedItems.splice(this.selectedItems.indexOf(selectedTerminal), 1);
		}
	}

	openContextMenu(e, transaction) {
		let content = {
			title: "İŞLEMLER",
			// iconSet: "",
			data: [
				{ label: 'Test', icon: 'edit', action: 'edit' },
			]
		}

		this.tetherDialog.context(content, {
			target: e.target,
			attachment: "top right",
			targetAttachment: "top right",
			targetOffset: '-13px 0px'
		}).then(result => {
			if (result) {
				switch (result['action']) {
					case "edit":
						break;
				}
			}
		}).catch(reason => console.log("dismiss reason : ", reason));
	}

	goToTerminal(terminal) {
		this.router.navigate(['/terminal', terminal.Id, 'edit']);
	}
	

}
