import { Injectable, Inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, Response, Headers, RequestOptions, RequestMethod, URLSearchParams} from "@angular/http";
import { AuthenticationService } from './authentication.service';
import { Observer} from 'rxjs/Observer';
import { BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable} from "rxjs/Observable";
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ElasticSearchService {
	private baseUrl : string;
	private apiUrl : string;
	private token : string;
	private channelCode : string = 'Web';
	private firmCode : string = 'POZ';
	private endpoint : string;
	private object;
	count : BehaviorSubject<number> =  new BehaviorSubject(0);
	data : BehaviorSubject<Object[]> =  new BehaviorSubject([]);
	queryParams : Object = { "QueryText": "", "PageSize": 30, "Page": 0, "DateRange": null,"PriceRange": null};
	queryParamSubject : BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);
  	constructor (private http : Http, private authenticationService : AuthenticationService) {
  		this.baseUrl = environment.api.boxoffice + '/' + environment.api.path;
  		this.http = http;
  		this.token = authenticationService.getToken();
  		this.channelCode = authenticationService.getUserChannelCode();
  		this.firmCode = authenticationService.getUserFirmCode();
  	}
  	search(params : Object){
  		return this.http.post(this.apiUrl , params , {headers: this.getHeaders()})
	    		.map((res) => this.map(res))
	            .catch(this.handleError)
	            .publish().connect();
  	}
  	private map(response: Response) : any[]{
   		let responseObjects = response.json();
   		if(responseObjects){
	   		let payload = (responseObjects.Results) ? responseObjects.Results : responseObjects;
	   		this.data.next(payload);
	   		/*
	   		if(payload["Total"]){
	   			this.count.next(payload["Total"]);
	   		}
	   		*/
	   		return payload;
   		}
	}
	setCustomEndpoint(endpoint : string) : void{
		this.apiUrl = this.baseUrl + '/' + this.firmCode +'/' + this.channelCode + '/' + this.endpoint + '/' + endpoint;
	}
	flushCustomEndpoint(){
		this.apiUrl = this.baseUrl + '/' + this.firmCode +'/' + this.channelCode + '/' + this.endpoint;
	}
	setEndpoint(endpoint){
		this.endpoint = endpoint;
	}
	gotoPage(params : Object){
		console.log(params);
		let searchModel = {};
			searchModel["QueryText"] = params["QueryText"] || "";
			if(params["Page"]) searchModel["Page"] = params["Page"];
			if(params["PageSize"]) searchModel["PageSize"] = params["PageSize"];
			if(params["DateRange"]) searchModel["DateRange"] = params["DateRange"];
			if(params["PriceRange"]) searchModel["PriceRange"] = params["PriceRange"];
		this.search(searchModel);
	}
	setQueryText(text: String) {
        this.queryParams['QueryText'] = text;
        this.queryParamSubject.next(this.queryParams);
    }
    setDateRange(startdate, enddate){
    	this.queryParams['DateRange'] = { "StartDate": startdate, "EndDate": enddate };
        this.queryParamSubject.next(this.queryParams);
    }
  	private getHeaders() : any{
	    let headers = new Headers();
	    headers.append('Content-Type', 'application/json');
	    headers.append('Accept-Language', 'tr-tr');
	    headers.append('PublishingPoint', 'Nirvana');
	    if(this.token){
	    	headers.append('Authorization', 'bearer ' + this.token);
	    	return headers;
	    }else{
	    	return Observable.throw('Token Error');
	    }
  	}
  	private handleError (error: Response | any) {
	    let errMsg: string;
	    if (error instanceof Response) {
	      const body = error.json() || '';
	      const err = body.error || JSON.stringify(body);
	      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
	    } else {
	      errMsg = error.message ? error.message : error.toString();
	    }
	    console.error(errMsg);
	    return Observable.throw(errMsg);
  	}
}
