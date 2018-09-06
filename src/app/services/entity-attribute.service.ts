import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { EntityAttribute } from "../models/entity-attribute";
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';


@Injectable()
export class EntityAttributeService extends BaseDataService{

	count : BehaviorSubject<number> =  new BehaviorSubject(0);
	data : BehaviorSubject<EntityAttribute[]> =  new BehaviorSubject([]);
	queryParams : Object = {filter: [], sort : [], pageSize: 10, page : 1};
	queryParamSubject : BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);
	constructor(http : Http, storeService : StoreService, authenticationService : AuthenticationService){
		super(http, 'AEntityAttribute', storeService, authenticationService);
	}
	getRawData() : EntityAttribute[]{
		return this.storeService.getData('AEntityAttribute');
	}
	getData() : BehaviorSubject<EntityAttribute[]>{
		return this.data;
	}
	create(town){
		return this.save(town);
	}
	gotoPage(params : Object){
		let page = params["page"] || 0,
			sort = params["sort"] ? (typeof params["sort"] == 'string'  ? JSON.parse(params["sort"]) : params["sort"]) : null,
			filter = params["filter"] || null,
			pageSize = params["pageSize"] || 4;
		this.query({pageSize:pageSize, page:page,sort:sort, filter:filter});
	}

}
