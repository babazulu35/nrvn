import { Injectable, ComponentRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { Http } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';


@Injectable()
export class TerminalService extends BaseDataService {
	count: BehaviorSubject<number> = new BehaviorSubject(0);
	data: BehaviorSubject<any> = new BehaviorSubject([]);
	queryParams: Object = {protectedFilter : null, filter: [], sort: [], pageSize: 10, page: 1 };
	queryParamSubject: BehaviorSubject<Object> = new BehaviorSubject(this.queryParams);
	viewType: { isCardViewActive: boolean, isListViewActive: boolean } = { isCardViewActive: false, isListViewActive: true };

	constructor(
		http: Http,
		storeService: StoreService,
		authenticationService: AuthenticationService,
	) {
		super(http, 'CTerminal', storeService, authenticationService);
	}

	gotoPage(params : Object, otherParams : Array<Object> = []){
		let page = params["page"] || 0,
			sort = params["sort"] ? (typeof params["sort"] == 'string' ? JSON.parse(params["sort"]) : params["sort"]) : null,
			filter = params["filter"] || null,
			pageSize = params["pageSize"] || 20,
			search = params["search"] || null,
			protectedFilter = params["protectedFilter"] || null;
		this.query({ pageSize: pageSize, page: page, sort: sort, filter: filter, search: search, protectedFilter: protectedFilter}, otherParams);
	}
}
