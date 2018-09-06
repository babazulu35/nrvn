import { Component, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PerformanceService } from '../../../services/performance.service';
import { EventService } from '../../../services/event.service';
import { EntityService } from '../../../services/entity.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
	selector: 'app-event-performances',
	templateUrl: './event-performances.component.html',
	styleUrls: ['./event-performances.component.scss'],
	providers:[PerformanceService, EventService, EntityService]
})
export class EventPerformancesComponent implements OnInit {
	@HostBinding('class.or-event-performances') true;

	subscription;
	errorMessage: any;

	performances;
	query = null;

	// Pagination
	count: number;
	pageSize = 10;
	currentPage = 1;
	pageSizes: Array<Object> = [{text: '10', value: 10}, {text: '20', value: 20}];

	pageID: number;
	isLoading = false;
	noDataInContent = false;

	flags: {PublishDateFieldOn: boolean} = {
		PublishDateFieldOn: false
	};
	newPublishDate: string;
	event;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private performanceService: PerformanceService,
		private eventService: EventService,
		private entityService: EntityService,
		private notificationService: NotificationService
	) {
		this.entityService.setCustomEndpoint('GetAll');
	}

	ngOnInit() {
		this.subscription = this.route.parent.params.subscribe(params => {
			let param = +params['id'];
			this.pageID = param;
			this.isLoading = true;

			this.eventService.find(this.pageID, true);
			this.eventService.data.subscribe(
				events => {
					if(events && events[0]){
						this.event = events[0];

						this.flags.PublishDateFieldOn = this.event.PublishDate != null;

						this.query = this.entityService.fromEntity('EPerformance')
						if (this.event.ChildEventCount > 0) {
							this.query.where('Event/ParentId', '=', this.pageID);
						} else {
							this.query.where('EventId', '=', this.pageID);
						}
						this.entityService.queryParamSubject.next(this.entityService.queryParamSubject.getValue());
					}
				}
			);
		});

		this.subscription = this.entityService.queryParamSubject.subscribe(
			params => {
				if (!this.query) {return;}

				this.isLoading = true;
				this.updateLocalParams(params);

				this.query.expand(['Localization'])
				.take(params['pageSize'])
				.page(params['page']);

				let sort = params["sort"] ? (typeof params["sort"] == 'string'  ? JSON.parse(params["sort"]) : params["sort"]) : null;
				if(sort && sort[0]){
					this.query.orderBy(sort[0]["sortBy"],sort[0]["type"])
				}
				if(params["search"]){
					this.query.search(params["search"]["key"], params["search"]["value"]);
				}
				this.query.executeQuery();
			},
			error => this.errorMessage = <any>error
		);

		this.entityService.data.subscribe(response => {
			this.performances = response;

			this.isLoading = false;
			this.noDataInContent = this.performances.length == 0;
		});

		this.entityService.count.subscribe(response => {
			this.count = response;
		});

	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	updateLocalParams(params: Object = {}) {
		this.currentPage = params['page'] ? params['page'] : 0
		this.pageSize = params['pageSize'] ? params['pageSize'] : 10
	}

	transistPage(page){
		this.entityService.setPage(page);
	}

	changePageSize(pageSize) {
		this.entityService.setPageSize(pageSize);
	}

	cardActionHandler(event) {
		switch(event.target) {
			case "select":
				// this.selectItem(event.action, event.data.model);
				break;
			case "context":
				let actionResult = event['action'];
				let actionData = event['data'];
				if(!actionResult || !actionData) { break; }

				switch(actionResult['action']) {
					case "edit":
						this.router.navigate([`/${actionData.entryType}`, actionData.model.Id, 'edit']);
						break;
					case "visibilityOn":
					case "visibilityOff":
					case "archive":
					case "delete":
						this.performanceService.callItemAction(actionData.model, actionResult['action']);
						break;
				}
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
		if(this.newPublishDate != this.event.PublishDate){
			this.event.set('PublishDate', this.newPublishDate);
			let save = this.eventService.update({Id: this.event.Id, 'PublishDate' : this.newPublishDate});
			save.subscribe(result=>{
				this.notificationService.add({text: 'Yayınlanma tarihi güncellendi', type:'success'});
			})
		}
	}
}
