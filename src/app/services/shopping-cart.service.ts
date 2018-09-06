import { Injectable } from '@angular/core';
import { Response, Http } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';
import { NotificationService } from './notification.service';
import { environment } from '../../environments/environment';
import { LocalStorageService } from 'angular-2-local-storage';
import { MainLoaderService } from './main-loader.service';
@Injectable()
export class ShoppingCartService extends  BaseDataService {
	count : BehaviorSubject<number> =  new BehaviorSubject(0);
	data : BehaviorSubject<Object[]> =  new BehaviorSubject([]);
	queryParams : Object = {filter: [], sort : [], pageSize: 20, page : 1};
	queryParamSubject : BehaviorSubject<Object> =  new BehaviorSubject(this.queryParams);
	cartItems : {id: number, type:string, title:string, date:any, location:string, products: Object[]}[] = [];
	cartItemsSubject :BehaviorSubject<Object> =  new BehaviorSubject(null);
	cartSubTotalSubject :BehaviorSubject<{cartTotal:number,cartCurrency:string}> =  new BehaviorSubject({cartTotal:0,cartCurrency:'TL'});
	cartUserSubject :BehaviorSubject<Object> =  new BehaviorSubject(null);
	cartItemStatus:BehaviorSubject<boolean> =  new BehaviorSubject(false);
	allowState:BehaviorSubject<boolean> =  new BehaviorSubject(false);
	cartUser : Object;
	private previousState = {};
  	private currentState = {};
	selectedSeat;
	isCartCreated : boolean = false;
	mainLoaderService: MainLoaderService;
	
	// notificationService: NotificationService;
	constructor(http : Http, storeService : StoreService, authenticationService : AuthenticationService,public notif:NotificationService,  notificationService : NotificationService, private localStorageService: LocalStorageService, mainLoaderService: MainLoaderService){
		super(http, 'ShoppingCart', storeService, authenticationService);
		this.baseUrl = environment.api.boxoffice + '/' + environment.api.path;
		this.mainLoaderService = mainLoaderService;
/* 		if(!this.localStorageService.get('isCartCreated')){
			this.createNewCart();
		} */
		this.data.subscribe(cart => {
			
			let subTotal : number = 0;
			let currency : string;
			if(cart && !cart['State']){
				cart.forEach(event => {
					if(event['Performances'] && event['Performances'].length > 0){
						console.log("performance re map",event['Performances']);
						console.log("Event Id",event['Id']);
						let cartItem  = {
							id: event['Id'],
							type: 'Etkinlik',
							title: event['Name'],
							date: event['SalesBeginDate'],
							location:event['Venue'],
							allocationType:'',
							products: []
						};
						event['Performances'].forEach(performance => {
							cartItem.date = performance['DateTime'];
							performance['Products'].forEach(product => {
								// Allocation Type Eklendi
								cartItem.allocationType += product['AllocationType_Desc'];
								console.log("Cart Items Products Log",product);
								product['Variants'].forEach(variant => {
									cartItem.products.push({
										id: variant['Id'],
										title: product['Name'],
										variant: variant['Name'],
										price: { amount: variant['FaceAmount'], currency: variant['Price']['Currency'] },
										count: variant['CountOfProductsSelected']
									})
								})
							})
						})
						this.cartItems.push(cartItem);
						subTotal += event['SubTotal']['BasePrices']['FaceAmount']
						//subTotal += event['PaymentSubTotal']['Amount'];
						currency = event['PaymentSubTotal']['Currency'];
					}
				})
			}
			this.cartItemsSubject.next({cartItems: this.cartItems, subTotal: subTotal, currency: currency});
		});
	}
	createNewCart(){
		this.setCustomEndpoint('CreateShoppingCart', true);
  		let newShoppingCart = this.create();
  		newShoppingCart.subscribe(item => {
			this.isCartCreated = true;
			this.localStorageService.set('isCartCreated', true);
		},error=>{
			this.localStorageService.set('isCartCreated', false);
			this.notificationService.add({text:'Alışveriş sepeti oluşturulamadı.', type:'warning'});
		});
	}
	getData() : BehaviorSubject<Object[]>{
		return this.data;
	}
	map(response: Response): any[] {
        let responseObjects = response.json();
        if (responseObjects) {
            this.data.next(responseObjects);
            return responseObjects;
        }
    }
	gotoPage(params : Object){
		let page = params["page"] || 0,
			sort = params["sort"] ? (typeof params["sort"] == 'string'  ? JSON.parse(params["sort"]) : params["sort"]) : null,
			filter = params["filter"] || null,
			pageSize = params["pageSize"] || 20;
		this.query({pageSize:pageSize, page:page,sort:sort, filter:filter});
	}
	addToCart(items) :Observable<any> {
		return Observable.create( obs => {
			this.mainLoaderService.updateNarrow(true); 
			this.setCustomEndpoint('SetProductAndCount?includeStateModel=true', true);
			let model = {
			  "Selections": items
			};
			let save = this.save(model);
			save.subscribe(result => {
					this.setCurrentState(result);
					//this.cartItems = [];
					obs.next(result);
					obs.complete();	
			},
			error => {
				this.mainLoaderService.updateNarrow(false);
				this.mainLoaderService.updateNarrowSingle(false);
				this.mainLoaderService.updateButtonStatus(false);
				this.mainLoaderService.updateButtonPromising(false);				
				this.handleShoppingCardError(error);
			});
	})
	}

	private handleShoppingCardError(error = null) {
		let message,
			type;

		if (error && error['ErrorCode']) {
			message = `${error['ErrorCode']}: `;
			switch (error['ErrorCode']) {
				case 'WRF0101':
				case 'WRF0045':
					message += 'Belirlenen limitin üstünde bilet adeti seçtiniz. Lütfen kontrol edip tekrar deneyiniz.';
					type = 'danger';
					break;
				case 'WRF0100':
					message += 'Kampanya limit tanımlaması hatalı.';
					type = 'danger';
					break;
				case 'WRF0008':
					message += 'Variant bulunamadı!';
					type = 'danger';
					break;
				case 'WRF0102':
					message += 'Variant kotası doldu!';
					type = 'danger';
					break;
				case 'WRF0103':
					message += 'Almaya çalışılan ürün adeti varolan kotayı aşmaktadır!';
					type = 'danger';
					break;
				default:
					message += `${error['Message']}`;
					type = 'danger';
					break;
			}
		} else {
			message = 'İşleminiz tamamlanırken bir hata oluştu.';
			type = 'danger'
		}

		this.notif.add({
			text: message,
			type: type
		});
	}
	removeFromCart(variantId:any){
		
		this.setCustomEndpoint('SetProductAndCount?includeStateModel=true', true);
		let paramet = [];
		if( typeof variantId == "object") {
			for(let i = 0; i < variantId.length;i++) {
				paramet.push({
			      "VariantId": variantId[i],
			      "Count": 0
			    })
			}
		this.mainLoaderService.updateNarrow(true);
			
		}
		else if(typeof variantId == "number") {
			paramet = [];
			paramet.push({
				"VariantId": variantId,
				"Count": 0
			})
		this.mainLoaderService.updateNarrowSingle(true);				
		}

		let model = {
		  "Selections": paramet
		};
		let save = this.save(model);
		save.subscribe(result => {		
			this.getCartSummary();
			setTimeout(() => {
				this.mainLoaderService.updateNarrow(false);
				this.mainLoaderService.updateNarrowSingle(false);
			},1000)									
		},error => {
			this.mainLoaderService.updateNarrow(false);
			this.mainLoaderService.updateNarrowSingle(false);
			this.handleShoppingCardError(error);
	    });
	}
	getCartData(){
		return this.cartItems;
	}
	create(model : Object = {}){
		return this.save(model);
	}
	flushCart(){
		this.cartItems = [];
		this.cartItemsSubject.next(this.cartItems);
		this.removeSeat();
		//this.createNewCart();
	}
	setCartUser(cartUser){
		this.cartUserSubject.next(cartUser);
		this.cartUser = cartUser;
		this.cartUser['fullName'] = cartUser['Name'] + ' ' + cartUser['Surname'];
	}
	getCartUser(){
		return this.cartUser;
	}
	removeUser(){
		console.log("on Remove cart user");
		this.setCustomEndpoint('CreateShoppingSession',true);
		let removeUser = this.create();
		removeUser.subscribe(result => {
			console.log("Subs Resutl");
			console.log("The State Data",this.getCurrentState());
			this.getCartSummary();
			this.cartUser = null;
			this.cartUserSubject.next(null);
			
		})

	}
	
	removeCartUser() {
		this.cartUser = null;
		this.cartUserSubject.next(null);
	}

	getCartSummary(){
		this.setCustomEndpoint('GetCartSummary', true);
		this.query({});
		this.cartItems = [];
	}
	getCartSummaryOnAddCart() {
			this.setCustomEndpoint('GetCartSummary', true);	
			this.query({});
			this.cartItems = [];
			this.allowState.next(true);
			this.mainLoaderService.updateNarrow(false);
			
	}
	selectSeat(seat){
		this.selectedSeat = seat;
	}
	removeSeat(){
		this.selectedSeat = null;
	}
	getSelectedSeat(){
		return this.selectedSeat;
	}
	applyCampaign(campaign){
		if(campaign['ApplicableStatus'] == 1 || campaign['ApplicableStatus'] == 3){
			this.setCustomEndpoint('ApplyCampaign?includeStateModel=true', true);
			return this.save({"CampaignId": campaign['Id']});
		}else{
			return Observable.of({error:"Campaign is not applicable"});
		}
	}
	cancelCampaign(campaign){
		this.setCustomEndpoint('CancelCampaign?includeStateModel=true', true);
		return this.save({"CampaignId": campaign['Id']});
	}
	validateClaim(claim){
		this.setCustomEndpoint('ValidateClaim?includeStateModel=true', true);
		return this.save(claim);
	}
	goBack(){
		this.setCustomEndpoint('GoBack?includeStateModel=true', true);
  		return this.save({});
	}
	setCurrentState(currentState){
		this.previousState = {...this.currentState};
		this.currentState = currentState;
	}
	getCurrentState(){
		return this.currentState;
	}
	getPreviousState(){
		return this.previousState;
	}
	handleStateError(error){
		if(error['ErrorCode'] == 'SM001'){
			return this.redirectToCorrectStateRoute();
		}else{
			return {action:'notifyAndRedirect', routerLink:['boxoffice'], notification: error['Message'] };
		}
	}
	redirectToCorrectStateRoute(goto:any = null){
		let currentState = this.getCurrentState();
		console.log("State Data",currentState);	
		let result = {action:'notifyAndRedirect', routerLink:['boxoffice'], notification: 'Hatalı bir geçiş yapmaya çalıştınız, doğru sayfaya yönlendiriliyorsunuz...' };
		let cartItems = this.getCartData();
		let state;
		if(goto == 'prev')
		{
			state = currentState['PreviousState'];
		}
		else {
			state = currentState['CurrentState'];
		}
		if(state){
			switch(state){
					case 1: //SelectProducts
						if(cartItems && cartItems.length > 0){
							result.routerLink = ['boxoffice', `${cartItems[cartItems.length - 1]['id']}`  , 'products'];
						}else{
							result.routerLink  = ['boxoffice'];
						}
					break;
					case 2: //SelectSeat
						result.routerLink = ['boxoffice', 'select-seat'];
					break;
					case 3: //
						result.routerLink = ['boxoffice'];
					break;
					case 4: //Basket
						result.routerLink = ['boxoffice','basket'];
					break;
					case 5: //
						result.routerLink = ['boxoffice'];
					break;
				
					case 6: //CheckUserClaim
						this.setCustomEndpoint('GoBack?includeStateModel=true', true);
			  			this.save({}).subscribe(state => {
			  				this.setCurrentState(state);
			  				this.redirectToCorrectStateRoute();
			  			});
					break;
					case 7: //Payment
						result.routerLink = ['boxoffice','purchase'];
					break;
					case 8: // Collect Data
						result.routerLink = ['boxoffice','collect-data'];
					break;						

				}
			return result;

		}else{
			this.setCustomEndpoint('GoBack?includeStateModel=true', true);
  			this.save({}).subscribe(state => {
  				this.setCurrentState(state);
  				this.redirectToCorrectStateRoute();
  			})
		}
	}
}
