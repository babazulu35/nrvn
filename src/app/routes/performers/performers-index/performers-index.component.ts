import { ContextMenuComponent } from './../../../modules/common-module/components/context-menu/context-menu.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Component, ComponentFactory, ComponentRef, ComponentFactoryResolver, Injector, OnInit, Output, HostBinding } from '@angular/core';
import { Performer } from './../../../models/performer';
import { Observable } from 'rxjs/Observable';
import { PerformerService } from '../../../services/performer.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Roles } from '../../../models/roles';

@Component({
    selector: 'app-performers-index',
    templateUrl: './performers-index.component.html',
    styleUrls: ['./performers-index.component.scss'],
    entryComponents: [ContextMenuComponent],
})
export class PerformersIndexComponent implements OnInit {
    @HostBinding('class.app-performers-list-view') true;

    isListViewActive: boolean = true;
    isCardViewActive: boolean = false;

    sub;
    errorMessage: any;
    subscription;

    performers: Performer[];
    count: number;

    pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
    pageSize: number = 10;
    currentPage: number = 1;

    noDataInContent: boolean = false;
    isLoading: boolean = false;

    selectedItems: Array<Object> = [];
    isAllSelected: boolean = false;

    actionButtons: Array<Object> = [
        { label: 'Düzenle', icon: 'edit', action: 'edit'},
    ];

    constructor(
        public performerService: PerformerService,
        private router: Router,
        private route: ActivatedRoute,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        public tetherService: TetherDialog,
    ) {
    }

    ngOnInit() {
        this.performerService.setCustomEndpoint('GetPerformerList');
        this.subscription = this.performerService.queryParamSubject.subscribe(
            params => {
                this.noDataInContent = false;
                this.isLoading = true;
                this.updateLocalParams(params);
                this.performerService.gotoPage(params);
            },
            error => this.errorMessage = <any>error
        );

        this.performerService.data.subscribe(
            performers => {
                this.selectedItems = [];
                this.performers = performers;
                this.isLoading = false;
                if(this.performers.length == 0) {
                    this.noDataInContent = true;
                } else{
                    this.noDataInContent = false;
                }
            },
            error => this.errorMessage = <any>error
        );

        this.performerService.getCount().subscribe(
            count => {
                this.count = count;
            },
            error => this.errorMessage = <any>error
        );

        this.sub = this.route.queryParams.subscribe(params => {
            if (params["refresh"] == 'true') {
                this.performerService.gotoPage({ page: this.performerService.queryParams["page"], pageSize: this.performerService.queryParams["pageSize"] });
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    updateLocalParams(params: Object = {}) {
        this.currentPage = params['page'] ? params['page'] : 0
        this.pageSize = params['pageSize'] ? params['pageSize'] : 10
    }

    transistPage(page) {
        this.performerService.setPage(page);
    }

    getRawData() {
        console.log('raw', this.performerService.getRawData());
    }

    find() {
        this.performerService.find(3).subscribe(
            event => { console.log(event.Code) }
        );
    }

    toggleSortTitle(sort) {
        this.performerService.setOrder(sort);
    }

    changePageSize(pageSize) {
        this.performerService.setPageSize(pageSize);
    }

    callSelectedItemsAction(action: string) {
        console.log(action);
    }

    selectAllItems(selectAll: boolean): void {
        if (selectAll && this.selectedItems.length < this.performers.length) {
            this.selectedItems = [];
            this.performers.forEach(item => {
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
            let selectedPerformer = this.selectedItems.filter(item => {
                return (event === item);
            })[0];
            this.selectedItems.splice(this.selectedItems.indexOf(selectedPerformer), 1);
        }
    }

    get isMultiSelectionActive(): boolean {
        return this.selectedItems.length > 0;
    }

    cardActionHandler(action) {
        switch (action['target']) {
            case "goto":
                this.router.navigate(['/performers'], {queryParams: {action: action['action'], performerId: action['data']['model']['Id']}});
                break;
        }
    }

    openPerformerContextMenu(e, performer) {
        let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector)
        let instance: ContextMenuComponent = component.instance;

        instance.actionEvent.subscribe(action => {
            //this.performerService[action.action](performer, action.parameters);
        });

        // let willChangePerformerActivity = performer.IsActive ? false : true;
        // let activityIcon = performer.IsActive ? 'visibility_off' : 'visibility';

        instance.data = [
            /*{ action: "changeActivity", icon : activityIcon, parameters: willChangePerformerActivity, label: performer.IsActive ? 'Deaktive Et' : 'Aktive Et' },
            { action: "delete", icon: 'delete', parameters: { performerId: performer.Id }, label: 'Sil' },*/
            { action: "editEvent", icon: 'edit', parameters: { performerId: performer.Id }, label: 'Düzenle' },
        ]

        this.tetherService.context(component,
            {
                target: e.target,
                attachment: "top right",
                targetAttachment: "top right",
            }).then(result => {
                if (result) {
                    switch (result['action']) {
                        case "editEvent":
                            if (result['parameters'] && result['parameters']['performerId']) {
                                this.router.navigate(['/performers'], { queryParams: { action: 'edit', performerId: result['parameters']['performerId'] } });
                            }
                            break;
                    }
                }
            }).catch(reason => {
                console.log("dismiss reason : ", reason);
            });
    }
}
