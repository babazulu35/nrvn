import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';


@Injectable()
export class SalesChannelPaymentTypeService extends BaseDataService {

	constructor(
		http: Http,
		storeService: StoreService,
		authenticationService: AuthenticationService
	) {
		super(http, 'CSalesChannelPaymentType', storeService, authenticationService);
		this.setStoreAvailability(false);
		this.setCustomApi('backoffice');
  }
  
  addPaymentTypes(paymentTypeRelations: any[]) {
    this.setCustomEndpoint('PostAll');

    return this.save(paymentTypeRelations);
  }

  updatePaymentTypes(paymentTypeRelations: any[]) {
    this.setCustomEndpoint('PutAll');

    return this.update(paymentTypeRelations, 'put');
  }

  deletePaymentType(paymentTypeRelation: any) {
    return this.delete(`${paymentTypeRelation.SalesChannelId}/${paymentTypeRelation.PaymentTypeId}`);
  }
}

