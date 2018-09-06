import { BaseDataService } from '../classes/base-data-service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { StoreService } from './store.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class UserPromoterService extends BaseDataService {
    constructor(http: Http, storeService: StoreService, authenticationService: AuthenticationService) {
        super(http, 'SUserPromoter', storeService, authenticationService);
    }

}