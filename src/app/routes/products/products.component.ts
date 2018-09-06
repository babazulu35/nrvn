import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit, ElementRef, ViewChild, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderTitleService } from '../../services/header-title.service';
import { EntityService } from '../../services/entity.service';
import { PriceService } from '../../services/price.service';
import { Product } from '../../models/product';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss'],
    providers: [EntityService]
})
export class ProductsComponent implements OnInit {
    tabs: Array<any> = [
        { label: 'PERFORMANS ÜRÜNLERİ', routerLink: '/products/performances' },
        { label: 'BİRLEŞTİRİLMİŞ ÜRÜNLER', routerLink: '/products/bundles' }
    ];
    sortParams: Array<any> = [
        { text: 'ADA GÖRE', value: JSON.stringify({ sortBy: "Name", type: "desc" }) },
        { text: 'TARİHE GÖRE', value: JSON.stringify({ sortBy: "SalesBeginDate", type: "desc" }) }
    ];
    sort: Array<Object> = [];

    constructor(
        private headerTitleService: HeaderTitleService,
        private entityService: EntityService,
    ) {
        this.entityService.setCustomEndpoint('GetAll');
    }

    ngOnInit(): void {
        this.headerTitleService.setTitle('Ürünler');
        this.headerTitleService.setLink('/products');
    }
    onResize(event) {}
    ngAfterViewInit() {}

    sortProducts(sort) {
        if(sort){
            this.entityService.setOrder(sort, true);
        } else {
            this.entityService.flushOrder();
        }
    }

    filterProducts(pill) {
        this.entityService.setFilter(pill);
    }

    changeView(viewType) {
        this.entityService.setActiveViewType(viewType);
    }

    onInputChange(event) {
        this.entityService.setSearch({ key: 'Localization/Name', value: event })
    }
}
