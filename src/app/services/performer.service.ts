import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Performer } from "../models/performer";
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class PerformerService extends  BaseDataService {
	count : BehaviorSubject<number> =  new BehaviorSubject(0);
	data : BehaviorSubject<Performer[]> =  new BehaviorSubject([]);
	queryParams : Object = {filter: [], sort : [], pageSize: 10, page : 1};
	queryParamSubject : BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);
	viewType : { isCardViewActive: boolean, isListViewActive: boolean } = {isCardViewActive: false, isListViewActive: true};
	constructor(http : Http, storeService : StoreService, authenticationService: AuthenticationService){
		super(http, 'EPerformer', storeService, authenticationService);
	}
	getRawData() : Performer[]{
		return this.storeService.getData('EPerformer');
	}
	getData() : BehaviorSubject<Performer[]>{
		return this.data;
	}
	create(performer){
		return this.save(performer);
	}
	gotoPage(params : Object){
		let page = params["page"] || 0,
			sort = params["sort"] ? (typeof params["sort"] == 'string'  ? JSON.parse(params["sort"]) : params["sort"]) : null,
			filter = params["filter"] || null,
			pageSize = params["pageSize"] || 5,
			search = params["search"] || null;
		this.query({pageSize:pageSize, page:page,sort:sort, filter:filter, search: search});
	}
}
