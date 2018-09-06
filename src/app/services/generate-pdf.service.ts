import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';



@Injectable()
export class GeneratePdfService extends BaseDataService {

	constructor(
		http: Http,
		storeService: StoreService,
		authenticationService: AuthenticationService
	) {
		super(http, 'GeneratePdf', storeService, authenticationService);
		this.setStoreAvailability(false);
		this.setCustomApi('boxoffice');
	}

}
