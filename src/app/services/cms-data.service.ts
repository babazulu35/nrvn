import { AppSettingsService } from './app-settings.service';
import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { City } from "../models/city";
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CMSManager} from "../classes/cms-manager";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class CmsDataService extends CMSManager{
  data : BehaviorSubject<any[]> =  new BehaviorSubject([]);
  
  constructor(http: Http, authenticationService: AuthenticationService, storeService :StoreService, appSettingsService: AppSettingsService) {
  	super(http, authenticationService, storeService, appSettingsService);
  }

}
