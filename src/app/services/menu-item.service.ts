import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { MenuItem } from "../models/menu-item";
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class MenuItemService extends  BaseDataService {
	count : BehaviorSubject<number> =  new BehaviorSubject(0);
	data : BehaviorSubject<MenuItem[]> =  new BehaviorSubject([]);
	queryParams : Object = {filter: [], sort : [], pageSize: 10, page : 1};
	queryParamSubject : BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);
	constructor(http : Http, storeService : StoreService, authenticationService:AuthenticationService){
		super(http, 'SMenuItem', storeService, authenticationService);
	}
	getRawData() : MenuItem[]{
		return this.storeService.getData('SMenuItem');
	}
	getData() : BehaviorSubject<MenuItem[]>{
		return this.data;
	}
}
// export class MenuItemService  extends BaseDataService{
// 	count : BehaviorSubject<number> =  new BehaviorSubject(0);
// 	data : BehaviorSubject<MenuItem[]> =  new BehaviorSubject([]);
// 	mainMenu : BehaviorSubject<Array<any>> =  new BehaviorSubject([]);
// 	queryParams : Object = {filter: [], sort : [], pageSize: 10, page : 1};
// 	queryParamSubject : BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);
// 	private menuTypes : { main : number } = { main : 1 };
// 	constructor(http : Http, storeService : StoreService, authenticationService : AuthenticationService){
// 		super(http, 'SMenuItem', storeService, authenticationService);
// 		this.query({pageSize:100});
// 		this.data.subscribe(menuItems => {
// 			let mainMenuItems = [];
// 			menuItems.forEach(item => {
// 				if(item.Type == this.menuTypes.main && item.IsActive){
// 					if(item.ParentId){
// 						let parentMenuItem = mainMenuItems.find(parentItem => {
// 							return (parentItem.id == item.ParentId)
// 						});
// 						if(!parentMenuItem){
// 							parentMenuItem = menuItems.find(parentItem => {
// 								return (parentItem.Id == item.ParentId)
// 							});
// 							parentMenuItem = {
// 								id: parentMenuItem.Id,
// 								label: parentMenuItem['Localization']['Tr']['Label'],
// 								icon: (item.ClassName) ? item.ClassName : "event",
// 								submenu:[]
// 							};
// 							mainMenuItems.push(parentMenuItem);
// 						}
// 						parentMenuItem.submenu.push({
// 							id:item.Id,
// 							action: 'link',
//                 			label: item['Localization']['Tr']['Label'],
//                 			icon: (item.ClassName) ? item.ClassName : "event",
//                 			routerLink: item.Url
//                 		})
// 					}else{
// 						mainMenuItems.push({
// 							id: item.Id,
// 							label: item['Localization']['Tr']['Label'],
// 							icon: (item.ClassName) ? item.ClassName : "event",
// 							routerLink: item.Url,
// 							submenu:[]
// 						})
// 				}
// 			}
// 			})
// 			this.mainMenu.next(mainMenuItems);
// 		})
// 	}

// }
