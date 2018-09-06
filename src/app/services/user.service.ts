import { Injectable } from '@angular/core';
import { BaseDataService } from '../classes/base-data-service';
import { AuthenticationService } from './authentication.service';
import { Http, URLSearchParams } from '@angular/http';
import { StoreService } from './store.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SUser } from '../models/suser';

@Injectable()
export class UserService extends BaseDataService {

  count: BehaviorSubject<number> = new BehaviorSubject(0);
  data: BehaviorSubject<SUser[]> = new BehaviorSubject([]);
  queryParams: Object = { protectedFilter: null, filter: [], sort : [], pageSize: 10, page: 1 };
  queryParamSubject: BehaviorSubject<Object> = new BehaviorSubject(this.queryParams);

  constructor(
    http: Http,
    storeService: StoreService,
    authenticationService: AuthenticationService,
  ) {
    super(http, 'FFirm', storeService, authenticationService);
  }
  
  getRawData(): SUser[] {
    return this.storeService.getData('Role');
  }
  
  getData(): BehaviorSubject<SUser[]> {
    return this.data;
  }

  gotoPage(params: Object, otherParams: Array<Object> = []) {
    let page = params['page'] || 0,
        sort = params['sort'] ? (typeof params['sort'] === 'string' ? JSON.parse(params['sort']) : params['sort']) : null,
        filter = params['filter'] || null,
        pageSize = params['pageSize'] || 10,
        search = params['search'] || null,
        protectedFilter = params['protectedFilter'] || null;
    this.query(
      {
        pageSize: pageSize,
        page: page,
        sort: sort,
        filter: filter,
        search: search,
        protectedFilter: protectedFilter
      }, otherParams
    );
  }
}
