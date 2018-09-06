import { BaseDataService } from '../classes/base-data-service';
import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { StoreService } from './store.service';
import { AuthenticationService } from './authentication.service';
import { BehaviorSubject } from 'rxjs';
import { Group } from '../models/group';

@Injectable()
export class GroupService extends BaseDataService {
  count: BehaviorSubject<number> = new BehaviorSubject(0);
  data: BehaviorSubject<Group[]> = new BehaviorSubject([]);
  queryParams: Object = { protectedFilter: null, filter: [], sort : [], pageSize: 10, page: 1 };
  queryParamSubject: BehaviorSubject<Object> = new BehaviorSubject(this.queryParams);
  groupData: BehaviorSubject<Group[]> = new BehaviorSubject([]);
  mode: BehaviorSubject<any> = new BehaviorSubject({isCreate:false});

  constructor(
    http: Http,
    storeService: StoreService,
    authenticationService: AuthenticationService,
  ) {
    super(http, 'Group', storeService, authenticationService);
  }

  getRawData(): Group[] {
    return this.storeService.getData('Group');
  }
  
  getData(): BehaviorSubject<Group[]> {
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

  
  groupDataDetail(groupData:Group[]) {
    this.groupData.next(groupData);
  }


  roleStatusUpdate(payload:Group,id:number):Promise<any> {
    return new Promise((resolve,reject) => {
       
        if(payload && id  ) {
          this.flushCustomEndpoint();
          this.executePatch(payload,id).subscribe(statusResult => {
            this.reload();
            resolve(payload);
          },err => {
            reject({message:err,payload:payload});
          })            
        }
        else {
          reject({message:'Obje veya Id hatalı'});
        }
    });

  }
}
