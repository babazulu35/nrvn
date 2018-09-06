import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AuthenticationService } from './authentication.service';
import { StoreService } from './../services/store.service';
import { BaseDataService } from "../classes/base-data-service";


@Injectable()
export class CrmAnonymousUserService extends BaseDataService {

	count: BehaviorSubject<number> = new BehaviorSubject(0);
	data: BehaviorSubject<any[]> = new BehaviorSubject([]);
	queryParams: Object = {
		protectedFilter: null,
		filter: [],
		sort: [],
		pageSize: 10,
		page: 1
	};
	queryParamSubject: BehaviorSubject<Object> = new BehaviorSubject(this.queryParams);

	constructor(
		http: Http,
		storeService: StoreService,
		authenticationService: AuthenticationService,
	){
		super(http, 'CrmAnonymousUser', storeService, authenticationService);
		this.setStoreAvailability(false);
	}

	getById(Id: number){
		let subs = this.executeGet(null, Id);
		subs.connect();
		return subs
	}

	gotoPage(params: Object, otherParams: Array<Object> = []){
		let page = params["page"] || 1,
			sort = params["sort"] ? (typeof params["sort"] == 'string' ? JSON.parse(params["sort"]) : params["sort"]) : null,
			filter = params["filter"] || null,
			pageSize = params["pageSize"] || 10,
			search = params["search"] || null,
			protectedFilter = params["protectedFilter"] || null;
		this.query({ pageSize: pageSize, page: page, sort: sort, filter: filter, search: search, protectedFilter: protectedFilter}, otherParams);
	}
}
