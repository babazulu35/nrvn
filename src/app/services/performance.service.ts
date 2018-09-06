import { TetherDialog } from './../modules/common-module/modules/tether-dialog/tether-dialog';
import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Performance } from "../models/performance";
import { Observable } from 'rxjs/Observable';
import { Observer} from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';
import { PerformanceStatus } from '../models/performance-status.enum';
import { NotificationService } from './notification.service';


@Injectable()
export class PerformanceService extends  BaseDataService {
	count : BehaviorSubject<number> =  new BehaviorSubject(0);
	data : BehaviorSubject<Performance[]> =  new BehaviorSubject([]);
	queryParams : Object = {filter: [], sort : [], pageSize: 10, page : 1};
	queryParamSubject : BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);
	viewType : { isCardViewActive: boolean, isListViewActive: boolean } = {isCardViewActive: false, isListViewActive: true};

	isLoading: BehaviorSubject<boolean> = new BehaviorSubject(true);
	performanceStatus = PerformanceStatus;
	tetherService: TetherDialog;
	notificationService: NotificationService;

	constructor(
		http: Http,
		storeService: StoreService,
		authenticationService:AuthenticationService,
		tetherService: TetherDialog,
		notificationService: NotificationService
	) {
		super(http, 'EPerformance', storeService, authenticationService);
		this.tetherService = tetherService;
		this.notificationService = notificationService;
	}

	getRawData() : Performance[]{
		return this.storeService.getData('EPerformance');
	}

	getData() : BehaviorSubject<Performance[]>{
		return this.data;
	}

	changeLoading(isLoading: boolean){
		this.isLoading.next(isLoading);
	}

	create(event : Object){
		// let event = new Performance();
		/*
		event.set('Id', 3);
		event.set('Code', 's23');
		event.set('Localization', {'Tr':{'Name':'Nirvana'}});
		*/
		return this.save(event);
	}

	gotoPage(params: Object, otherParams: Array<Object> = []){
		let page = params["page"] || 0,
			sort = params["sort"] ? (typeof params["sort"] == 'string' ? JSON.parse(params["sort"]) : params["sort"]) : null,
			filter = params["filter"] || null,
			pageSize = params["pageSize"] || 5,
			search = params["search"] || null,
			protectedFilter = params["protectedFilter"] || null;
		this.query({ pageSize: pageSize, page: page, sort: sort, filter: filter, search: search, protectedFilter: protectedFilter}, otherParams);
	}

	callItemAction(item: Object, action: string){
		this.callBatchAction([item], action);
	}

	callBatchAction(selectedItems: Array<Object>, action: string){
		this.changeLoading(true);

		let statusToCheck: Array<any> = [];

		let modalData = {
			title: 'Performansı iptal et',
			description:'<b>DİKKAT!</b> Performansı iptal etmek istediğinizden emin misiniz?',
			confirmButton: {label: 'İPTAL ET'},
			dismissButton: {label: 'VAZGEÇ'},
			feedback: {label: "Mesajınız", required: true}
		}

		switch (action) {
			case "visibilityOn":
				statusToCheck = [this.performanceStatus['Suspended']];

				this.updateStatus(selectedItems, this.performanceStatus['OnSale'], null, null, statusToCheck);
				break;

			case "archive":
				this.updateStatus(selectedItems, this.performanceStatus['Closed']);
				break;

			case "visibilityOff":
				statusToCheck = [this.performanceStatus['OnSale'], [this.performanceStatus['SoldOut']]];

				modalData['title'] = 'Performansın satışını durdur'
				modalData['description'] = 'Performansın satışını durdurmak istediğinizden emin misiniz?'
				modalData['confirmButton'] = {label: 'DURDUR'}

				this.tetherService.confirm(modalData)
				.then(result => {
					this.updateStatus(selectedItems, this.performanceStatus['Suspended'], result['feedback'], null, statusToCheck);
				})
				.catch(reason => {
					//this.changeLoading(false);
					console.log("reason", reason);
				});

				break;

			case "delete":
				this.tetherService.confirm(modalData)
				.then(result => {
					this.updateStatus(selectedItems, this.performanceStatus['Cancelled'], null, result['feedback']);
				})
				.catch(reason => {
					//this.changeLoading(false);
					console.log("reason", reason);
				});

				break;

			case "copy":
				// this.setCustomEndpoint('CopyAsync');
				// let data = {
				// 	"SourceEventCode": ``,
				// 	"SourcePerformanceCode": ``,
				// 	"TargetEventCode": ``
				// }
				// let copy = this.create(data);
				// copy.subscribe(item =>{
				// 	this.notificationService.add({text:'Kopyalama işlemi gerçekleşti.', type:'success'});
				// 	this.setCustomEndpoint('GetPerformanceList');
				// 	this.reload();
				// }, error => {
				// 	this.notificationService.add({text:error, type:'error'});
				// });
				break;
		}
	}

	private updateStatus(selectedItems: Array<Object>, status: number, suspensionReason: string = '', cancellationReason: string = '', statusToCheck: Array<Object> = []){

		if(statusToCheck && statusToCheck.length) {
			for (var i = 0; i < selectedItems.length; i++) {
				let itemStatus = selectedItems[i]['Status'];

				if(statusToCheck.indexOf(itemStatus) < 0) {
					this.changeLoading(false);
					this.notificationService.add({text:'Bu işlem seçilen performans(lar) üzerinde gerçekleştirilemez.', type:'danger'});
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
				this.notificationService.add({text:'Başarıyla güncellendi.', type:'success'});
			},
			error => {
				this.notificationService.add({text:'Hata.', type:'danger'});
			},
			complete => {
				this.changeLoading(false);
			}
		);
	}
}
