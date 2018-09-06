import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestMethod, URLSearchParams} from "@angular/http";
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { AuthenticationService } from './authentication.service';
import { localSettings } from './../settings';


@Injectable()
export class AppSettingsService {

	private clientSettings: Array<Object> = [];
	private baseUrl: string;
	private apiUrl: string;
	private http: Http;
	private authenticationService: AuthenticationService;
	private localSettings = localSettings;

	constructor(
		http: Http,
		authenticationService: AuthenticationService
	) {
		this.baseUrl = environment.api.host + '/' + environment.api.path;
		this.apiUrl = this.baseUrl + '/SAppSetting';
		this.http = http;
		this.authenticationService = authenticationService;

		let settings = localStorage.getItem('nirvanaSettings');
		if(settings){
			this.setClientSettings(JSON.parse(settings));
		}
	}

	getLocalSettings(key?: string): any {
		if(key) {
			return this.localSettings[key]
		} else {
			// TODO: return all settings or throw error?
		}
	}

	setLocalSetting(key: string, value: any) {
		if(this.localSettings) this.localSettings[key] = value;
	}

	getClientSettings(): any {
		let queryParams = new URLSearchParams();
		let page = 0;
		queryParams.append('Page', String(page));
		queryParams.append('PageSize', String(100));
		queryParams.append('$filter','IsClientSetting eq true');
		let options = {};
		options["search"] = queryParams;
		options["headers"] = this.getHeaders();
		if(this.authenticationService.getToken()){
			return this.http.get(this.apiUrl, new RequestOptions(options)).map((res) => {
					let responseObjects = res.json();
					let payload = (responseObjects.Items === undefined) ? responseObjects : responseObjects.Items;
					localStorage.setItem('nirvanaSettings', JSON.stringify(payload));
				});
		} else {
			return  Observable.of([]);
		}
	}

	setClientSettings(settings) {
		this.clientSettings = settings;
	}

	findClientSetting(key: string){
		if(this.clientSettings && this.clientSettings.length > 0){
			let setting = this.clientSettings.filter(item => {
				return (item["Key"] === key);
			})[0];
			return (setting) ? setting["Value"] : null;
		}
		return null;
	}

	private getHeaders(){
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Accept-Language', 'tr-tr');
		if(this.authenticationService.getToken()){
			headers.append('Authorization', 'bearer ' + this.authenticationService.getToken());
			return headers;
		}
	}
}
