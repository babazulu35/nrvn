import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';


@Injectable()
export class EntityService extends BaseDataService {

  	count: BehaviorSubject<number> = new BehaviorSubject(0);
    data: BehaviorSubject<any> = new BehaviorSubject([]);
    queryParams: Object = {protectedFilter : null, filter: [], sort: [], pageSize: 10, page: 1 };
    queryParamSubject: BehaviorSubject<Object> = new BehaviorSubject(this.queryParams);
    viewType: { isCardViewActive: boolean, isListViewActive: boolean } = { isCardViewActive: false, isListViewActive: true };
    constructor(http: Http, storeService: StoreService, authenticationService: AuthenticationService) {
        super(http, 'Entity', storeService, authenticationService);
        this.setStoreAvailability(false);
    }

}
