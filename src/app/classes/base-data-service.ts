import { environment } from '../../environments/environment';
import { Http, Response, Headers, RequestOptions, RequestMethod, URLSearchParams } from "@angular/http";
import { ModelFactory } from './model-factory';
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './../services/authentication.service';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Injectable, Inject} from '@angular/core';
import { QueryManager } from './query-manager';
import { NotificationService } from './../services/notification.service';

export class BaseDataService extends QueryManager{
    private boxOfficeUrl: string;
    private backOfficeUrl: string;
    private apiUrl: string;
    private token: string;
    private channelCode: string = 'Web';
    private firmCode: string = 'MAS';
    private endpoint: string;
    private http;
    private object;
    private isStorePushAvailable: boolean = true;
    protected headers : Headers = new Headers();
    notificationService : NotificationService;
    baseUrl: string;
    count;
    data;
    storeService: StoreService;
    queryParams;
    queryParamSubject;
    viewType;
    authenticationService: AuthenticationService;
    loginSubscription: any;

    constructor(http: Http, endpoint: string, storeService: StoreService, authenticationService: AuthenticationService, notificationService ?: NotificationService) {
        super();
        this.boxOfficeUrl = environment.api.boxoffice + '/' + environment.api.path;
        this.backOfficeUrl = environment.api.host + '/' + environment.api.path;
        this.baseUrl = environment.api.host + '/' + environment.api.path;
        this.http = http;
        this.endpoint = endpoint;
        this.storeService = storeService;
        this.apiUrl = this.baseUrl + '/' + this.endpoint;
        this.authenticationService = authenticationService;

        this.loginSubscription = this.authenticationService.isLoggedIn$.subscribe( isLogin => {
            if(isLogin) {
                this.notificationService = notificationService;
                this.token = this.authenticationService.getToken();
                this.firmCode = authenticationService.getUserFirmCode();
                if(authenticationService.getUserChannelCode()){
                    this.channelCode = authenticationService.getUserChannelCode();
                }
                this.setHeader('Content-Type', 'application/json');
                this.setHeader('Accept-Language', 'tr-tr');
                if (this.token) {
                    this.setHeader('Authorization', 'bearer ' + this.token);
                } else {
                    Observable.throw('Token Error');
                }
            }else{
                Observable.throw('Login Error');
            }
        });
    }

    ngOnDestroy() {
        if(this.loginSubscription) this.loginSubscription.unsubscribe();
    }

    query(params: any, otherParams: Array<Object> = [], hasSingleRecord: boolean = false, pageVariables: boolean = true): Observable<any[]> {
        let queryParams = new URLSearchParams();
        if(!params) params = {};
        if (pageVariables) {
            let pageSize = (params.pageSize) ? params.pageSize : 5;
            let page = params.page === undefined || (params.page <= 0) ? 0 : params.page - 1;
            queryParams.append('Page', String(page));
            queryParams.append('Pagesize', String(pageSize));
        }

        if (params.sort && params.sort.length > 0) {
            let sort: string = '';
            params.sort = (params.sort.length === undefined) ? [params.sort] : params.sort;
            for (let item of params.sort) {
                sort += item.sortBy + ' ' + item.type + ',';
            };
            queryParams.append('$orderby', sort.slice(0, -1));
        }

        let filter: string = '';
        if (params.filter && params.filter.length > 0) {
            for (let item of params.filter) {
                let filterType = item.type ? item.type : 'and';
                filter += item.filter + ' ' + filterType + ' ';
            };
        }
        let protectedFilter: string = '';
        if (params.protectedFilter) {
            filter += params.protectedFilter + ' and';
        }

        let search: string = '';
        if (params.search && params.search.value && params.search.value.length > 0) {
            search += " contains(" + params.search.key + ",'" + params.search.value + "')";
        }
        if (filter || search) {
            let filters = (filter && search) ? filter + search : ((filter && !search) ? filter.slice(0, -4) : search);
            queryParams.append('$filter', filters);
        }
        for (let param of otherParams) {
            queryParams.append(param["key"], param["value"]);
        }
        let subscription;
        if(params && params.method && params.method == "POST") {
            subscription = this.executePost(null, queryParams, null, true).publishReplay(1).refCount().publish();
        }else {
            subscription = this.executeGet(queryParams, null, hasSingleRecord)
        }
        return subscription.connect();
    }
    executeQuery(){
    	let query = this.getQuery();
    	let subscription = this.executeGet(query, null, false);
        return subscription.connect();
    }
    getByParams(queryParams: URLSearchParams, options: Object = {}) {
        options['headers'] = this.getHeaders();
        options['search'] = queryParams;

        return this.http.get(this.apiUrl, new RequestOptions(options))
            // .map(response => response['_body'])
            .catch((res) => this.handleError(res))
    }

    getWithParams(params?:{key: string, value: string}[], parsedType:string="json") {
        let queryParams = new URLSearchParams();
        if(params) params.forEach( item => queryParams.append(item.key, item.value));
        let options = { headers: this.getHeaders() };
        if(queryParams) options["search"] = queryParams;
        return this.http.get(this.apiUrl, options)
            .map((res) => {return res[parsedType]()})
            .catch((res) => this.handleError(res))
    }
    postWithData(object: any, options: Object = {}){
        options['headers'] = this.getHeaders();

        return this.http.post(this.apiUrl, object, options)
            .catch((res) => this.handleError(res))
    }
    postWithQueryParams(object: Object = {}, queryParams: Object = {}, options: Object = {}){
        options['headers'] = this.getHeaders();
        options['search'] = queryParams;

        return this.http.post(this.apiUrl, object, options)
            .map((res) => {
                let obj = res.json();
                return obj;
            })
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount().publish()
    }
    executeGet(queryParams: URLSearchParams, id: number = null, hasSingleRecord: boolean = false) {
        let executionUrl = (id) ? this.apiUrl + '/' + id : this.apiUrl;
        let options = { headers: this.getHeaders() };
        if (id) {
            hasSingleRecord = true;
        }
        if (queryParams) {
            options["search"] = queryParams;
        }
        return this.http.get(executionUrl, options)
            .map((res) => (hasSingleRecord) ? this.mapSingle(res) : this.map(res))
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount().publish()
    }
    executePost(object: Object, queryParams: Object = null, options: Object = null, mapAsGet: boolean = false) {
        if(!options) options = {};
        options['headers'] = this.getHeaders();
        if(queryParams) options['search'] = queryParams;
        return this.http.post(this.apiUrl, object, options)
            .map((res) => mapAsGet ? this.map(res) : this.postMap(res))
            .catch((res) => this.handleError(res));
    }
    executePut(object: Object, id: number) {
        let url = (id) ? this.apiUrl + '/' + id : this.apiUrl;
        return this.http.put(url, object, { headers: this.getHeaders() })
            .map((res) => this.putMap(res))
            .catch((res) => this.handleError(res));
    }
    executePatch(object: Object, id: number) {
    	 let url = (id) ? this.apiUrl + '/' + id : this.apiUrl;
        return this.http.patch(url, object, { headers: this.getHeaders() })
            .map((res) => this.patchMap(res))
            .catch((res) => this.handleError(res));
    }
    private executeDelete(params : any) {
    	let url = '';
    	if(typeof params == 'number' || typeof params == 'string'){
    		url = (params) ? this.apiUrl + '/' + params : this.apiUrl;
    	}
    	if(typeof params == 'object'){
    		url = this.apiUrl + '?';
    		let keys = Object.keys(params);
    		for(let key in keys){
    			url += keys[key] + '=' + params[keys[key]] + '&';
    		}
    		url = url.slice(0,-1);
    	}
        return this.http.delete(url, { headers: this.getHeaders() })
            .map((res) => this.deleteMap(res))
            .catch((res) => this.handleError(res));
    }
    map(response: Response): any[] {
        let responseObjects = response.json();
        if (responseObjects) {
            let payload = (responseObjects.Items === undefined) ? responseObjects : responseObjects.Items;
            let data: any[] = [];
            for (let p in payload) {
                let model = new ModelFactory(this.endpoint, payload[p]);
                let modelObject = model.getInstance();
                if (this.isStorePushAvailable) {
                    this.storeService.push(this.endpoint, modelObject);
                }
                data.push(modelObject);
            }
            if(this.data) this.data.next(data);
            if(this.count) this.count.next(responseObjects.Count);
            return data;
        }
    }
    mapSingle(response: Response): Object {
        let payload = response.json();
        let model = new ModelFactory(this.endpoint, payload);
        let modelObject = model.getInstance();
        if (this.isStorePushAvailable) {
            this.storeService.push(this.endpoint, modelObject);
        }
        this.data.next([modelObject]);
        return modelObject;
    }
    postMap(response: Response): Object {
        let payload = (response && response["_body"]) ? response.json() : '';
        return payload;
    }
    patchMap(response: Response): Object {
        let payload = (response && response["_body"]) ? response.json() : '';
        return payload;
    }
    putMap(response: Response): Object {
        let payload = (response && response["_body"]) ? response.json() : '';
        return payload;
    }
    deleteMap(response: Response): Object {
        let payload = (response && response["_body"]) ? response.json() : '';
        return payload;
    }
    getData(): Observable<any[]> {
        return new BehaviorSubject([]);
    }

    getCount(): Observable<number> {
        return this.count;
    }
    find(id: number, forceToNewRequest: boolean = false): Observable<any> {
        let item = this.storeService.getData(this.endpoint).filter(item => {
            return (item.Id === id);
        })[0];
        if (!item && !forceToNewRequest) {
            return new BehaviorSubject(item[0]);
        } else {
            return this.executeGet(null, id).connect();
        }
    }
    update(object, type: string = 'patch') {
    	let id = object.Id;
        delete object['Id'];
        if (type === 'put') {
            return this.executePut(JSON.stringify(object), id);
        } else {
            return this.executePatch(JSON.stringify(object), id);
        }
    }
    save(object) {
        return this.executePost(JSON.stringify(object))
    }
    delete(params : any){
    	return this.executeDelete(params);
    }
    reload(){
    	this.queryParamSubject.next(this.queryParams);
    }
    setCustomEndpoint(endpoint: string, haveCodes: boolean = false, fromCache : boolean = false): void {
        if (haveCodes && !fromCache ) {
            this.apiUrl = this.baseUrl + '/' + this.firmCode + '/' + this.channelCode + '/' + this.endpoint + '/' + endpoint;
        } else if(haveCodes && fromCache ) {
        	this.apiUrl = this.baseUrl + '/' + 'Cached/' + this.firmCode + '/' + this.channelCode + '/' + this.endpoint + '/' + endpoint;
        }
        else{
            this.apiUrl = this.baseUrl + '/' + this.endpoint + '/' + endpoint;
        }
    }
    flushCustomEndpoint() {
        this.apiUrl = this.baseUrl + '/' + this.endpoint;
    }
    setEndpoint(endpoint : string){
    	this.endpoint = endpoint;
        this.apiUrl = this.baseUrl + '/' + this.endpoint;
    }
    setStoreAvailability(isAvailable) {
        this.isStorePushAvailable = isAvailable;
    }
    setFilter(filter: Object, pushStream: boolean = true) {
        if(this.queryParams['filter'] && (filter == this.queryParams['filter'][0])){
        	this.flushFilter();
        }else{
        	this.queryParams['page'] = 0;
        	this.queryParams['filter'] = [filter];
        }
        if (pushStream) {
            this.queryParamSubject.next(this.queryParams);
        }
    }

    setAdditionalFilter(filter: Object, pushStream = true) {
        let paramFilters = this.queryParams['filter'];

        if (paramFilters && paramFilters.length && paramFilters.length > 0 && paramFilters.some(f => f['filter'] === filter['filter'])) {
            this.flushFilter();
            this.queryParams['filter'] = paramFilters.filter(f => f['filter'] !== filter['filter']);
        } else {
            if (paramFilters && paramFilters.length && paramFilters.length) {
                this.queryParams['filter'] = paramFilters.filter(f => f['type'] !== filter['type']);
            } 
            this.queryParams['page'] = 0;
        	this.queryParams['filter'].push(filter);
        }

        if (pushStream) {
            this.queryParamSubject.next(this.queryParams);
        }
    }

    setProtectedFilter(filter: Object, pushStream: boolean = true){
    	this.queryParams['protectedFilter'] = filter;
    	if (pushStream) {
            this.queryParamSubject.next(this.queryParams);
        }
    }
    flushFilter(pushStream: boolean = true){
    	this.queryParams['filter'] = [];
    	if(pushStream){
    		this.queryParamSubject.next(this.queryParams);
    	}
    }
    setOrder(order: any, replace: boolean = true) {
        if (typeof order === 'string') {
            order = JSON.parse(order);
        }
        if (replace) {
            this.queryParams['sort'] = [];
        } else {
            let item = this.queryParams['sort'].filter(item => {
                return (item["sortBy"] == order.sortBy);
            });
            if (item.length > 0) {
                this.queryParams['sort'].splice(this.queryParams['sort'].indexOf(item[0]), 1);
            }
        }
        this.queryParams['sort'].push(order);
        this.queryParamSubject.next(this.queryParams);
    }
    flushOrder(pushStream: boolean = true){
    	this.queryParams['sort'] = null;
    	if(pushStream){
    		this.queryParamSubject.next(this.queryParams);
    	}
    }
    setPageSize(pageSize) {
        this.queryParams['pageSize'] = pageSize;
        this.queryParamSubject.next(this.queryParams);
    }
    getQueryParams() {
        let params = {};
        for (let propertyName in this.queryParams) {
            if (typeof this.queryParams[propertyName] === 'object') {
                if (this.queryParams[propertyName].length > 0) {
                    params[propertyName] = JSON.stringify(this.queryParams[propertyName]);
                }
            } else {
                params[propertyName] = this.queryParams[propertyName];
            }
        }
        return params;
    }
    resetQueryParams() {
        this.queryParams = { filter: [], sort: [], pageSize: 10, page: 1 };
    }
    setQueryParams(queryParams: Object) {
        this.queryParams = queryParams;
        this.queryParamSubject.next(this.queryParams);
    }
    setPage(page) {
        this.queryParams['page'] = page;
        this.queryParamSubject.next(this.queryParams);
    }
    setActiveViewType(viewType) {
        this.viewType = viewType;
    }
    setSearch(search: Object, pushStream: boolean = true) {
		this.queryParams['search'] = search;
        this.queryParams['page'] = 0;
        if (pushStream) {
            this.queryParamSubject.next(this.queryParams);
        }
    }
    setCustomApi( type : string){
    	switch(type){
    		case 'backoffice':
    			this.baseUrl = this.backOfficeUrl;
    		break;
    		case 'boxoffice':
    			this.baseUrl = this.boxOfficeUrl;
    		break;
    	}
    	this.apiUrl = this.baseUrl + '/' + this.endpoint;
    }
    getApiUrl(){
    	return this.apiUrl;
    }
    getBaseUrl(){
    	return this.baseUrl;
    }
    private handleError(error: Response | any) {
        if(error.status == 401){
        	let errorObject = JSON.parse(error['_body']);
        	if(errorObject && errorObject['ErrorCode'] && errorObject['ErrorCode'] == 'AU005'){
        	 	this.notificationService.add({text:'İlgili işlem için yetkiniz bulunmamaktadır.', type:'danger'})
        	}else{
                this.authenticationService.retryLoginOrLogout().then( result => {
                    this.notificationService.add({type: "warning", text: "İşlem sırasında oturumunuz otomatik olarak güncellenmiştir. Son yaptığınız işlemi tekrarlayınız."});
                }).catch( reason => {});
                return Observable.throw(error.json());
        	}
        }else{
            // this.count.next(null);
            if (this.count) this.count.next(null);
        	return Observable.throw(error.json());
        }
        
    }
    setHeader(type : string, value : any){
        let existType = this.headers.get(type);
        if(existType) {
            this.headers.set(type, value);
        }else{
            this.headers.append(type, value);
        }
    }
    private getHeaders(): any {
  		return this.headers;
    }
}
