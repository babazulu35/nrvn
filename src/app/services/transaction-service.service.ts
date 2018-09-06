import { Injectable } from '@angular/core';
import { Http, Headers, URLSearchParams, RequestOptions, Response,  ResponseContentType } from '@angular/http';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from '../classes/base-data-service';
import { AuthenticationService } from './authentication.service';
import { StoreService } from './../services/store.service';
import { Observable } from 'rxjs';
import { InvoiceCustomerInfo } from '../models/invoice-customer-info';


@Injectable()
export class TransactionServiceService extends  BaseDataService {

	constructor(
		http: Http,
		storeService: StoreService,
		authenticationService:AuthenticationService,
	) {
		super(http, 'Transaction', storeService, authenticationService);
		
	}

	downloadPdf(items: Array<number>) {
		this.setCustomEndpoint('GetTicketPdf');

		return this.postWithData(items, {
			responseType: ResponseContentType.Blob,
		});

	}

	sendConfirmationSMS(refId) {
		this.setCustomEndpoint('SendConfirmationSms');

		let sub = this.postWithQueryParams({}, {refId: refId});
		sub.connect();
		return sub
	}

	sendEInvoiceMail(refId) {
		this.setCustomEndpoint('SendInvoiceMail');

		let body = {
			'BasketRefList': [refId]
		};

		return this.save(body);
	}

	getEInvoicePdf(itemIds: Array<number>) {
		this.setCustomEndpoint('GetEInvoicePdf');

		let queryParams = new URLSearchParams();

		itemIds.forEach(id => {
			queryParams.append('itemIdList', id.toString());
		});

		return this.getByParams(queryParams);
	}


	getEArchivePdf(refId: string) {
		this.setCustomEndpoint('GetEArchivePdf');

		let queryParams = new URLSearchParams();

		queryParams.append('refId', refId);

		return this.getByParams(queryParams);
	}

	getTransactionSeats(basketId: string, pageSize: string, page = '0') {
		this.setCustomEndpoint('GetTransactionSeats');

		let queryParams = [
			{
				key: 'basketId',
				value: basketId
			},
			{
				key: 'pageSize',
				value:  pageSize
			},
			{
				key: 'page',
				value: page
			}
		];

		return this.getWithParams(queryParams);

	}

	checkInvoiceType(identity:string):Observable<any> {
		this.setCustomApi('boxoffice');
		this.setCustomEndpoint('CheckEInvoiceCustomer');
		let body = {
			'Identity': identity
		};
		return this.save(body);
	}

	setMemberInfo(memberInfo: InvoiceCustomerInfo) {
		this.setCustomApi('boxoffice');
		this.setCustomEndpoint('SetMemberInfo', true);
		return this.save(memberInfo);

	}
}
