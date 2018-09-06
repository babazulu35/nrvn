import { Installments } from './../models/installments';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from './../classes/base-data-service';
import { NotificationService } from './notification.service';
import { AuthenticationService } from './authentication.service';
import { StoreService } from './store.service';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class InstallmentService extends BaseDataService {
  data : BehaviorSubject<Installments[]> =  new BehaviorSubject([]);
  constructor(http : Http, storeService : StoreService, authenticationService : AuthenticationService,public notif:NotificationService,  notificationService : NotificationService){
    super(http, 'Transaction', storeService, authenticationService);
    this.baseUrl = environment.api.boxoffice + '/' + environment.api.path;
  }
}
