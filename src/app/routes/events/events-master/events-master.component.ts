import { ContextMenuComponent } from './../../../modules/common-module/components/context-menu/context-menu.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Component, ComponentFactory, ComponentRef, ComponentFactoryResolver, Injector, OnInit, Output, HostBinding, OnDestroy } from '@angular/core';
import { Event } from '../../../models/event';
import { EventStatus } from '../../../models/event-status.enum';
import { Observable } from 'rxjs/Observable';
import { EventService } from '../../../services/event.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RelativeDatePipe } from './../../../pipes/relative-date.pipe';
import { HeaderTitleService } from '../../../services/header-title.service';

@Component({
    selector: 'app-events-master',
    templateUrl: './events-master.component.html',
    styleUrls: ['./events-master.component.scss'],
    entryComponents: [ ContextMenuComponent ],
    providers: [EventService],
})
export class EventsMasterComponent implements OnInit, OnDestroy {
	@HostBinding('class.or-events-master') true;

    isListViewActive = true;
    isCardViewActive = false;

    subscription;
    errorMessage: any;

    eventStatus = EventStatus;
    events: Event[];
    count: number;

    pageSizes: Array<Object> = [{text: '10', value: 10}, {text: '20', value: 20}];
    pageSize = 10;
    currentPage = 1;

    noDataInContent = false;
    isLoading = false;

    relativeDate: RelativeDatePipe = new RelativeDatePipe();

    selectedItems: Array<Object> = [];
    isAllSelected = false;
    actionButtons: Array<Object> = [
        { label: 'İptal Et', icon: 'do_not_disturb_alt', action: 'delete'},
    ];

    selectedPill = null;
    pills: Array<any> = [
        { text: 'TASLAK', filter: '(Status eq 4 or Status eq 10)', isActive: false, type: 'and' },
        { text: 'SATIŞTA', filter: 'Status eq 2', isActive: false, type: 'and' },
        { text: 'SATIŞTA DEĞİL', filter: '(Status eq 3 or Status eq 5 or Status eq 6)', isActive: false, type: 'and' },
        { text: 'GEÇMİŞ', filter: 'Status eq 1', isActive: false, type: 'and' }
    ];

    tabs: Array<any> = [
        { label: 'TÜMÜ', routerLink: '/events/index' },
    ];

    sortParams: Array<any> = [
        {text: 'SEÇİNİZ', value: ''},
        { text: 'ADA GÖRE[Z-A]', value: JSON.stringify({ sortBy: 'Name', type: 'desc' }) },
        { text: 'ADA GÖRE[A-Z]', value: JSON.stringify({ sortBy: 'Name', type: 'asc' }) },
        { text: 'TARİHE GÖRE[Önce Eski]', value: JSON.stringify({ sortBy: 'BeginDate', type: 'asc' }) },
        { text: 'TARİHE GÖRE[Önce Yeni]', value: JSON.stringify({ sortBy: 'BeginDate', type: 'desc' }) },
    ];

	constructor(
		public eventService: EventService,
		private router: Router,
		private route: ActivatedRoute,
		private resolver: ComponentFactoryResolver,
		private injector: Injector,
        public tetherService: TetherDialog,
        private headerTitleService: HeaderTitleService,
	) {
        eventService.flushFilter();
        this.eventService.setCustomEndpoint('GetEventList');
		eventService.setQueryParams({protectedFilter: 'ChildEventCount gt 0', sort : [], pageSize: this.pageSize, page : this.currentPage});
	}

	ngOnInit() {
        this.headerTitleService.setTitle('Etkinlik Grupları');
        this.headerTitleService.setLink('/event-groups');

		this.eventService.data.subscribe(
			events => {
				this.selectedItems = [];
				this.events = events;
				this.isLoading = false;
                if (this.events.length === 0) {
                   this.noDataInContent = true;
                } else {
                    this.noDataInContent = false;
                }
			},
			error =>  this.errorMessage = <any>error
		);

		this.subscription = this.eventService.queryParamSubject.subscribe(
			params => {
				this.noDataInContent = false;
				this.isLoading = true;
                this.updateLocalParams(params);
				this.eventService.gotoPage(params);
			},
			error => this.errorMessage = <any>error
		);

        this.eventService.getCount().subscribe(
            count => {
                this.count = count;
            },
            error =>  this.errorMessage = <any>error
        );
    }

	ngOnDestroy() {
		this.subscription.unsubscribe();
    }

    onInputChange(event) {
        this.eventService.setSearch({ key: 'Name', value: event });
    }

    filterEvents(pill) {
        this.eventService.setFilter(pill);
    }

    sortEvents(sort) {
        if (sort) {
            this.eventService.setOrder(sort, true);
        } else {
            this.eventService.flushOrder();
        }
    }

    changeView(viewType) {
        this.eventService.setActiveViewType(viewType);
    }

    updateLocalParams(params: Object = {}) {
        this.currentPage = params['page'] ? params['page'] : 0
        this.pageSize = params['pageSize'] ? params['pageSize'] : 10
    }

	transistPage(page) {
		this.eventService.setPage(page);
	}

	getRawData() {
		console.log('raw', this.eventService.getRawData());
	}

	find() {
		this.eventService.find(3).subscribe(
			event => {console.log(event.Code)}
		);
	}

	toggleSortTitle(sort) {
		this.eventService.setOrder(sort);
	}

	changePageSize(pageSize) {
		this.eventService.setPageSize(pageSize);
	}

    callSelectedItemsAction(action: string) {
        this.eventService.callBatchAction(this.selectedItems, action);
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
        this.setMultiItemsAction();
	}

	selectItem(isSelected: boolean, event: Event): void {
		if (isSelected) {
			this.selectedItems.push(event);
		}else {
			let selectedEvent = this.selectedItems.filter(item => {
				return (event === item);
			})[0];
			this.selectedItems.splice(this.selectedItems.indexOf(selectedEvent), 1);
		}
        this.setMultiItemsAction();
	}

    get isMultiSelectionActive(): boolean{
        return this.selectedItems.length > 0;
    }

    cardActionHandler(event) {
        switch (event.target) {
            case 'select':
                this.selectItem(event.action, event.data.model);
            break;
            case 'context':
                let actionResult = event.action;
                if (actionResult) {
                    switch (actionResult['action']) {
                        case 'editEvent':
                            if (event.data.model && event.data.model.Id) {
                                this.router.navigate(['/event', event.data.model.Id, 'edit']);
                            }
                        break;
                        case 'copy':
                        case 'visibilityOn':
                        case 'visibilityOff':
                        case 'archive':
                        case 'delete':
                            this.eventService.callItemAction(event.data.model, actionResult['action']);
                        break;
                    }
                }
            break;
            case 'goto':
                this.router.navigate(['/event', event.data.model.Id]);
            break;
        }
    }

    openContextMenu(e, event) {
        let context = {
            title: 'İŞLEMLER',
            data: this.getItemActions(event)
        }

        this.tetherService.context(context,
            {
                target: e.target,
                attachment: 'top right',
                targetAttachment: 'top right',
                targetOffset: '-13px 0px'
            }
        ).then(result => {
            if (result) {
                switch (result['action']) {
                    case 'editEvent':
                        this.router.navigate(['/event', event.Id, 'edit']);
                        break;
                    case 'copy':
                    case 'visibilityOn':
                    case 'visibilityOff':
                    case 'archive':
                    case 'delete':
                        this.eventService.callItemAction(event, result['action']);
                        break;
                }
            }
        }).catch(reason => {
            console.log('dismiss reason : ', reason);
        });
    }

    getItemActions(item) {
        let actions = [
            { label: 'Düzenle', icon: 'edit', action: 'editEvent', group: 'events'},
            { label: 'Kopyala', icon: 'layers', action: 'copy' },
            { label: 'İptal Et', icon: 'do_not_disturb_alt', action: 'delete'},
        ]

        if ([this.eventStatus['OnSale'], this.eventStatus['SoldOut']].indexOf(item.Status) > -1) {
            actions.push({ label: 'Satışı Durdur', icon: 'visibility_off', action: 'visibilityOff'})
        } else if (item.Status == this.eventStatus['Suspended']) {
            actions.push({ label: 'Satışa Devam Et', icon: 'visibility', action: 'visibilityOn'})
        }

        return actions;
    }

    setMultiItemsAction() {
        this.actionButtons = [
            { label: 'İptal Et', icon: 'do_not_disturb_alt', action: 'delete' },
        ];

        let AddSuspend = false;
        let AddUnSuspend = false;
        let addNone = false;

        this.selectedItems.forEach(item => {
            if ([this.eventStatus['OnSale'], this.eventStatus['SoldOut']].indexOf(item['Status']) > -1) {
                AddSuspend = true;
            } else if (item['Status'] === this.eventStatus['Suspended']) {
                AddUnSuspend = true;
            } else {
                addNone = true;
            }
        });

        if (AddSuspend && !AddUnSuspend && !addNone) {
            this.actionButtons.push({ label: 'Satışı Durdur', icon: 'visibility_off', action: 'visibilityOff' })
        }

        if (AddUnSuspend && !AddSuspend && !addNone) {
            this.actionButtons.push({ label: 'Satışa Devam Et', icon: 'visibility', action: 'visibilityOn' })
        }
    }

    getDateParts(date) {
        let dateParts = this.relativeDate.transform([date], 'split');
        return dateParts[0];
    }
}
