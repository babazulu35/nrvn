import { AuthenticationService } from './authentication.service';
import { StoreService } from './store.service';
import { Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from './../classes/base-data-service';
import { Injectable } from '@angular/core';

@Injectable()
export class AccessIntegrationService extends  BaseDataService {
	count : BehaviorSubject<number> =  new BehaviorSubject(0);
	data : BehaviorSubject<any> =  new BehaviorSubject(null);
  
  constructor(http : Http, storeService : StoreService, authenticationService:AuthenticationService){
		super(http, 'AccessIntegration', storeService, authenticationService);
  }
  
  batchAddAccessCode(performanceId: any) {
    this.setCustomEndpoint("BatchAddAccessCode");
    let sub = this.postWithQueryParams({}, {performanceId: performanceId});
    sub.connect();
    return sub;
  }
}
