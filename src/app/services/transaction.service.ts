import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { BaseDataService } from "../classes/base-data-service";
import { AuthenticationService } from './authentication.service';
import { StoreService } from './../services/store.service';


@Injectable()
export class TransactionService extends BaseDataService {

	count: BehaviorSubject<number> = new BehaviorSubject(0);
	data: BehaviorSubject<any[]> = new BehaviorSubject([]);
	queryParams: Object = { filter: [], sort: [], pageSize: 10, page: 1 };
	queryParamSubject: BehaviorSubject<Object> = new BehaviorSubject(this.queryParams);

	constructor(http: Http, storeService: StoreService, authenticationService: AuthenticationService) {
		super(http, 'PPTransaction', storeService, authenticationService);
	}

	getRawData(): any[] {
		return this.storeService.getData('PPTransaction');
	}

	getData(): BehaviorSubject<any[]> {
		return this.data;
	}

	gotoPage(params: Object, otherParams: Array<Object> = []){
		let page = params["page"] || 0,
			sort = params["sort"] ? (typeof params["sort"] == 'string' ? JSON.parse(params["sort"]) : params["sort"]) : null,
			filter = params["filter"] || null,
			pageSize = params["pageSize"] || 10,
			search = params["search"] || null,
			protectedFilter = params["protectedFilter"] || null;

		this.query({
			pageSize: pageSize, page: page,
			sort: sort,
			filter: filter,
			search: search,
			protectedFilter: protectedFilter
		}, otherParams);
	}
}

