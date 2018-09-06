import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Template } from "../models/template";
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class TemplateService extends  BaseDataService{
	count : BehaviorSubject<number> =  new BehaviorSubject(0);
	data : BehaviorSubject<Template[]> =  new BehaviorSubject([]);
	queryParams : Object = {filter: [], sort : [], pageSize: 10, page : 1};
	queryParamSubject : BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);
	viewType : Object = {isCardViewActive: false, isListViewActive: true};
	constructor(http : Http, storeService : StoreService, authenticationService : AuthenticationService){
		super(http, 'VTemplate', storeService, authenticationService);
	}
	getRawData() : Template[]{
		return this.storeService.getData('VTemplate');
	}
	getData() : BehaviorSubject<Template[]>{
		return this.data;
	}
	create(template){
		return this.save(template);
	}
	gotoPage(params: Object, otherParams: Array<Object> = []){
		let page = params["page"] || 0,
			sort = params["sort"] ? (typeof params["sort"] == 'string' ? JSON.parse(params["sort"]) : params["sort"]) : null,
			filter = params["filter"] || null,
			pageSize = params["pageSize"] || 4,
			search = params["search"] || null,
			protectedFilter = params["protectedFilter"] || null;
		this.query({ pageSize: pageSize, page: page, sort: sort, filter: filter, search: search, protectedFilter: protectedFilter}, otherParams);
	}
}
