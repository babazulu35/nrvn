import { ContextMenuComponent } from './../../../modules/common-module/components/context-menu/context-menu.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Component, ComponentFactory, ComponentRef, ComponentFactoryResolver, Injector, OnInit, Output, HostBinding } from '@angular/core';
import { Event } from '../../../models/event';
import { EventStatus } from '../../../models/event-status.enum';
import { Observable } from 'rxjs/Observable';
import { EventService } from '../../../services/event.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RelativeDatePipe } from './../../../pipes/relative-date.pipe';

@Component({
    selector: 'app-events-single-performance',
    templateUrl: './events-single-performance.component.html',
    styleUrls: ['./events-single-performance.component.scss'],
    entryComponents: [ContextMenuComponent],
})
export class EventsSinglePerformanceComponent implements OnInit {
    @HostBinding('class.or-events-single-performance') true;

    isListViewActive: boolean = true;
    isCardViewActive: boolean = false;

    subscription;
    errorMessage: any;

    eventStatus = EventStatus;q
    events: Event[];
    count: number;

    pageSizes: Array<Object> = [{text: '10', value: 10}, {text: '20', value: 20}];
    pageSize: number = 10;
    currentPage: number = 1;

    noDataInContent: boolean = false;
    isLoading: boolean = false;

    relativeDate: RelativeDatePipe = new RelativeDatePipe();

    selectedItems: Array<Object> = [];
    isAllSelected: boolean = false;
    actionButtons: Array<Object> = [
        { label: 'İptal Et', icon: 'do_not_disturb_alt', action: 'delete' },
    ];

    constructor(
        public eventService: EventService,
        private router: Router,
        private route: ActivatedRoute,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        public tetherService: TetherDialog,
    ) {
        eventService.flushFilter();
        eventService.setQueryParams({ protectedFilter: 'PerformanceCount eq 1', sort: [], pageSize: this.pageSize, page: 1 });
    }

    ngOnInit() {
        this.eventService.data.subscribe(
            events => {
                this.selectedItems = [];
                this.events = events;
                this.isLoading = false;
                if(this.events.length == 0) {
                   this.noDataInContent = true;
                } else {
                    this.noDataInContent = false;
                }
            },
            error => this.errorMessage = <any>error
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
            error => this.errorMessage = <any>error
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
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
            event => { console.log(event.Code) }
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
        } else {
            let selectedEvent = this.selectedItems.filter(item => {
                return (event === item);
            })[0];
            this.selectedItems.splice(this.selectedItems.indexOf(selectedEvent), 1);
        }
        this.setMultiItemsAction();
    }

    get isMultiSelectionActive(): boolean {
        return this.selectedItems.length > 0;
    }

    cardActionHandler(event) {
        console.log("card action handler : ", event);
        switch(event.target) {
            case "select":
                this.selectItem(event.action, event.data.model);
            break;
            case "context":
                let actionResult = event.action;
                if(actionResult) {
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
                            this.eventService.callItemAction(event.data.model, actionResult['action']);
                        break;
                    }
                }
            break;
        }
    }

    openEventsContextMenu(e, event) {
        let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector)
        let instance: ContextMenuComponent = component.instance;

        // let iconPipe: GetIconPipe = new GetIconPipe();

        instance.actionEvent.subscribe(action => {
            console.log("instance event", action);
        });

        instance.data = instance.data = this.getItemActions(event);

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

    getItemActions(item) {
        let actions = [
            { label: 'Düzenle', icon: 'edit', action: "editEvent", group:"events"},
            { label: 'Kopyala', icon: 'layers', action: 'copy' },
            { label: 'İptal Et', icon: 'do_not_disturb_alt', action: 'delete'},
        ]

        if([this.eventStatus['OnSale'], this.eventStatus['SoldOut']].indexOf(item.Status) > -1) {
            actions.push({ label: 'Satışı Durdur', icon: 'visibility_off', action: 'visibilityOff'})
        } else if(item.Status == this.eventStatus['Suspended']) {
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
            if([this.eventStatus['OnSale'], this.eventStatus['SoldOut']].indexOf(item['Status']) > -1) {
                AddSuspend = true;
            } else if(item['Status'] == this.eventStatus['Suspended']) {
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

    getDateParts(date){
        let dateParts = this.relativeDate.transform([date],"split");
        return dateParts[0];
    }
}
