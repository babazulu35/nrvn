import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';


@Injectable()
export class PaymentService extends  BaseDataService {

	constructor(
		http: Http,
		storeService: StoreService,
		authenticationService:AuthenticationService,
	){
		super(http, 'Payment', storeService, authenticationService);
	}

}
