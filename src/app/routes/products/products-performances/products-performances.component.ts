import { ContextMenuComponent } from './../../../modules/common-module/components/context-menu/context-menu.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit, ComponentRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../../models/product';
import { EntityService } from '../../../services/entity.service';
import { ProductService } from '../../../services/product.service';
import { PriceService } from '../../../services/price.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-products-performances',
    templateUrl: './products-performances.component.html',
    styleUrls: ['./products-performances.component.scss'],
    entryComponents: [ContextMenuComponent],
    providers: [ProductService]
})
export class ProductsPerformancesComponent implements OnInit {

    subscription;
    subscription2;
    errorMessage: any;

    products: Product[] = [];
    count: number;

    pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
    pageSize: number = 10;
    currentPage: number = 1;

    noDataInContent: boolean = false;
    isLoading: boolean = false;

    selectedItems: Array<Object> = [];
    isAllSelected: boolean = false;

    actionButtons: Array<Object> = [
        { label: 'Sil', icon: 'delete', action: 'delete' },
    ];

    constructor(
        private productService: ProductService,
        private entityService: EntityService,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        public tetherService: TetherDialog,
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService
    ) {
        this.entityService.setPage(this.currentPage);
        // productService.setQueryParams({ filter: [{ filter: 'IsBundle ne true' }, { filter: 'ProductType eq 1' }], sort: [], pageSize: 10, page: 1 });
    }

    
    ngOnInit() {
        this.subscription = this.entityService.queryParamSubject.subscribe(
            params => {
                this.isLoading = true;
                this.updateLocalParams(params);

                let sort = params["sort"] ? (typeof params["sort"] == 'string'  ? JSON.parse(params["sort"]) : params["sort"]) : null;
                let query = this.entityService.fromEntity('PProduct')
                // .expand(['Product', 'Localization'])
                // .expand(['Product', 'PriceLists'])
                // .expand(['Product', 'Currency'])
                // .expand(['Performance', 'Event', 'Localization'])
                .expand(['Performances', 'Performance', 'Localization'])
			    .expand(['Localization'])
			    .expand(['PriceLists', 'Localization'])
			    .expand(['Currency'])
			    .expand(['Performances', 'Performance', 'Event', 'Localization'])
                .take(params['pageSize'])
                .page(params['page']);

                if(sort && sort[0]){
                    query.orderBy(sort[0]["sortBy"],sort[0]["type"])
                }
                if(params["search"]){
                    query.whereRaw(`Performances/any(p:contains(p/Performance/Event/Localization/Name, '${params["search"]["value"]}'))`);
                }
                query.executeQuery();
            },
            error => this.errorMessage = <any>error
        );

        this.subscription2 = this.entityService.data.subscribe(
            entities => {
                this.products = [];
                entities.forEach(entity => {
                    let product = entity;

                    if(entity['Performances'] && entity['Performances'].length > 0){
                        product['Performance'] = entity['Performances'][0]['Performance'];
                        product['CategoryColorSeat'] = entity['Performances'][0]['CategoryColorSeat']
                    }
                    // ----------------- price and dates -----------------------
                    let priceLists = product['PriceLists'];
                    let price = null;
                    if(priceLists && priceLists.length > 0) {
                        priceLists.forEach(item => {
                            // TODO: get correct price
                            price = item;
                        });
                    }
                    if(price) {
                        product.CurrentPrice = price['NominalPrice'];
                        product.SalesBeginDate = price['BeginDate'];
                        product.SalesEndDate = price['EndDate'];
                    }
                    // ---------------------------------------------------------

                    this.products.push(product);                    
                    
                });

                this.selectedItems = [];
                this.isLoading = false;
                this.noDataInContent = this.products.length == 0;
            },
            error => this.errorMessage = <any>error
        );

        this.entityService.getCount().subscribe(
            count => { this.count = count; },
            error => this.errorMessage = <any>error
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.subscription2.unsubscribe();
        this.entityService.data.next([]);
        this.entityService.flushOrder(false);
    }

    updateLocalParams(params: Object = {}) {
        this.currentPage = params['page'] ? params['page'] : 0
        this.pageSize = params['pageSize'] ? params['pageSize'] : 10
    }

    transistPage(page) {
        console.log("page changed");
        this.entityService.setPage(page);
    }

    getRawData() {
        console.log('raw', this.productService.getRawData());
    }

    find() {
        this.entityService.find(3).subscribe(
            event => { console.log(event.Code) }
        );
    }

    toggleSortTitle(sort) {
        if(sort){
            this.entityService.setOrder(sort, true);
        }else{
            this.entityService.flushOrder();
        }
    }

    changePageSize(pageSize) {        
        this.entityService.setPageSize(pageSize);
    }

    callSelectedItemsAction(action: string) {
        console.log(action);
    }

    selectAllItems(selectAll: boolean): void {
        if (selectAll && this.selectedItems.length < this.products.length) {
            this.selectedItems = [];
            this.products.forEach(item => {
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
            let selectedProduct = this.selectedItems.filter(item => {
                return (event === item);
            })[0];
            this.selectedItems.splice(this.selectedItems.indexOf(selectedProduct), 1);
        }
    }

    get isMultiSelectionActive(): boolean {
        return this.selectedItems.length > 0;
    }

    openEventsContextMenu(e, product) {
        let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector)
        let instance: ContextMenuComponent = component.instance;

        // let iconPipe: GetIconPipe = new GetIconPipe();
        // let willChangeEventSaleStatus = event.status === 6 ? 2 : 6;
        // let willChangeEventPublishStatus = event.status === 8 ? 1 : 8;

        instance.actionEvent.subscribe(action => {
            console.log("instance event", action, product);
        });

        instance.data = [
            { label: 'Düzenle', icon: 'edit', action: 'edit'},
            { label: 'Kopyala', icon: 'layers', action: "copy"},
            { label: 'Sil', icon: 'delete', action: 'delete'}
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
                    case "edit":
                        this.router.navigate(['/product', product.Id, 'edit']);
                        break;
                    case "copy":
                        // this.productService.callItemAction(product, result['action']);
                        break;
                    case "delete":
                        this.isLoading = true;
                        this.productService.delete(product.Id).subscribe(
                            result =>{
                                this.notificationService.add({text:"Ürün silindi.", type:'success'});
                                this.isLoading = false;
                            },
                            result =>{
                                this.notificationService.add({text:result.Message, type:'danger'});
                                this.isLoading = false;
                            }
                        );
                        break;
                }
            }
        }).catch(reason => {
            console.log("dismiss reason : ", reason);
        });
    }
}
