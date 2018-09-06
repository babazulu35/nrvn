import { BaseDataService } from '../../../classes/base-data-service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { StoreService } from '../../../services/store.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class HallService extends BaseDataService {
    count: BehaviorSubject<number> = new BehaviorSubject(0);
    data: BehaviorSubject<any> = new BehaviorSubject([]);
    constructor(http: Http, 
        storeService: StoreService, 
        authenticationService: AuthenticationService) {
        super(http, 'VHall', storeService, authenticationService);
    }

    create(event: Object) {
        return this.save(event);
    }

    getData(): BehaviorSubject<any> {
        return this.data;
    }
}
