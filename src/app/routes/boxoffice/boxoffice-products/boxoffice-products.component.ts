
import { StoreService } from './../../../services/store.service';
import { BoxofficeService } from './../../../services/boxoffice.service';
import { SeatSelectComponent } from './../../../modules/backstage-module/common/seat-select/seat-select.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { MainLoaderService } from './../../../services/main-loader.service';
import { Component, OnInit, ComponentFactoryResolver, Injector, ComponentRef, ElementRef, Inject, ChangeDetectorRef, Input, EventEmitter, Output,HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from './../../../services/authentication.service';
import { ShoppingCartService } from '../../../services/shopping-cart.service';
import { NotificationService } from '../../../services/notification.service';
import { AllocationType } from '../../../models/allocation-type.enum';
import { Http, URLSearchParams, Headers, RequestOptions } from "@angular/http";
import { AddToBasketWithCodeComponent } from './../../../modules/boxoffice-module/common/add-to-basket-with-code/add-to-basket-with-code.component';
import { ContextMenuComponent } from './../../../modules/common-module/components/context-menu/context-menu.component';

import { isEqual } from 'lodash';

@Component({
	selector: 'app-boxoffice-products',
	templateUrl: './boxoffice-products.component.html',
	styleUrls: ['./boxoffice-products.component.scss'],
	entryComponents: [SeatSelectComponent,AddToBasketWithCodeComponent,ContextMenuComponent ],
	
})
export class BoxofficeProductsComponent implements OnInit {

	subscription;
	count: number;
	event: Object[];
	campaignData:any;
	errorMessage;
	eventId: number;
	isAuthenticatedRole: boolean;
	@Input() isDisabled:boolean;
	allocationType = AllocationType;
	eventsa;
	currentSelected:number;
	cartItemsData;
	cartTotal;
	cartCurrency;
	currentState;
	basketList = [];
	cartItemList = [];
	resetIcon:string="delete";
	isBasketLoading:boolean;
	isAddDisable:boolean;
	currentValue= [];
	countOfSelected=[];
	isToggleOpen = [];
	deleteList=[];
	readyState:boolean = false;
	showMenu:boolean;
	addReservationCode: AddToBasketWithCodeComponent;
	resCodeEvent:Object[];
	isFurtherStepAllowed:boolean = false;
	isLoading: boolean = false;
	calculatedData = [];
    pills: Array<any> = [
        { text: 'KAMPANYALAR',isActive:false, count:15, icon: "card_giftcard"}
    ];
  	@Input() events: any;
  	@Input() variant: any;
  	@Input() product : any;
  	@Input() minProductCount: number;
	  selectedVariants : Object = {};
	  seVa : Object = {};
	  _firstComparisonData: Object = {};
	  _secondComparisonData: Object = {};
    
	@Output() actionEvent: EventEmitter<any> = new EventEmitter();
	allocationTypeColor = ['#cc3dfc','#FBCA64','#9EFD44'];
	filteredPerformances: any;

	@HostBinding('class.or-boxoffice-products') true;
	
	
	set eventState(state) {
		this.event = state
	}

	get stateData() {
		return this.event;
	}

	get customer() { return this.shoppingCartService.getCartUser(); }
	
	constructor(
    private shoppingCartService:ShoppingCartService,
    private boxofficeService: BoxofficeService,
		private router: Router,
		private route: ActivatedRoute,
		private notificationService : NotificationService,
		private authenticationService: AuthenticationService,
		private changeDetectorRef: ChangeDetectorRef,
		private resolver: ComponentFactoryResolver,
		private injector: Injector,
		public tetherService: TetherDialog,
		private mainLoaderService: MainLoaderService,
		private storeService: StoreService,
		private http:Http
	) {
		this.shoppingCartService.setCustomEndpoint('SelectEvent?includeStateModel=true', true);
		
	}

	ngOnInit() {
		this.isFurtherStepAllowed = false;
		this.currentState = {
			description:'SelectProduct',
			id:2
		}		
		this.isDisabled = false;
		this.isLoading = true
		this.route.params.subscribe(params => {
			if(params){
				this.eventId = +params["id"];
			}
		});
		let save = this.shoppingCartService.create({'EventId':this.eventId});
		save.subscribe(result => {
			this.isLoading = false;
      		this.shoppingCartService.setCurrentState(result);
			if(result && result.CurrentState){
				
				this.shoppingCartService.setCurrentState(result);
				if(result["CurrentState"] == 1){
					this.shoppingCartService.getCartSummary();
					this.eventState = result["State"]["Event"];

					this.filteredPerformances = this.stateData['Performances'].map(p => Object.assign({}, p));

					for(let i = 0; i < Object.keys(this.stateData["Performances"]).length;i++ )
					{
						for(let a = 0; a < this.stateData["Performances"][i]["Products"].length;a++) 
						{	
							for(let c = 0; c < this.stateData["Performances"][i]["Products"][a]["Variants"].length; c++) {
								this.countOfSelected[this.stateData["Performances"][i]["Products"][a]["Variants"][c]['Id']] = this.stateData["Performances"][i]["Products"][a]["Variants"][c]['CountOfProductsSelected']
							}
						}
					}
									
				}
			}
		}, error => {
			this.isLoading = false;
			let result = this.shoppingCartService.handleStateError(error);
			if(result['action'] == 'notifyAndRedirect'){
				this.notificationService.add({text:result['notification'], type:'warning'});
				this.router.navigate(result['routerLink']);
			}else{
				this.notificationService.add({text:error['Message'], type:'warning'});
			}
		});
		
		this.shoppingCartService.cartItemsSubject.subscribe(items => {
			
			if (items['cartItems'] && items['cartItems'].length > 0) {
				this.cartItemsData = items['cartItems'];
				this.cartItemsData.length ?  this.showMenu = true : this.showMenu = false ;
				this.listBasketObject(this.cartItemsData);
				this.isFurtherStepAllowed = false;				
				this.cartTotal = items['subTotal'];
				this.cartCurrency = items['currency'];
			} else {
				this.mainLoaderService.updateButtonStatus(true);
				this.mainLoaderService.updateButtonPromising(false);
				this.isFurtherStepAllowed = false;
				this.cartItemsData = null;
				this.showMenu = false;
				this.cartTotal = null;
				this.cartCurrency = null;
			}
		});	
		
	}
	ngOnDestroy(){
		if(this.subscription) this.subscription.unsubscribe();
		this.shoppingCartService.data.next([]);
	}

	ngAfterViewInit(){
		this.isFurtherStepAllowed = false;
		if(this.authenticationService.getAuthenticatedUser()) {
			this.isAuthenticatedRole = this.authenticationService.roleHasAuthenticate(AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN, AuthenticationService.ROLE_BOX_OFFICE);
			this.changeDetectorRef.detectChanges();
		}else{
			this.authenticationService.user$.subscribe( user => {
				this.isAuthenticatedRole = this.authenticationService.roleHasAuthenticate(AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN, AuthenticationService.ROLE_BOX_OFFICE);
				this.changeDetectorRef.detectChanges();
			});
		}
	}

	listBasketObject(list:any) {
		for(this.basketList of list) {
			 this.basketList = this.basketList['products'];
		}
	}

	maxProductCount(product){
		return (product && product['MaxAllowedCountOfProducts'] && product['MaxAllowedCountOfProducts'] > 0) ? product['MaxAllowedCountOfProducts'] : 0;
	}
	
	compareCountDif(variantId,count):boolean {
		let hasChange = this.basketList.find(result => result.id === variantId && result.count != count);
		if(hasChange != undefined) {
			return true;
		}
		else {
			return false;
		}
	}
	comparisonObjectData(comp:Object,comp2:Object) {

		let updatedObject: Object = Object.assign({},comp2);

		if(this.basketList.length > 0) {
			this.basketList.map(result => { updatedObject[result.id] = result.count  })			
		}
		if(isEqual(comp,updatedObject) !== true && this.basketList.length > 0) {
			this.isFurtherStepAllowed = true;
		}
		else {
			this.isFurtherStepAllowed = false;
		}
	}
	
	calculationData(data:any) {
		let arraySum = []
		for(let sum in data) {
			arraySum.push(data[sum]);
		}
		
		const summation = arraySum.reduce((a,b) => {
			return a + b;
		});

		return summation;
	}

	onSave(event){
		switch(event.action){
			case "addToCart":
			case "selectSeat":
				this.isLoading = false
				let selectedVariants = [];
				let keys = Object.keys(this.selectedVariants);
				keys.forEach(k => {
          			if(selectedVariants.indexOf(event.product) == -1)
          				{
            				selectedVariants.push({VariantId:k, Count: this.selectedVariants[k]});
          				}			
				});
				this.shoppingCartService.addToCart(selectedVariants).subscribe(result => {
					
				});
				this.selectedVariants = [];
			break;
			case "countChange":
				
				if(event.count >= 0){						
					
						if(event.count != event.countOfSelected)
						{	
							this.selectedVariants[event.variantId] = event.count;							
							this.currentValue[event.variantId] = this.selectedVariants[event.variantId];	
						}
						this._firstComparisonData[event.variantId] = event.count;
						this._secondComparisonData[event.variantId] = event.countOfSelected;

						this.comparisonObjectData(this._firstComparisonData,this._secondComparisonData);
						
						

				}

				if(this.calculationData(this._firstComparisonData) === 0 ) {
					this.isAddDisable = true;
					this.isFurtherStepAllowed = false;
				}
				else {
					this.isAddDisable = false;
				}
										
			break;
	  case "ToCart":
		this.mainLoaderService.updateButtonStatus(true);
		event.proceed === true ? this.isFurtherStepAllowed = true : this.mainLoaderService.updateButtonPromising(true);
		this.isFurtherStepAllowed = this.compareCountDif(event.variantId,event.count);
		this.cartItemList = [];		
		for(let variant in this.selectedVariants  ) {
			if(this.selectedVariants.hasOwnProperty(variant)) {
				let countValue = this.selectedVariants[variant];
				this.cartItemList.push({
					VariantId: variant,
					Count: countValue
				})
			}
		}

        this.addToCartPromise(this.cartItemList).then(results => {
			let result = results["State"]["Event"];
			if(results) {
				for(let i = 0; i < Object.keys(result["Performances"]).length;i++ )
				{
					for(let a = 0; a < result["Performances"][i]["Products"].length;a++) 
					{	
						for(let c = 0; c < result["Performances"][i]["Products"][a]["Variants"].length; c++) {
							this.countOfSelected[result["Performances"][i]["Products"][a]["Variants"][c]['Id']] = result["Performances"][i]["Products"][a]["Variants"][c]['CountOfProductsSelected']
						}
					}
				}
				return true;
			}
			else
			{
				return false;
			}
        }).then(val => {
			if(val)
			{
				event.proceed === true ? this.goToBasket() : this.shoppingCartService.getCartSummary() ;
				this.mainLoaderService.updateButtonStatus(false);
				this.mainLoaderService.updateButtonPromising(false);
			}	
		});
      break;
	
	}
	}
	addToCartPromise(resolver:any ) {
	    return new Promise(resolve => {
		  this.shoppingCartService.addToCart(resolver).subscribe(result => {
				resolve(result);
			},(err) => {
				throw(err);
			},() => {
				this.mainLoaderService.updateNarrow(false);
				//this.shoppingCartService.getCartSummary();
			});
	    })
  }

	onCountChanges(event) {
    	this.seVa[event.variantId]
  	}

	toggle($event,index) {
		this.isToggleOpen[index] = $event;
	}

	actionHandler(event) {
		switch(event.action){
			case 'refreshState':
				if(event.state["State"]["Event"]) {
					this.eventState = event.state["State"]["Event"];
					this.filteredPerformances = this.stateData['Performances'].map(p => Object.assign({}, p));
				}
				
			break;
			case 'error':
				let error = event.validation.map(err => {
					return err['ValidationError'] + ' <br>';
				});
				this.notificationService.add({text:error, type:'warning'})
			break;
			case 'emptyfield':
				
			break;
		}
	}

	countHandler(event) {
		//console.log(event);
	}

	getCampaignData(campaign) {
		return this.campaignData = [{
			Name: campaign.Reason_Desc
		}]
	}

	getColor(type:any) {
		return this.allocationTypeColor[this.allocationType[type]];
	}
	private goBack(){
		this.router.navigate(['boxoffice']);
	}

	filterProducts(selectedPillIds) {
		this.filteredPerformances = this.stateData['Performances'].map(p => Object.assign({}, p));
		if (selectedPillIds && selectedPillIds.length) {
			this.filteredPerformances.forEach(performance => {
				performance.Products = performance.Products.filter(product => selectedPillIds.includes(product.Id));
			});
			this.filteredPerformances = this.filteredPerformances.filter(p => p.Products.length > 0);
		}
	}
	// Customer Modal Catch

	customerChangeHandler(event) {
		this.userEventCatch(event);
	}

	customerActionEvent(event) {
		if(event.action != 'edit')
		{
		this.userEventCatch(event.customer);
		}
	}

	userEventCatch(user) {
		
		if (user === null) {
			
			this.shoppingCartService.setCustomEndpoint('CreateShoppingSession?includeStateModel=true',true);
			let clearShoppingSession = this.shoppingCartService.create({});
			clearShoppingSession.subscribe(() => {
				this.shoppingCartService.removeCartUser();
				this.shoppingCartService.getCartSummary();
				this.router.navigate(['boxoffice','events']);
			},err => {
			})
			//this.router.navigate(['boxoffice','events']);
			return;
			
		};
		if(!user['TCNumber'] && !user['NationalIdentityNumber']){
			user['TCNumber'] = '';
		}
		if(user['NationalIdentityNumber']){
			user['TCNumber'] = user['NationalIdentityNumber'];
		}

		let headers = new Headers({
			'accept': 'application/json',
			'content-type': 'application/json',
			'Accept-Language': 'tr-tr',
		});
		headers.append('Authorization', 'bearer ' + this.authenticationService.getToken());

		let options = new RequestOptions({ headers: headers });
		let userCity = this.storeService.getData('LCity').find(city => {
			return (city.Id == user.City);
		});
		let userTown = this.storeService.getData('LTown').find(town => {
			return (town.Id == user.Town);
		});
		let memberInfo = {
			"FirstName": user.Name,
			"FamilyName": user.Surname,
			"Email": user.Email,
			"PhoneNumber": user.PhoneNumber,
			"CitySubdivisionName": userTown && userTown.Name ? userTown.Name : "-",
			"CityName": userCity && userCity.Name ? userCity.Name : "-",
			"Address": "test",
			"Country": "Türkiye",
			"NationalIdentityNumber": user.TCNumber
		};
		let channelCode = this.authenticationService.getUserChannelCode();
		let firmCode = this.authenticationService.getUserFirmCode();
		let setMemberInfo = this.http.post(
			this.shoppingCartService.getBaseUrl() + '/' + firmCode + '/' + channelCode + '/Transaction/SetMemberInfo',
			memberInfo,
			options
		);
		setMemberInfo.subscribe(result => {
			this.notificationService.add({ text: 'Müşteri eklendi.', type: 'success',timeOut:1500 });
			this.shoppingCartService.setCartUser(user);
		}, error => {
			this.notificationService.add({ text: 'Müşteri sepete eklenemedi, eksik bilgi.', type: 'warning', timeOut:3000 });
		});

	}	
	goToBasket() {
		
		this.shoppingCartService.setCurrentState(this.shoppingCartService.getCurrentState());
		 if (this.shoppingCartService.getCartUser()) {
			 		this.shoppingCartService.removeSeat();
					if (this.shoppingCartService.getSelectedSeat()) {					
							this.shoppingCartService.setCustomEndpoint('SelectSeats?includeStateModel=true', true);
	            			let save = this.shoppingCartService.create(this.shoppingCartService.getSelectedSeat());
							save.subscribe(result => {
							//this.shoppingCartService.setCurrentState(this.shoppingCartService.getCurrentState());
							this.shoppingCartService.setCustomEndpoint('GetCurrentState?includeStateModel=true', true);
							this.shoppingCartService.query({});
							this.subscription = this.shoppingCartService.data.subscribe(results => {
								
								if (results && results['CurrentState'] == 4) {
									this.router.navigate(['boxoffice', 'basket']);
								}
								if (results && results['CurrentState'] == 2) {
									this.router.navigate(['boxoffice', 'select-seat']);
								}
								if(result && results['CurrentState'] == 8) {
									this.router.navigate(['boxoffice','collect-data']);
								}
							},error=>{
							      let result = this.shoppingCartService.handleStateError(error);
							      if(result['action'] == 'notifyAndRedirect'){
									
							        this.notificationService.add({text:result['notification'], type:'warning'});
							        this.router.navigate(result['routerLink']);
							      }else{
									
							        this.notificationService.add({text:error['Message'], type:'warning'});
							      }
							})
						},error =>{
							  let result = this.shoppingCartService.handleStateError(error);
							  
						      if(result['action'] == 'notifyAndRedirect'){
								
						        this.notificationService.add({text:result['notification'], type:'warning'});
						        this.router.navigate(result['routerLink']);
						      }else{
								
						        this.notificationService.add({text:error['Message'], type:'warning'});
						      }
						})
					} else {
						
						this.proceedCard();
					}
		 }else  {		
			 this.isFurtherStepAllowed = false;	 
			 this.notificationService.add({ text: 'Devam etmek için müşteri bilgisi eklemeniz gerekmektedir.', type: 'warning',timeOut:3000 });
		 }
	}
	proceedCard() {
		this.shoppingCartService.setCustomEndpoint('GotoBasket?includeStateModel=true',true);
		let subs = this.shoppingCartService.create({});
		this.isBasketLoading = true;
		subs.subscribe(results => {
			if (results && results['CurrentState'] === 4
						&& results['State']
						&& results['State']['UnassignedProducts']
						&& results['State']['UnassignedProducts'].length > 0) {
							let event;
							this.isBasketLoading = false;
							if (results['State']['UnassignedProducts'][0]) {
								if (results['State']['UnassignedProducts'][0]['Reason']) {
									this.notificationService.add({
										type: 'warning',
										text: results['State']['UnassignedProducts'][0]['Reason']
									});
								} else {
									this.isBasketLoading = false;
									this.notificationService.add({
										type: 'warning',
										text: 'Seçtiğiniz adet kadar yanyana koltuk bulunmamaktadır.'
									});
								}
								event = results['State']['UnassignedProducts'][0]['Event'] || '';
							}
							this.shoppingCartService.goBack().subscribe(
								response => {
								this.shoppingCartService.setCurrentState(response);
								let goback = this.shoppingCartService.redirectToCorrectStateRoute();
							//	this.resetIcon = 'delete';
							});
			} else if (results && results['CurrentState'] == 4) {
				this.isBasketLoading = false;					
				this.router.navigate(['boxoffice', 'basket']);
				
			}		
			if (results && results['CurrentState'] == 2) {
				this.isBasketLoading = false;
				this.router.navigate(['boxoffice', 'select-seat']);
			}
			if(results && results['CurrentState'] == 8) {
				this.isBasketLoading = false;
				this.shoppingCartService.setCurrentState(results);
				this.router.navigate(['boxoffice','collect-data']);
			}
		}, error => {
				this.isBasketLoading = false;
					let result = this.shoppingCartService.handleStateError(error);
					
				if(result['action'] == 'notifyAndRedirect'){
					this.isBasketLoading = false;  
					this.notificationService.add({text:result['notification'], type:'warning'});
					this.router.navigate(result['routerLink']);
				}else{
					this.isBasketLoading = false;  
					this.notificationService.add({text:error['Message'], type:'warning'});
				}
		});
	}
	
	eventHandler(e) {
		switch(e.state) {
			case 'ADD':
				this.onSave({action:'ToCart'});
			break;
			case 'BASKET':
				this.goToBasket();
			break;
			case 'ADD_GO_BASKET':
			this.onSave({action:'ToCart',proceed:true});
			break;			
			case 'CLEAR_BASKET':
				this.resetBasket(this.cartItemsData);
			break;
 
		}
	}
	handleBasketAction(event) {
		switch (event.action) {
			case "removeProduct":
				if(this.shoppingCartService.getCurrentState()['CurrentState'] == 1)
				{
					this.shoppingCartService.setCustomEndpoint('SelectEvent?includeStateModel=true',true);
					let save = this.shoppingCartService.create({'EventId': event.modelId });
					save.subscribe( result => {
						if(result) {									
							this.shoppingCartService.removeFromCart(event.variantId);
							this.countOfSelected[event.variantId] = 0;
						}
					})									
				}
				else
				{
					this.shoppingCartService.goBack().subscribe( goBackResult => {
						let goback = this.shoppingCartService.redirectToCorrectStateRoute();
						this.router.navigate(goback['routerLink']);										
					});						
				}
				break;
		}
	}	
	redirectLink(link:Array<Object>): Promise<any> {
		return this.router.navigate(link);
	}
	resetBasket(event) {
		
		this.promiseBasket().then(result => {	
			this.shoppingCartService.removeFromCart(result);
			for(let i = 0; i < Object.keys(result).length; i++)
			{
				this.countOfSelected[result[i]] = 0;				
			}			
			
		}).then( onDelete => {
			this.mainLoaderService.updateButtonStatus(false);
			this.mainLoaderService.updateButtonPromising(false);
			this.basketList = [];
			this.deleteList = [];
		})
	}
	promiseBasket() {
		return new Promise ( resolve => {
			if(Object.keys(this.cartItemsData).length > 0 && this.shoppingCartService.getCurrentState()['CurrentState'] == 1 )
			{
				this.shoppingCartService.setCustomEndpoint('SelectEvent?includeStateModel=true',true);
				for(let i = 0; Object.keys(this.cartItemsData).length; i++){
					for(let a = 0; a < this.cartItemsData[i]['products'].length; a++){
						if(this.deleteList.indexOf(this.cartItemsData[i]['products'][a].id) ==  -1) {
							this.deleteList.push(this.cartItemsData[i]['products'][a].id);
							resolve(this.deleteList);
						}			
					}
				}
			}
      });
	}

	openAddToBasketWithCodeModal() {
		let component: ComponentRef<AddToBasketWithCodeComponent> = this.resolver.resolveComponentFactory(AddToBasketWithCodeComponent).create(this.injector);
		this.addReservationCode = component.instance;
		this.tetherService.modal(component,{
			escapeKeyIsActive: true,
			dialog: {
			  style: { maxWidth: "400px", width: "80vw", height: "55vh" }
			},
		}).then( reservationResult => {
		  // Reservasyon Kodu Ekleme
		  this.isLoading = true
		  this.shoppingCartService.setCustomEndpoint('SetReservation?includeStateModel=true',true);
		  let reservationCode = this.shoppingCartService.create(reservationResult);
		  reservationCode.subscribe( result => {
			  this.isLoading = true;
			  if(result && result["State"]) {
				  this.shoppingCartService.setCurrentState(result);
				  if(result["CurrentState"] == 1){
					  this.resCodeEvent = result["State"]["Event"]["Id"];
					  this.redirectLink(['boxoffice']).then(result => {
						  result == true ? this.router.navigate(['boxoffice',this.resCodeEvent,'products']) : null;
					  })
				  }
			  }
		  },
		  error => {
			  this.isLoading = false
			  let result = this.shoppingCartService.handleStateError(error);
			  if(result['action'] == 'notifyAndRedirect'){
				  this.notificationService.add({text:result['notification'], type:'warning'});
  
				  this.router.navigate(result['routerLink']);
			  }else{
				  this.notificationService.add({text:error['Message'], type:'warning'});
			  }
		  });
		}).catch(result => {
					  
		  });
  
	  }	

}
