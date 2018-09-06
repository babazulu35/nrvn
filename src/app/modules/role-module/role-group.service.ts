import { Injectable } from '@angular/core';
import { BaseDataService } from '../../classes/base-data-service';
import { Http, URLSearchParams } from '@angular/http';
import { StoreService } from './../../services/store.service';
import { AuthenticationService } from './../../services/authentication.service';
import { BehaviorSubject } from 'rxjs';
import { RoleGroup } from './models/role-group';

@Injectable()
export class RoleGroupService extends BaseDataService {
  count: BehaviorSubject<number> = new BehaviorSubject(0);
  data: BehaviorSubject<RoleGroup[]> = new BehaviorSubject([]);
  queryParams: Object = { protectedFilter: null, filter: [], sort : [], pageSize: 10, page: 1 };
  queryParamSubject: BehaviorSubject<Object> = new BehaviorSubject(this.queryParams); 
  constructor(
    http:Http,
    storeService: StoreService,
    authenticationService: AuthenticationService,
  ) { 
    super(http,'RoleGroup',storeService,authenticationService);    
  }

  getRawData(): RoleGroup[] {
    return this.storeService.getData('Group');
  }
  
  getData(): BehaviorSubject<RoleGroup[]> {
    return this.data;
  } 

}
