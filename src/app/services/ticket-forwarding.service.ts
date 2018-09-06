import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BaseDataService } from '../classes/base-data-service';
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';


@Injectable()
export class TicketForwardingService extends BaseDataService {

	constructor(
		http: Http,
		storeService: StoreService,
		authenticationService: AuthenticationService
	) {
		super(http, 'TicketForwarding', storeService, authenticationService);
		this.setStoreAvailability(false);
		this.setCustomApi('boxoffice');
	}


	returnTicketPromoter(phoneNumber: string, AccessCodeUId: string): any {
		this.setCustomApi('backoffice');

		this.setCustomEndpoint('ReturnTicketPromoter');

		let body = {
			'PhoneNumber': phoneNumber,
			'AccessCodeUId': AccessCodeUId
		}

		return this.save(body);
	}

	reGenerateBarcode(validAccessCode: string): any {
		this.setCustomApi('backoffice');

		this.setCustomEndpoint('ReGenerateBarcode', false);

		let body = {
			Barcode: validAccessCode
		};

		return this.save(body);
	}

	sendBarcodeSms(refID: string): any {

		this.setCustomApi('boxoffice');	

		this.setCustomEndpoint('SendBarcodeSms', true);

		let sub = this.postWithQueryParams({}, {refId: refID});

		sub.connect();

		return sub;

	}

}
