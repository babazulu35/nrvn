import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Price } from "../models/price";
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class PriceService extends  BaseDataService {
	count : BehaviorSubject<number> =  new BehaviorSubject(0);
	data : BehaviorSubject<Price[]> =  new BehaviorSubject([]);
	constructor(http : Http, storeService : StoreService, authenticationService:AuthenticationService){
		super(http, 'PPrice', storeService, authenticationService);
	}
	getRawData() : Price[]{
		return this.storeService.getData('PPrice');
	}
	getData() : BehaviorSubject<Price[]>{
		return this.data;
	}
	create(){
		let price = new Price();
		/*
		event.set('Id', 3);
		event.set('Code', 's23');
		event.set('Localization', {'Tr':{'Name':'Nirvana'}});
		*/
		this.save(price);
	}
}
