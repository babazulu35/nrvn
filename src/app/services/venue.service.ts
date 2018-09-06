import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Venue } from "../models/venue";
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';
import { NotificationService } from './notification.service';

@Injectable()
export class VenueService extends BaseDataService {
    count: BehaviorSubject<number> = new BehaviorSubject(0);
    data: BehaviorSubject<Venue[]> = new BehaviorSubject([]);
    snapshotId: BehaviorSubject<any> = new BehaviorSubject(null);
    queryParams: Object = { filter: [], sort: [], pageSize: 10, page: 1 };
    queryParamSubject: BehaviorSubject<Object> = new BehaviorSubject(this.queryParams);
    viewType: { isCardViewActive: boolean, isListViewActive: boolean } = { isCardViewActive: true, isListViewActive: false };
    isLoading: BehaviorSubject<boolean> = new BehaviorSubject(true);

    notificationService: NotificationService;

    constructor(
        http: Http,
        storeService: StoreService,
        authenticationService: AuthenticationService,
        notificationService : NotificationService
    ) {
        super(http, 'VVenue', storeService, authenticationService);
        this.notificationService = notificationService;
    }
    getRawData(): Venue[] {
        return this.storeService.getData('VVenue');
    }
    getData(): BehaviorSubject<Venue[]> {
        return this.data;
    }
    create(event) {
        return this.save(event);
    }
    gotoPage(params: Object) {
        let page = params["page"] || 0,
            sort = params["sort"] ? (typeof params["sort"] == 'string' ? JSON.parse(params["sort"]) : params["sort"]) : null,
            filter = params["filter"] || null,
            pageSize = params["pageSize"] || 4,
            search = params["search"] || null;
        this.query({ pageSize: pageSize, page: page, sort: sort, filter: filter, search: search });
    }

    changeLoading(isLoading: boolean){
        this.isLoading.next(isLoading);
    }

    callItemAction(item: Object, action: string){
        this.callBatchAction([item], action);
    }

    callBatchAction(selectedItems: Array<Object>, action: string){
        this.changeLoading(true);

        switch (action) {
            case "activate":
                this.updateStatus(selectedItems, true);
                break;
            case "deActivate":
                this.updateStatus(selectedItems, false);
                break;
        }
    }

    private updateStatus(selectedItems: Array<Object>, status: boolean){

        let payload: Array<Object> = [];

        selectedItems.forEach(item => {

            let newObject = {
                'Id': item['Id'],
                'IsActive': status,
            }

            payload.push(newObject);
        });

        this.setCustomEndpoint('PatchAll');
        this.update(payload, null).subscribe(
            response => {
                this.notificationService.add({text:'Başarıyla güncellendi.', type:'success'});
                this.changeLoading(false);
                this.reload();
            },
            error => {
                this.notificationService.add({text:error.Message, type:'danger'});
                this.changeLoading(false);
                this.reload();
            }
        );
    }

    setSnapshotId(id) {
        this.snapshotId.next(id);
    }    
}

