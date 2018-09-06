import { BaseDataService } from '../../../classes/base-data-service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { StoreService } from '../../../services/store.service';
import { AuthenticationService } from '../../../services/authentication.service';

@Injectable()
export class ReservationCustomerService extends BaseDataService {
    constructor(http: Http, storeService: StoreService, authenticationService: AuthenticationService) {
        super(http, 'ReReservationCustomer', storeService, authenticationService);
    }
}