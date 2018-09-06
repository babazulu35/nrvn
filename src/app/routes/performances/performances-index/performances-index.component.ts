import { ContextMenuComponent } from './../../../modules/common-module/components/context-menu/context-menu.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit, Output, ComponentFactoryResolver, Injector, ComponentRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { PerformanceService } from './../../../services/performance.service';
import { EntityService } from '../../../services/entity.service';
import { Performance } from './../../../models/performance';
import { PerformanceStatus } from './../../../models/performance-status.enum';


@Component({
    selector: 'app-performances-index',
    templateUrl: './performances-index.component.html',
    styleUrls: ['./performances-index.component.scss'],
    entryComponents: [ContextMenuComponent]
})
export class PerformancesIndexComponent implements OnInit {

    errorMessage: any;
    subscription;

    performanceStatus = PerformanceStatus;
    performances: Performance[];
    count: number;

    pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
    pageSize: number = 10;
    currentPage: number = 1;

    noDataInContent:boolean = false;
    isLoading : boolean = false;

    selectedItems: Array<Object> = [];
    isAllSelected: boolean = false;

    actionButtons: Array<Object> = [
        { label: 'İptal Et', icon: 'do_not_disturb_alt', action: 'delete' },
        { label: 'Satışı Durdur', icon: 'visibility_off', action: 'visibilityOff'},
        { label: 'Satışa Devam Et', icon: 'visibility', action: 'visibilityOn'},
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        public tetherService: TetherDialog,
        public performanceService: PerformanceService,
        public entityService: EntityService,
    ) {
    }

    ngOnInit() {
        this.subscription = this.entityService.queryParamSubject.subscribe(
            params => {
                console.log(params);
                this.isLoading = true;
                this.updateLocalParams(params);

                this.entityService.setCustomEndpoint("GetAll");
                let query = this.entityService.fromEntity('EPerformance')
                .expand(['Localization'])
                .expand(['VenueTemplate', 'Venue', 'Localization'])
                .expand(['Event', 'Localization'])
                .take(params['pageSize'])
                .page(params['page']);

                let sort = params["sort"] ? (typeof params["sort"] == 'string'  ? JSON.parse(params["sort"]) : params["sort"]) : null;
                if(sort && sort[0]){
                    query.orderBy(sort[0]["sortBy"],sort[0]["type"])
                }
                if(params["search"]){
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
                this.performances = entities;

                this.isLoading = false;
                this.noDataInContent = this.performances.length == 0;
            },
            error => this.errorMessage = <any>error
        );

        this.entityService.getCount().subscribe(
            count => this.count = count,
            error => this.errorMessage = <any>error
        );

        this.performanceService.isLoading.subscribe(
            isLoading => {
                if (!isLoading) {
                    this.entityService.reload();
                }
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

    getRawData() {
        console.log('raw', this.performanceService.getRawData());
    }

    find() {
        this.performanceService.find(3).subscribe(
            event => { console.log(event.Code) }
        );
    }

    toggleSortTitle(sort) {
        this.entityService.setOrder(sort);
    }

    transistPage(page) {
        this.entityService.setPage(page);
    }

    changePageSize(pageSize) {
        this.entityService.setPageSize(pageSize);
    }

    selectAllItems(selectAll: boolean): void {
        if (selectAll && this.selectedItems.length < this.performances.length) {
            this.selectedItems = [];
            this.performances.forEach(item => {
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
            let selectedPerformance = this.selectedItems.filter(item => {
                return (event === item);
            })[0];
            this.selectedItems.splice(this.selectedItems.indexOf(selectedPerformance), 1);
        };

        this.actionButtons = [
            { label: 'Satışı Durdur', icon: 'visibility_off', action: 'visibilityOff'},
            { label: 'Satışa Devam Et', icon: 'visibility', action: 'visibilityOn'},
        ];
        
        let AddCancelButton = false;

        this.selectedItems.forEach(item => {
            if( item['Status'] != this.performanceStatus['Cancelled'] ) {
                AddCancelButton = true;
            }
        });

        if(AddCancelButton) {
            this.actionButtons.push({ label: 'İptal Et', icon: 'do_not_disturb_alt', action: 'delete' })
        }
    }

    get isMultiSelectionActive(): boolean {
        return this.selectedItems.length > 0;
    }

    callSelectedItemsAction(action: string) {
        this.performanceService.callBatchAction(this.selectedItems, action);
    }

    cardActionHandler(event) {
        let performance = event.data.model;
        switch(event.target) {
            case "select":
                this.selectItem(event.action, performance);
                break;
            case "goto":
                this.router.navigate([`/${event.data.entryType}`, performance.Id, 'performers']);
                break;
            case "context":
                let actionResult = event.action;
                if(actionResult) {
                    switch (actionResult['action']) {
                        case "edit":
                            if (actionResult['parameters'] && actionResult['parameters']['eventId']) {
                                this.router.navigate([`/${event.data.entryType}`, actionResult['parameters']['eventId'], 'edit']);
                            }
                            break;
                        case "visibilityOn":
                        case "visibilityOff":
                       // case "archive":
                        case "delete":
                            this.performanceService.callItemAction(performance, actionResult['action']);
                            break;
                    }
                }
                break;
        }
    }

    openContextMenu(event, performance){

        let content = {
            title: "İŞLEMLER",
            data: this.getItemActions(performance)
        }

        this.tetherService.context(content,
            {
                target: event.target,
                attachment: "top right",
                targetAttachment: "top right",
            }
        ).then(result => {
            if (result) {
                switch (result['action']) {
                    case "edit":
                        this.router.navigate(['/performance', performance.Id, 'edit']);
                        break;
                    case "visibilityOn":
                    case "visibilityOff":
                    case "archive":
                    case "delete":
                    case "copy":
                        this.performanceService.callItemAction(performance, result['action']);
                        break;
                }
            }
        }).catch(reason => console.log("dismiss reason : ", reason));
    }

    getItemActions(item) {
        let actions = [
            { label: 'Düzenle', icon: 'edit', action: "edit", group:"events"},
            { label: 'Kopyala', icon: 'layers', action: 'copy' },
        ]

        if(item.Status != this.performanceStatus['Cancelled']) {
            actions.push({ label: 'İptal Et', icon: 'do_not_disturb_alt', action: 'delete'})
        }

        if([this.performanceStatus['OnSale'], this.performanceStatus['SoldOut']].indexOf(item.Status) > -1) {
            actions.push({ label: 'Satışı Durdur', icon: 'visibility_off', action: 'visibilityOff'})
        } else if(item.Status == this.performanceStatus['Suspended']) {
            actions.push({ label: 'Satışa Devam Et', icon: 'visibility', action: 'visibilityOn'})
        }

        return actions;
    }
}
