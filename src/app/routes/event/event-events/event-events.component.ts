import { ContextMenuComponent } from './../../../modules/common-module/components/context-menu/context-menu.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Component, ComponentFactory, ComponentRef, ComponentFactoryResolver, Injector, OnInit, Output, HostBinding, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { RelativeDatePipe } from './../../../pipes/relative-date.pipe';
import { GetIconPipe } from '../../../pipes/get-icon.pipe';
import { Event } from '../../../models/event';
import { EventStatus } from '../../../models/event-status.enum';
import { EventService } from '../../../services/event.service';
import { NotificationService } from '../../../services/notification.service';
import { AppSettingsService } from './../../../services/app-settings.service';
import { EntitySearchBoxComponent } from './../../../modules/common-module/common/entity-search-box/entity-search-box.component';

@Component({
	selector: 'app-event-events',
	templateUrl: './event-events.component.html',
	styleUrls: ['./event-events.component.scss'],
	providers: [EventService],
	entryComponents: [ContextMenuComponent, EntitySearchBoxComponent]
})
export class EventEventsComponent implements OnInit, OnDestroy {
	@HostBinding('class.or-event-events') true;

	subscription;
	routeSubscription;
	errorMessage: any;

	eventStatus = EventStatus;
	event: Event;
	events: Event[];
	count: number;
	noDataInContent: boolean = false;
	isLoading: boolean = true;

	isAllSelected: boolean = false;
	selectedItems: Array<Object> = [];

	pills: Array<any> = [
		{ text: 'TASLAK', filter: '(Status eq 4 or Status eq 10)', isActive: false, type: 'and' },
		{ text: 'SATIŞTA', filter: 'Status eq 2', isActive: false, type: 'and' },
		{ text: 'SATIŞTA DEĞİL', filter: '(Status eq 3 or Status eq 5 or Status eq 6)', isActive: false, type: 'and' },
		{ text: 'GEÇMİŞ', filter: 'Status eq 1', isActive: false, type: 'and' }
	];
	sortParams: Array<any> = [
		{ text: 'SEÇİNİZ', value: '' },
		{ text: 'ADA GÖRE[Z-A]', value: JSON.stringify({ sortBy: "Name", type: "desc" }) },
		{ text: 'ADA GÖRE[A-Z]', value: JSON.stringify({ sortBy: "Name", type: "asc" }) },
		{ text: 'TARİHE GÖRE[Önce Eski]', value: JSON.stringify({ sortBy: "BeginDate", type: "asc" }) },
		{ text: 'TARİHE GÖRE[Önce Yeni]', value: JSON.stringify({ sortBy: "BeginDate", type: "desc" }) },
		{ text: 'SATIŞ TARİHİNE GÖRE[Önce Eski]', value: JSON.stringify({ sortBy: "SalesBeginDate", type: "asc" }) },
		{ text: 'SATIŞ TARİHİNE GÖRE[Önce Yeni]', value: JSON.stringify({ sortBy: "SalesBeginDate", type: "desc" }) },
	];
	actionButtons: Array<Object> = [
		{ label: 'Aktive Et', icon: 'visibility', action: 'visibilityOn' },
		{ label: 'Deaktive Et/Durdur', icon: 'visibility_off', action: 'visibilityOff' },
		{ label: 'Arşivle', icon: 'archive', action: 'archive' },
		{ label: 'İptal Et', icon: 'do_not_disturb_alt', action: 'delete' }
	];

	pageID: number;
	pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
	pageSize: number = 10;
	currentPage: number = 1;

	relativeDate: RelativeDatePipe = new RelativeDatePipe();
	flags: { PublishDateFieldOn: boolean } = { PublishDateFieldOn: false };
	newPublishDate: string;

	params;

	constructor(
		public eventService: EventService,
		private router: Router,
		private route: ActivatedRoute,
		private resolver: ComponentFactoryResolver,
		private injector: Injector,
		private notificationService: NotificationService,
		public tetherService: TetherDialog,
		private appSettingsService: AppSettingsService
	) { }

	ngOnInit() {
		this.eventService.setCustomEndpoint('GetEventList');
		this.subscription = this.route.parent.params.subscribe(params => {
			this.pageID = params['id'];
			this.noDataInContent = false;
			this.isLoading = true;

			this.eventService.setQueryParams({ page: this.currentPage, pageSize: this.pageSize, protectedFilter: `ParentId eq ${this.pageID}` });
		});

		this.eventService.data.subscribe(res => {
			this.events = res;
			this.isLoading = false;
			if (this.events.length == 0) {
				this.noDataInContent = true;
			} else {
				this.event = this.events[0];
				this.noDataInContent = false;
			}
		});

		this.subscription = this.eventService.queryParamSubject.subscribe(
			params => {
				this.noDataInContent = false;
				this.isLoading = true;
				this.params = params;
				this.updateLocalParams(params);
				this.eventService.gotoPage(params);
			},
			error => this.errorMessage = <any>error
		);	

		this.eventService.getCount().subscribe(
			count => {
				this.count = count;
			},
			error => this.errorMessage = <any>error
		);
	}

	getChildEvents(){
		this.eventService.setCustomEndpoint('GetEventList');

		if(!this.subscription){
			this.subscription = this.eventService.queryParamSubject.subscribe(
				params => {
					this.noDataInContent = false;
					this.isLoading = true;
					this.params = params;
					this.updateLocalParams(params);
					this.eventService.gotoPage(params);
				},
				error => this.errorMessage = <any>error
			);
		}else{			
			this.isLoading = true;
			this.updateLocalParams(this.params);
			this.eventService.gotoPage(this.params);
		}		
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	updateLocalParams(params: Object = {}) {
		this.currentPage = params['page'] ? params['page'] : 0
		this.pageSize = params['pageSize'] ? params['pageSize'] : 10
	}

	onInputChange(event) {
		this.eventService.setSearch({ key: 'Name', value: event });
	}

	sortEvents(sort) {
		if (sort) {
			this.eventService.setOrder(sort, true);
		} else {
			this.eventService.flushOrder();
		}
	}

	filterEvents(pill) {
		this.eventService.setFilter(pill);
	}

	changeView(viewType) {
		this.eventService.setActiveViewType(viewType);
	}

	checkHandler(value, name: string, target: string = "event") {
		switch (name) {
			case 'PublishDateFieldOn':
				this.flags.PublishDateFieldOn = value;
				if (!value) {
					this.newPublishDate = null;
					this.savePublishDate();
				}
				break;
		}
	}

	dateChangeHandler(value, name) {
		switch (name) {
			case 'PublishDate':
				this.newPublishDate = value;
				break;
		}
	}

	savePublishDate() {
		if (this.newPublishDate != this.event.PublishDate) {
			this.event.set('PublishDate', this.newPublishDate);
			let save = this.eventService.update({ Id: this.event.Id, 'PublishDate': this.newPublishDate });
			save.subscribe(result => {
				this.notificationService.add({ text: 'Yayınlanma tarihi güncellendi', type: 'success' });
			})
		}
	}

	getDateParts(date) {
		let dateParts = this.relativeDate.transform([date], "split");
		return dateParts[0];
	}

	getRawData() {
		console.log('raw', this.eventService.getRawData());
	}

	transistPage(page) {
		this.eventService.setPage(page);
	}

	changePageSize(pageSize) {
		this.eventService.setPageSize(pageSize);
	}

	toggleSortTitle(sort) {
		this.eventService.setOrder(sort, true);
	}

	find() {
		this.eventService.find(3).subscribe(
			event => { console.log(event.Code) }
		);
	}

	get isMultiSelectionActive(): boolean {
		return this.selectedItems.length > 0;
	}

	selectAllItems(selectAll: boolean): void {
		if (selectAll && this.selectedItems.length < this.events.length) {
			this.selectedItems = [];
			this.events.forEach(item => {
				this.selectedItems.push(item);
			});
			this.isAllSelected = true;
		}
		if (!selectAll) {
			this.isAllSelected = false;
			this.selectedItems = [];
		}
	}

	selectItem(isSelected: boolean, event: Event): void {
		if (isSelected) {
			this.selectedItems.push(event);
		} else {
			let selectedEvent = this.selectedItems.filter(item => {
				return (event === item);
			})[0];
			this.selectedItems.splice(this.selectedItems.indexOf(selectedEvent), 1);
		}
	}

	callSelectedItemsAction(action: string) {
		this.eventService.callBatchAction(this.selectedItems, action);
	}

	cardActionHandler(event) {
		switch (event.target) {
			case "select":
				this.selectItem(event.action, event.data.model);
				break;
			case "context":

				let actionResult = event.action;
				if (actionResult) {
					switch (actionResult['action']) {
						case "editEvent":
							if (event.data.model && event.data.model.Id) {
								this.router.navigate(['/event', event.data.model.Id, 'edit']);
							}
							break;
						case "copy":
						case "visibilityOn":
						case "visibilityOff":
						case "archive":
						case "delete":
							// this.eventService.callItemAction(event.data.model, actionResult['action']);
							this.deleteItem(event.data.model);
						break;
					}
				}
				break;
			case "goto":
				this.router.navigate([`/${event.data.entryType}`, event.data.model.Id, 'performances']);
				break;
		}
	}

	openEventsContextMenu(e, event) {
		let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector)
		let instance: ContextMenuComponent = component.instance;

		instance.actionEvent.subscribe(action => {
			console.log("instance event", action);
		});

		instance.data = [
			{ label: 'Kaldır', icon: 'delete', action: 'delete'}
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
						this.router.navigate(['/event', event.Id, 'edit']);
						break;
					case "copy":
					case "visibilityOn":
					case "visibilityOff":
					case "archive":
					case "delete":
						// this.eventService.callItemAction(event, result['action']);
						this.deleteItem(event);
						break;
				}
			}
		}).catch(reason => {
			console.log("dismiss reason : ", reason);
		});
	}

	deleteItem(event){

		let jsonObj: Object = {
			ParentId : null
		}

		this.isLoading = true;

		this.eventService.flushCustomEndpoint();
		this.eventService.executePatch(jsonObj, event.Id).subscribe(
			result => {				
				this.getChildEvents();
			},
			error => {
				console.log("delete error = ", error);
				this.isLoading = false;

			});
	}
	
	entitySearchBox: EntitySearchBoxComponent;
	openSearchEventBox(e) {
		let component: ComponentRef<EntitySearchBoxComponent> = this.resolver.resolveComponentFactory(EntitySearchBoxComponent).create(this.injector);
		this.entitySearchBox = component.instance;
		this.entitySearchBox.allowAll = true;
		this.entitySearchBox.selectedEntitiyType = this.appSettingsService.getLocalSettings('entityTypes').find(item => item.name == "Event");
		this.entitySearchBox.hasSearchOptions = false;
		this.entitySearchBox.entityExpandList = [
			['Localization']
		]
		this.tetherService.modal(component, {
			escapeKeyIsActive: false,
		}).then(result => {
			let eventToAdd = result.params.entity;
			console.log("eventToAdd = ", eventToAdd);
			this.addEvent(eventToAdd);
		});
	}

	addEvent(event: Event) {
		let conflictedEvent = this.events.find(item => {
			return item.Id == event.Id;
		});

		if (conflictedEvent) {
			this.notificationService.add({ text: '<b>' + event.Localization["Name"] + '</b> daha önce eklendi!', type: 'danger' });
			return;
		}


		let jsonObj: Object = {
			ParentId: Number(this.pageID)
		}

		this.eventService.flushCustomEndpoint();
		this.eventService.executePatch(jsonObj, event.Id).subscribe(
			result => {
				this.getChildEvents();
			},
			error => {
				console.log("add error = ", error);
			},
			complete => {

			}
		);
	}
}
