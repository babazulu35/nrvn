import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';
import { BaseDataService } from "../classes/base-data-service";
import { ModelFactory } from './../classes/model-factory';


@Injectable()
export class ReportParentEventService extends  BaseDataService {

	count: BehaviorSubject<number> =  new BehaviorSubject(0);
	data: BehaviorSubject<any[]> =  new BehaviorSubject([]);
	queryParams: {parentEventId: number, platformId: number};
	queryParamSubject: BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);

	constructor(
		http : Http,
		storeService : StoreService,
		authenticationService : AuthenticationService,
	) {
		super(http, 'ReportParentEvent', storeService, authenticationService);
		this.setStoreAvailability(false);
	}

	fetch(params: Object, extraParams: Object = {}){
		let otherParams = [];
		otherParams.push({key: 'parentEventId', value: params['parentEventId']});
		otherParams.push({key: 'platformId', value: params['platformId']});

		Object.keys(extraParams).forEach(key=>{
			otherParams.push({key: key, value: extraParams[key]});
		});
		this.query({}, otherParams, true, false);
	}

	mapSingle(response: Response): Object {
		let payload = response.json();
		// let model = new ModelFactory("ReportParentEvent", payload);
		// let modelObject = model.getInstance();

		this.data.next(payload);
		return payload;
	}
}
