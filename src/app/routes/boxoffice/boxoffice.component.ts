import { Event } from './../../models/event';
import { BoxofficeService } from './../../services/boxoffice.service';
import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { AddToBasketWithCodeComponent } from './../../modules/boxoffice-module/common/add-to-basket-with-code/add-to-basket-with-code.component';
import { AuthenticationService } from './../../services/authentication.service';
import { Component, OnInit, HostBinding, ViewChild, ChangeDetectorRef, ComponentRef, Injector, ComponentFactoryResolver, Inject, Input } from '@angular/core';
import { ShoppingCartService } from '../../services/shopping-cart.service';
import { NotificationService } from '../../services/notification.service';
import { HeaderTitleService } from '../../services/header-title.service';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Http, URLSearchParams, Headers, RequestOptions } from "@angular/http";
import { OkcVariables } from '../../classes/okc-variables';
import { StoreService } from '../../services/store.service';
import { MainLoaderService } from './../../services/main-loader.service';
declare var $: any;


@Component({
	selector: 'app-boxoffice',
	templateUrl: './boxoffice.component.html',
	styleUrls: ['./boxoffice.component.scss'],
	entryComponents:[AddToBasketWithCodeComponent]
})
export class BoxofficeComponent implements OnInit {
	public userData: Object = null;
	cartItemsData: Object[];
	isAuthenticatedRole: boolean;
	selectedType: any = "1";
	customerSearchResult: Observable<{ title: string, list: any[] }[]>;
	okcVariables = OkcVariables;
	subscription;
	resCodeEvent:Object[];
	narrowLoading:boolean = false;
	cartTotal: number;
	cartCurrency: string;
	expiresIn : number;
	deleteList = [];
	isContentLoading: boolean = false;
	isBasketLoading : boolean = false;
	subscribers:any = {};
	asideStatus:boolean = true;
	basketClearLoader:boolean = false;
	addReservationCode: AddToBasketWithCodeComponent;
	resetIcon:string = 'delete';
	canDelete:boolean = false;
	routerEventSubscribe;
	showForThisRoute = true;
	quickSaleEvent: Event;
	quickSaleEventRedirectIsActive: boolean;
	@Input() assideControl:boolean = true;
	currentState;
	constructor(
		private shoppingCartService: ShoppingCartService,
		private boxofficeService: BoxofficeService,
		private router: Router, 
		private route: ActivatedRoute,
		private headerTitleService: HeaderTitleService,
		private http: Http,
		private authenticationService: AuthenticationService,
		private notificationService: NotificationService,
		private changeDetectorRef: ChangeDetectorRef,
		private storeService : StoreService,
		private resolver: ComponentFactoryResolver,
		private injector: Injector,
		public tetherService: TetherDialog,
		private mainLoaderService: MainLoaderService
	
	) {
	}
	//pills : Array <any> = [{text:'BUGÜN', filter:'Type eq 2', count:'5', isActive:true},{text:'YARIN', filter:'Type eq 1', count:'88', isActive:false},{text:'HAFTASONU', filter:'Type eq 3', count:'15', isActive:false}];
	onResize(event) { }
	ngOnInit() {
		this.resetIcon = 'delete';

		this.asideStatus = true;
		this.headerTitleService.setTitle('Box Office');
		this.headerTitleService.setLink('/boxoffice');
		this.mainLoaderService.updateLoading(true);

		this.mainLoaderService.loadingHandler.subscribe(result => this.isContentLoading = result.isloading);
		
		
	}
	ngAfterViewInit(){
		this.setSettingsByUrl(this.router.url);
		this.routerEventSubscribe = this.router.events.subscribe((event: any) => {
			if(event instanceof NavigationEnd) {
				this.setSettingsByUrl(event.url);
			}
		})
		if(this.authenticationService.getAuthenticatedUser()) {
			this.isAuthenticatedRole = this.authenticationService.roleHasAuthenticate(AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN, AuthenticationService.ROLE_BOX_OFFICE);
			this.changeDetectorRef.detectChanges();
		}else{
			this.authenticationService.user$.subscribe( user => {
				this.isAuthenticatedRole = this.authenticationService.roleHasAuthenticate(AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN, AuthenticationService.ROLE_BOX_OFFICE);
				this.changeDetectorRef.detectChanges();
			});
		}

		this.boxofficeService.quickSaleEvent.subscribe( event => {
			if(event && event.Id) {
				this.quickSaleEvent = event;
				if(this.quickSaleEventRedirectIsActive) this.router.navigate(['boxoffice', event.Id, 'products']);
			}else{
				this.quickSaleEvent = null
			}
		});
	}

	setSettingsByUrl(url: string) {
		this.quickSaleEventRedirectIsActive = url === "/boxoffice" || url === "/boxoffice/events";
		if(this.quickSaleEventRedirectIsActive && this.quickSaleEvent) this.router.navigate(['boxoffice', this.quickSaleEvent.Id, 'products']);
		this.showForThisRoute = !(url === "/boxoffice" || url === "/boxoffice/events" || url === "/boxoffice/select-seat");
	}

	onSave(event) {
		
	}

	customerChangeHandler(event) {
		this.userEventCatch(event);
	}

	userEventCatch(user) {
/* 		if (!user) {
			
			this.shoppingCartService.setCustomEndpoint('CreateShoppingSession?includeStateModel=true',true);
			let clearShoppingSession = this.shoppingCartService.create({});
			clearShoppingSession.subscribe(() => {
				this.shoppingCartService.removeCartUser();
				this.shoppingCartService.getCartSummary();
				this.router.navigate(['boxoffice','events']);
			},err => {
				console.log("CShoppingSession Error",err);
			})
			
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
		}); */

	}	
	resetBasket(event) {
		console.log("Reset Event",event);
		this.promiseBasket().then(result => {
			this.shoppingCartService.removeFromCart(result);
		}).then( onDelete => {
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
			else if( this.shoppingCartService.getCurrentState()['CurrentState'] == 4 ) {
				this.cartItemsData.forEach( results => {
					results['products'].forEach(element => {
						this.deleteList.push(element['id']);
					});
				})
				if(this.deleteList.length > 0)
				{
						this.shoppingCartService.setCustomEndpoint('CancelProducts', true);
						let productIds = {"ProductIds": this.deleteList};
						let cancelProducts = this.shoppingCartService.create(productIds);
						cancelProducts.subscribe(result=>{
							console.log("Cancel Prodcuts Result",result);
							this.shoppingCartService.setCurrentState(result);
							//this.shoppingCartService.flushCart();
							this.router.navigate(['/boxoffice']);
						}, error => {
							this.notificationService.add({ text: error['Message'], type: 'warning' })				
					});
				}				

			}
			else {
				this.shoppingCartService.setCustomEndpoint('SelectEvent?includeStateModel=true',true);
				this.shoppingCartService.goBack().subscribe( goBackResult => {
					console.log("Go Back Results",goBackResult);
					this.shoppingCartService.setCurrentState(goBackResult);
					let goback = this.shoppingCartService.redirectToCorrectStateRoute();
					this.resetIcon = 'delete';
					this.router.navigate(goback['routerLink']);										
				});	
	
			}
      });
	}




}
