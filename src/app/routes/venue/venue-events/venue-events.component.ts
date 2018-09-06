import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { TitleSwitcherComponent } from './../../../modules/common-module/components/title-switcher/title-switcher.component';
import { ContextMenuComponent } from './../../../modules/common-module/components/context-menu/context-menu.component';
import { Component, ComponentFactory, ComponentRef, ComponentFactoryResolver, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../models/event';
import { EventStatus } from '../../../models/event-status.enum';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import { RelativeDatePipe } from './../../../pipes/relative-date.pipe';
import { Roles } from '../../../models/roles';

@Component({
    selector: 'app-venue-events',
    templateUrl: './venue-events.component.html',
    styleUrls: ['./venue-events.component.scss'],
    providers: [EventService],
    entryComponents:[ContextMenuComponent]
})
export class VenueEventsComponent implements OnInit {
    @ViewChild(TitleSwitcherComponent) contentTitle: TitleSwitcherComponent;

    errorMessage: any;
    subscription;

    eventStatus = EventStatus;
    events: Event[];
    count: number;

    pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
    pageSize: number = 10;
    currentPage: number = 1;

    selectedItems: Array<Object> = [];
    isAllSelected: boolean = false;

    noDataInContent: boolean = false;
    isLoading: boolean = false;

    now: Date = new Date();
    venueId: number;
    relativeDate: RelativeDatePipe = new RelativeDatePipe();

    pills: Array<any> = [
        { text: 'TASLAK', filter: '(Status eq 4 or Status eq 10)', isActive: false, type: 'and' },
        { text: 'SATIŞTA', filter: 'Status eq 2', isActive: false, type: 'and' },
        { text: 'SATIŞTA DEĞİL', filter: '(Status eq 3 or Status eq 5 or Status eq 6)', isActive: false, type: 'and' },
        { text: 'GEÇMİŞ', filter: 'Status eq 1', isActive: false, type: 'and' }
    ];
    actionButtons: Array<Object> = [
        { label: 'Kopyala', icon: 'layers', action: 'copy', role: Roles.VENUE_LIST},
        { label: 'Gizle', icon: 'visibility', action: 'visibilityOn', role: Roles.VENUE_LIST },
        { label: 'Göster', icon: 'visibility_off', action: 'visibilityOff', role: Roles.VENUE_LIST },
        //{ label: 'Arşivle', icon: 'archive', action: 'archive' },
        { label: 'İptal Et', icon: 'do_not_disturb_alt', action: 'delete', role: Roles.VENUE_LIST },
    ];

    constructor(
        public eventService: EventService,
        private router: Router,
        private route: ActivatedRoute,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        public tetherService: TetherDialog,
    ) { }

    ngOnInit() {
        this.eventService.setCustomEndpoint('GetEventList');

        this.subscription = this.route.parent.params.subscribe(params => {
            this.venueId = +params['id'];
            this.isLoading = true;

            this.eventService.setQueryParams({page: this.currentPage, pageSize: this.pageSize});
        });

        this.subscription = this.eventService.queryParamSubject.subscribe(
            params => {
                this.noDataInContent = false;
                this.isLoading = true;
                this.updateLocalParams(params);
                this.eventService.gotoPage(params, [{ key: 'VenueId', value: this.venueId }]);
            },
            error => this.errorMessage = <any>error
        );

        this.eventService.data.subscribe(res => {
            this.selectedItems = [];
            this.events = res;
            this.isLoading = false;
            if(this.events.length == 0) {
               this.noDataInContent = true;
            } else {
                this.noDataInContent = false;
            }
        });

        this.eventService.getCount().subscribe(
            count => {
                this.count = count;
            },
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

    ngAfterViewInit() {}

    onContentTitleSearchHandler(value) {
        let self = this;
        setTimeout(function () {
            if (value == "Arena") {
                self.contentTitle.finderSearchResults = Observable.of([
                    {
                        title: "ARAMA SONUÇLARI",
                        list: [
                            {
                                id: "01",
                                icon: "event",
                                title: "Volkswagen Arena",
                                description: null
                            }
                        ]
                    }]);
            } else {
                self.contentTitle.finderSearchResults = Observable.of([]);
            }
        }, 500);
    }

    onContentTitleChangedHandler(result) {
        console.log("new event : ", result);
    }

    transistPage(page) {
        this.eventService.setPage(page);
    }

    toggleSortTitle(sort) {
        this.eventService.setOrder(sort);
    }

    changePageSize(pageSize) {
        this.eventService.setPageSize(pageSize);
    }

    sortEvents(sort) {
        this.eventService.setOrder(sort);
    }

    filterEvents(pill) {
        this.eventService.setFilter(pill);
    }

    onInputChange(event) {
        this.eventService.setSearch({ key: 'Name', value: event });
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

    get isMultiSelectionActive(): boolean {
        return this.selectedItems.length > 0;
    }

    changeView(viewType) {
        this.eventService.setActiveViewType(viewType);
    }

    callSelectedItemsAction(action: string) {
        console.log(action);
    }

    cardActionHandler(event) {
        switch(event.target) {
            case "select":
                this.selectItem(event.action, event.data.model);
                break;
            case "goto":
                this.router.navigate([`/${event.data.entryType}`, event.data.model.Id, `${event.action}`]);
                break;
            case "context":
                let actionResult = event['action'];
                let actionData = event['data'];
                if(!actionResult || !actionData) { break; }

                switch(actionResult['action']) {
                    case "editEvent":
                        this.router.navigate([`/${actionData.entryType}`, actionData.model.Id, 'edit']);
                        break;
                    case "copy":
                    case "visibilityOn":
                    case "visibilityOff":
                    case "archive":
                    case "delete":
                        this.eventService.callItemAction(actionData.model, actionResult['action']);
                        break;
                }
                break;
        }
    }

    openEventsContextMenu(e, event) {
        let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector)
        let instance: ContextMenuComponent = component.instance;

        // let iconPipe: GetIconPipe = new GetIconPipe();
        // let willChangeEventSaleStatus = event.status === 6 ? 2 : 6;
        // let willChangeEventPublishStatus = event.status === 8 ? 1 : 8;

        instance.actionEvent.subscribe(action => {
            console.log("instance event", action);
        });

        instance.data = [
            { label: 'Düzenle', icon: 'edit', action: "editEvent", group:"events"},
            { label: 'Aktive Et', icon: 'visibility', action: 'visibilityOn'},
            { label: 'Durdur', icon: 'visibility_off', action: 'visibilityOff'},
            { label: 'Arşivle', icon: 'archive', action: 'archive'},
            { label: 'İptal Et', icon: 'do_not_disturb_alt', action: 'delete'},
            { label: 'Kopyala', icon: 'layers', action: 'copy' },
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
                        this.eventService.callItemAction(event, result['action']);
                        break;
                }
            }
        }).catch(reason => {
            console.log("dismiss reason : ", reason);
        });
    }

    getDateParts(date){
        let dateParts = this.relativeDate.transform([date],"split");
        return dateParts[0];
    }
}
