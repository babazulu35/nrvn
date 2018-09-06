import { Injectable } from '@angular/core';
import { BaseDataService } from '../../classes/base-data-service';
import { Http, URLSearchParams } from '@angular/http';
import { StoreService } from './../../services/store.service';
import { AuthenticationService } from './../../services/authentication.service';
import { BehaviorSubject } from 'rxjs';
import { UserGroup } from './models/user-group';

@Injectable()
export class UserGroupService extends BaseDataService {
  count: BehaviorSubject<number> = new BehaviorSubject(0);
  data: BehaviorSubject<UserGroup[]> = new BehaviorSubject([]);
  queryParams: Object = { protectedFilter: null, filter: [], sort : [], pageSize: 10, page: 1 };
  queryParamSubject: BehaviorSubject<Object> = new BehaviorSubject(this.queryParams);  

  constructor(
    http: Http,
    storeService: StoreService,
    authenticationService: AuthenticationService,    
  ) {
    super(http,'UserGroup',storeService,authenticationService);
   }

   getRawData(): UserGroup[] {
    return this.storeService.getData('Group');
  }
  
  getData(): BehaviorSubject<UserGroup[]> {
    return this.data;
}   

}
