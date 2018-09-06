import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../environments/environment';

@Injectable()
export class PrintDataService extends  BaseDataService {

    constructor(
        http: Http,
  		  storeService: StoreService,
  		  authenticationService:AuthenticationService,    
    ) {
        super(http, 'Print', storeService, authenticationService);
        this.setCustomApi('backoffice');
     }

    create(model : Object = {}){
		    return this.save(model);
	  }

    getPrintTicketInfo(refId: string): any{
        this.setCustomEndpoint('GetPrintTicketInfo');

        let body = {
            'BasketRefList': [refId]
        }

        return this.create(body);
    }
}