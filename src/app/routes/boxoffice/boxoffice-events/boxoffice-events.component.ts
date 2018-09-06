import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BoxofficeService } from './../../../services/boxoffice.service';
import { MainLoaderService } from './../../../services/main-loader.service';
import { Component, OnInit, Input, Inject } from '@angular/core';
import { EntityService } from '../../../services/entity.service';
import { ShoppingCartService } from '../../../services/shopping-cart.service';
import { EventStatus } from '../../../models/event-status.enum';
import * as moment from 'moment';

@Component({
	selector: 'app-boxoffice-events',
	templateUrl: './boxoffice-events.component.html',
	styleUrls: ['./boxoffice-events.component.scss'],
	providers: [EntityService],
})
export class BoxofficeEventsComponent implements OnInit {
	errorMessage;
	subscription;

	eventStatus = EventStatus;
	results: Object[];
	count: number;
	pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
	pageSize = 10;
	currentPage = 0;

	isPromising = false;
	isLoading = false;
	noDataInContent = false;

	canQuickSaleRedirect: boolean;
	showPills = true;

	pills: Array <any> = [
		{text: 'BUGÜN', type: 'date', filter: moment().utcOffset(0).startOf('day').toISOString(), isActive: true},
		{text:'YARIN', type: 'date', filter: moment().utcOffset(0).add(1,'days').startOf('day').toISOString(), isActive: false},
		{text: 'TÜMÜ', type: 'date', filter: '', isActive: false},
	];

	selectedPill: any = null;

	constructor(
		private boxofficeService: BoxofficeService,
		private entityService: EntityService,
		private mainLoaderService: MainLoaderService,
		private router: Router
	) {
		this.entityService.setPageSize(this.pageSize);
	}

	ngOnInit() {
		if(this.pills && this.pills.length) this.filterEvents(this.pills[0]);
		this.mainLoaderService.updateLoading(false);
		this.entityService.setCustomEndpoint('GetAll');
		this.subscription = this.entityService.queryParamSubject.subscribe(params => {
			
		this.isLoading = true;
		
		this.updateLocalParams(params);
		this.eventsFeed(params);
		}, error =>  this.errorMessage = <any>error);

		this.entityService.data.subscribe(entities => {
			this.results = entities;
			
			this.isPromising = false;
			this.isLoading = false;
			this.noDataInContent = this.results.length === 0;
		}, error =>  this.errorMessage = <any>error);

		this.entityService.count.subscribe(count => {
			this.count = count;
		}, error => this.errorMessage = <any>error);
	}

	updateLocalParams(params: Object = {}) {
		this.currentPage = params['page'] ? params['page'] : 0;
		this.pageSize = params['pageSize'] ? params['pageSize'] : 10;
	}

	changePageSize(size) {
		this.entityService.setPageSize(size);
	}

	transistPage(page) {
		this.entityService.setPage(page);
	}

	filterEvents(pill) {
		this.entityService.setFilter(pill);
	}

	typeChanged(e) {
		if (e && e.searchType === 'date') {
			this.showPills = false;
			this.entityService.flushFilter(false);
		} else if (!this.showPills) {
			this.showPills = true;
			this.entityService.flushFilter(false);
			let p = this.pills.find(pi => pi.isActive);
			if (p) {
				this.filterEvents(p);
			}
		} else {
			this.showPills = true;
		}
		this.entityService.setSearch({ key: 'Localization/Name', value: '' });
	}

	search(event) {
		this.isPromising = true;
		switch (event.searchType) {
			case 'event':
				if (event.searchValue) {
					this.entityService.setSearch({ key: 'Localization/Name', value: event.searchValue });
				} else {
					this.entityService.setSearch({ key: 'Localization/Name', value: '' });
				}
				break;
			case 'venue':
				if (event.searchValue) {
					this.entityService.setSearch({
						key: '',
						value: `Performances/any(a:contains(a/VenueTemplate/Venue/Localization/Name,'${event.searchValue}'))`
					});
				} else {
					this.entityService.setSearch({ key: 'Localization/Name', value: '' });
				}
				break;
			case 'date':
				if (event.searchValue) {
					this.entityService.setFilter({
						type: 'date',
						filter: event.searchValue
					});
				} else {
					this.entityService.setSearch({ key: 'Localization/Name', value: '' });
				}
				break;
		}
	}

	eventsFeed(params) {
		let query = this.entityService.fromEntity('EEvent')
									  .whereRaw(`(Status eq cast('${this.eventStatus.OnSale}', Nirvana.Shared.Enums.EventStatus) or Status eq cast('${this.eventStatus.Suspended}', Nirvana.Shared.Enums.EventStatus) or Status eq cast('${this.eventStatus.SoldOut}', Nirvana.Shared.Enums.EventStatus))`);

		if (params['filter'] && params['filter'].length > 0
							 && params['filter'][0]
							 && params['filter'][0].filter
							 && params['filter'][0].filter.length > 0) {
			if (params['filter'][0].type === 'date') {
				let dateFilter = params['filter'][0].filter;
				let dateFilterMoment = moment(dateFilter);
				let start = dateFilterMoment.startOf('day').toISOString();
				let end = dateFilterMoment.endOf('day').toISOString();
				query.andRaw(`
					(
						(Performances/any(p:p/Date ge ${start} and p/Date le ${end})) 
							or 
						(Performances/any(p:p/Date le ${end} and p/EndDate ge ${start}))
					)
				`);
			} else {
				query.andRaw(params['filter'][0].filter);
			}
		}
		query.expand(['Localization'])
			.expand(['Performances', 'VenueTemplate', 'Venue', 'Localization'])
			.expand(['Performances', 'VenueTemplate', 'Venue', 'Town', 'City'])
			.select(['Localization', 'Performances', 'Status', 'Images', 'ChildEventCount', 'Id'])
			.selectOnExpand(['VenueTemplate', 'Date', 'Id'], 1);
		if (params['search']) {
			query.search(params['search']['key'], params['search']['value'])
		}
		query.take(this.pageSize).page(this.currentPage)
		.orderBy('Localization/Name', 'asc')
		.executeQuery();
	}

	cardActionHandler(event) {
		if (event.target = 'context') {
			switch (event.action.action) {
				case 'addToQuickSale':
					this.boxofficeService.quickSaleEvent.next(event.data.model);
				break;
			}
		}
	}
}
