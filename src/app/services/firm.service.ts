import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Firm } from './../models/firm';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';
import { NotificationService } from './notification.service';

@Injectable()
export class FirmService extends BaseDataService{
	count : BehaviorSubject<number> =  new BehaviorSubject(0);
	data : BehaviorSubject<Firm[]> =  new BehaviorSubject([]);
	queryParams : Object = {filter: [], sort : [], pageSize: 10, page : 1};
	isLoading: BehaviorSubject<boolean> = new BehaviorSubject(true);
	queryParamSubject : BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);
	notificationService: NotificationService;
	constructor(http : Http, storeService : StoreService, authenticationService : AuthenticationService,notificationService: NotificationService){
		super(http, 'FFirm', storeService, authenticationService);
	}
	getRawData() : Firm[]{
		return this.storeService.getData('FFirm');
	}
	getData() : BehaviorSubject<Firm[]>{
		return this.data;
	}
	gotoPage(params : Object, otherParams : Array<Object> = []){
		let page = params["page"] || 0,
			sort = params["sort"] ? (typeof params["sort"] == 'string'  ? JSON.parse(params["sort"]) : params["sort"]) : null,
			filter = params["filter"] || null,
			pageSize = params["pageSize"] || 4;
		this.query({pageSize:pageSize, page:page,sort:sort, filter:filter}, otherParams);
	}
	changeLoading(isLoading: boolean){
		this.isLoading.next(isLoading);
	}
	create(event:Object){
		return this.save(event);
	  }

	updateParents(subFirmsList:any,parentId:number){
				let payload = [];
				subFirmsList.forEach(item => {
					let newSubFirms = {
						'Id': item['Id'],
						'ParentId': item['action'] == "add" ? parentId : null
					}
		
					payload.push(newSubFirms);
				});
				this.setCustomEndpoint('PatchAll');
				this.update(payload, null).subscribe(result => {
					this.reload();
				},err => {	
					this.notificationService.add({type:'danger',text:err});
				});
			}
		
}