import { VariantPrice } from './../models/variant-price';
import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import { Observer} from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class VariantPriceService extends  BaseDataService {
  count : BehaviorSubject<number> =  new BehaviorSubject(0);
  data : BehaviorSubject<VariantPrice[]> =  new BehaviorSubject([]);
  queryParams : Object = {filter: [], sort : [], pageSize: 10, page : 1};
  queryParamSubject : BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);
  viewType : Object = {isCardViewActive: false, isListViewActive: true};
  constructor(http : Http, storeService : StoreService, authenticationService:AuthenticationService){
    super(http, 'PVariantPrice', storeService, authenticationService);
  }
  getRawData() : VariantPrice[]{
    return this.storeService.getData('PVariantPrice');
  }
  getData() : BehaviorSubject<VariantPrice[]>{
    return this.data;
  }
  create(event:Object){
    return this.save(event);
  }
  gotoPage(params : Object){
    let page = params["page"] || 0,
      sort = params["sort"] ? (typeof params["sort"] == 'string'  ? JSON.parse(params["sort"]) : params["sort"]) : null,
      filter = params["filter"] || null,
      pageSize = params["pageSize"] || 5;
    this.query({pageSize:pageSize, page:page,sort:sort, filter:filter});
  }
}
