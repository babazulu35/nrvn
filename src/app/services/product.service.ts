import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Product } from "../models/product";
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';
import { NotificationService } from './notification.service';

@Injectable()
export class ProductService extends  BaseDataService {
	count : BehaviorSubject<number> =  new BehaviorSubject(0);
	data : BehaviorSubject<Product[]> =  new BehaviorSubject([]);
	queryParams : Object = {filter: [], sort : [], pageSize: 10, page : 1};
	queryParamSubject : BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);
	viewType : { isCardViewActive: boolean, isListViewActive: boolean } = {isCardViewActive: false, isListViewActive: true};
    isLoading: BehaviorSubject<boolean> = new BehaviorSubject(true);

	notificationService: NotificationService;


	constructor(
		http : Http, 
		storeService : StoreService, 
		authenticationService : AuthenticationService,
		notificationService : NotificationService

	){
		super(http, 'PProduct', storeService, authenticationService);
	}
	getRawData() : Product[]{
		return this.storeService.getData('PProduct');
	}
	getData() : BehaviorSubject<Product[]>{
		return this.data;
	}
	create(product){
		return this.save(product);
	}
	gotoPage(params : Object){
		let page = params["page"] || 0,
			sort = params["sort"] ? (typeof params["sort"] == 'string'  ? JSON.parse(params["sort"]) : params["sort"]) : null,
			pageSize = params["pageSize"] || 5,
			filter = params["filter"] || null,
			search = params["search"] || null;
		this.query({pageSize:pageSize, page:page,sort:sort, filter: filter, search: search});
	}

	changeLoading(isLoading: boolean){
        this.isLoading.next(isLoading);
    }

    callBatchAction(selectedItems: Array<Object>, action: string){
        this.changeLoading(true);

        switch (action) {
            case "visibilityOn":

                this.updateStatus(selectedItems, true);
                break;

            case "visibilityOff":

                this.updateStatus(selectedItems, false);
                break;
        }
    }

    private updateStatus(selectedItems: Array<Object>, status: boolean){

        let payload: Array<Object> = [];

        selectedItems.forEach(item => {

            let newObject = {
                'Id': item['Id'],
                'IsActive': status,
            }

            item['IsActive'] = status;

            payload.push(newObject);
        });

        this.setCustomEndpoint('PatchAll');
        this.update(payload, null).subscribe(
            response => {
                this.notificationService.add({text:'Başarıyla güncellendi.', type:'success'});
                this.changeLoading(false);
                this.reload();
            },
            error => {
                this.notificationService.add({text:'Hata.', type:'danger'});
                this.changeLoading(false);
                this.reload();
            }
        );
    }

}
