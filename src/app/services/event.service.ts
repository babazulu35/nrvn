import { TetherDialog } from './../modules/common-module/modules/tether-dialog/tether-dialog';
import { FeedbackFormComponent } from './../modules/common-module/common/feedback-form/feedback-form.component';
import { Injectable, ComponentRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Event } from "../models/event";
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';
import { NotificationService } from './notification.service';
import { EventStatus } from '../models/event-status.enum';


@Injectable()
export class EventService extends BaseDataService {
    count: BehaviorSubject<number> = new BehaviorSubject(0);
    data: BehaviorSubject<Event[]> = new BehaviorSubject([]);
    queryParams: Object = {protectedFilter : null, filter: [], sort: [], pageSize: 10, page: 1 };
    queryParamSubject: BehaviorSubject<Object> = new BehaviorSubject(this.queryParams);
    viewType: { isCardViewActive: boolean, isListViewActive: boolean } = { isCardViewActive: false, isListViewActive: true };

    eventStatus = EventStatus;
    tetherService: TetherDialog;
    notificationService: NotificationService;

    constructor(
        http: Http,
        storeService: StoreService,
        authenticationService: AuthenticationService,
        tetherService: TetherDialog,
        notificationService: NotificationService
    ) {
        super(http, 'EEvent', storeService, authenticationService);
        this.tetherService = tetherService;
        this.notificationService = notificationService;
    }

    getRawData(): Event[] {
        return this.storeService.getData('EEvent');
    }

    getData(): BehaviorSubject<Event[]> {
        return this.data;
    }

    create(event: Object) {
        return this.save(event);
    }

    gotoPage(params : Object, otherParams : Array<Object> = []){
        let page = params["page"] || 0,
            sort = params["sort"] ? (typeof params["sort"] == 'string' ? JSON.parse(params["sort"]) : params["sort"]) : null,
            filter = params["filter"] || null,
            pageSize = params["pageSize"] || 20,
            search = params["search"] || null,
            protectedFilter = params["protectedFilter"] || null;
        this.query({ pageSize: pageSize, page: page, sort: sort, filter: filter, search: search, protectedFilter: protectedFilter}, otherParams);
    }

    callItemAction(item: Object, action: string){
        this.callBatchAction([item], action);
    }

    callBatchAction(selectedItems: Array<Object>, action: string){
        let statusToCheck: Array<any> = [];

        let modalData = {
            title: 'Etkinliği iptal et',
            description:'<b>DİKKAT!</b> Etkinliği iptal etmek istediğinizden emin misiniz?',
            confirmButton: {label: 'İPTAL ET'},
            dismissButton: {label: 'VAZGEÇ'},
            feedback: {label: "Mesajınız", required: true}
        }

        switch (action) {
            case "visibilityOn":
                statusToCheck = [this.eventStatus['Suspended']];

                this.updateStatus(selectedItems, this.eventStatus['OnSale'], null, null, statusToCheck);
                break;

            case "archive":
                this.updateStatus(selectedItems, this.eventStatus['Closed']);
                break;

            case "visibilityOff":
                statusToCheck = [this.eventStatus['OnSale'], [this.eventStatus['SoldOut']]];

                modalData['title'] = 'Etkinliğin satışını durdur'
                modalData['description'] = 'Etkinliğin satışını durdurmak istediğinizden emin misiniz?'
                modalData['confirmButton'] = {label: 'DURDUR'}

                this.tetherService.confirm(modalData)
                .then(result => {
                    this.updateStatus(selectedItems, this.eventStatus['Suspended'], result['feedback'], null, statusToCheck);
                })
                .catch(reason => {
                    console.log("reason", reason);
                });

                break;

            case "delete":
                this.tetherService.confirm(modalData)
                .then(result => {
                    this.updateStatus(selectedItems, this.eventStatus['Cancelled'], null, result['feedback']);
                })
                .catch(reason => {
                    console.log("reason", reason);
                });

                break;
            case "copy":
            	this.setCustomEndpoint('Copy');
            	let data = {
				  "EventId": selectedItems[0]['Id'],
				  "Type": 0
				};
                let copy = this.create(data);
                copy.subscribe(item =>{
                	this.notificationService.add({text:'Kopyalama işlemi gerçekleşti.', type:'success'});
                	this.setCustomEndpoint('GetEventList');
                	this.reload();
                }, error => {
                	this.notificationService.add({text:error, type:'danger'});
                })
                break;
        }
    }

    private updateStatus(selectedItems: Array<Object>, status: number, suspensionReason: string = '', cancellationReason: string = '', statusToCheck: Array<Object> = []){

        if(statusToCheck && statusToCheck.length) {
            for (var i = 0; i < selectedItems.length; i++) {
                let itemStatus = selectedItems[i]['Status'];

                if(statusToCheck.indexOf(itemStatus) < 0) {
                    // this.isLoading = false;
                    this.notificationService.add({text:'Bu işlem seçilen etkinlik(ler) üzerinde gerçekleştirilemez.', type:'danger'});
                    return false;
                }
            }
        }

        let payload: Array<Object> = [];

        selectedItems.forEach(item => {

            let newObject = {
                'Id': item['Id'],
                'Status': status,
            }

            item['Status'] = status;

            if(suspensionReason) {
                item['SuspensionReason'] = suspensionReason;
                newObject['SuspensionReason'] = suspensionReason;
            }

            if(cancellationReason) {
                item['CancellationReason'] = cancellationReason;
                newObject['CancellationReason'] = cancellationReason;
            }

            payload.push(newObject);
        });

        this.setCustomEndpoint('PatchAll');
        this.executePatch(payload, null).subscribe(
            response => {
                console.log("PatchAll-response", response);
                this.notificationService.add({text:'Başarıyla güncellendi.', type:'success'});
            },
            error => {
                console.log("PatchAll-error", error);
                this.notificationService.add({text:'Hata.', type:'danger'});
            },
            complete => {
                console.log("PatchAll-complete", complete);
                // this.isLoading = false;
                this.setCustomEndpoint('GetEventList');
            }
        );
    }
}
