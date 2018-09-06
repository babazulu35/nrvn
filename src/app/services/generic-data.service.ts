import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class GenericDataService extends  BaseDataService {
	count : BehaviorSubject<number> =  new BehaviorSubject(0);
	data : BehaviorSubject<Event[]> =  new BehaviorSubject([]);
	queryParams : Object = {filter: [], sort : [], pageSize: 20, page : 1};
	queryParamSubject : BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);
	viewType : Object = {isCardViewActive: false, isListViewActive: true};
	constructor(http : Http, storeService : StoreService, authenticationService : AuthenticationService){
		super(http, '', storeService, authenticationService);
	}
	getData() : BehaviorSubject<Event[]>{
		return this.data;
	}
	create(event){
		return this.save(event);
	}
	gotoPage(params : Object){
		let page = params["page"] || 0,
			sort = params["sort"] ? (typeof params["sort"] == 'string'  ? JSON.parse(params["sort"]) : params["sort"]) : null,
			filter = params["filter"] || null,
			pageSize = params["pageSize"] || 20;
		this.query({pageSize:pageSize, page:page,sort:sort, filter:filter});
	}
}
