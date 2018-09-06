import { EntityService } from './services/entity.service';
import { Firm } from './models/firm';
import { Observable } from 'rxjs/Observable';
import { NotificationService } from './services/notification.service';
import { User } from './models/user';
import { TetherDialog } from './modules/common-module/modules/tether-dialog/tether-dialog';
import { MainMenuComponent } from './modules/common-module/components/main-menu/main-menu.component';
import { Component, HostBinding, Input, OnInit, LOCALE_ID, Inject, Renderer, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Event as RouterEvent,NavigationStart,NavigationEnd,NavigationCancel,NavigationError,Router } from '@angular/router';
import { AppSettingsService } from './services/app-settings.service';
import { AuthenticationService } from './services/authentication.service';
import { ShoppingCartService } from './services/shopping-cart.service';
declare var jQuery;
import { LocalStorageService } from 'angular-2-local-storage';
declare let ga: Function;

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
	{ provide: 'firmService', useClass: EntityService },
  ]
})
export class AppComponent implements OnInit {
	@HostBinding('class.no-scroll') get noScroll():Boolean {
		return this.tetherService.isBodyLocked;
	};

	@HostBinding('class.wide-scroll') get hasWideScroll(): boolean { return  window["DeviceIntegrationInstance"] != null }
	@HostBinding('class.okc-screen') get hasOkcDevice(): boolean { return  window["DeviceIntegrationInstance"] != null }
	
	@HostBinding('class.is-menu-collapsed') get isMenuCollapsed():boolean { return this.tetherService.component.isMenuCollapsed };
	
	isLoading: boolean = false;
	private onPingSubscribe;

	private authenticatedUser: User;
	private expireAlertSettings: {
		userActionRemainingTime: number,
		expireAlertRemainingTime: number,
		expireConfirmationTime: number,
		forceRefreshTokenTime: number
	};
	private isUserWatchingActivated: boolean;
	private isExpireAlertActivated: boolean;

	private tokenTimer: Observable<number>;
	private tokenInterval: any;
	private tokenSubscription: any;
	private tokenExpireDate: Date;
	private tokenExpiresInTime: number;
	private confirmationIsActive: boolean;
	private forceToRefreshToken: boolean;
	private rememberMeIsActive: boolean = false;

	get isOnTokenExpired():boolean {
		return this.tokenExpiresInTime ? this.tokenExpiresInTime < 1000 : false;
	}

	constructor(
		@Inject('firmService') private firmService: EntityService,
		private tetherService:TetherDialog,
		private appSettingsService :AppSettingsService,
		private authService: AuthenticationService,
		private router: Router,
		private renderer: Renderer,
		private element: ElementRef,
		private localStorageService: LocalStorageService,
		private notificationService: NotificationService,
		private shoppingCartService: ShoppingCartService,
	) {
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				ga('set', 'page', event.urlAfterRedirects);
				ga('send', 'pageview');
			}
		});
	}

	ngOnInit() {
		this.expireAlertSettings = {
			userActionRemainingTime: 3*60,
			expireAlertRemainingTime: 2*60,
			expireConfirmationTime: 1*60,
			forceRefreshTokenTime: 10*60
		}
		this.authService.isLoggedIn$.subscribe( isLoggedIn => {
			if(isLoggedIn) {
				if(this.tokenSubscription) this.tokenSubscription.unsubscribe();

				this.authenticatedUser = this.authService.getAuthenticatedUser();
				this.getUserFirm();
				let accountStorage = this.localStorageService.get('account');
				let now: number = Math.floor(new Date().getTime() / 1000);
				let tokenTime: number = Math.floor(accountStorage["tokenTime"] / 1000) || now;
				let tokenRenewDuration: number = accountStorage["expiresIn"] - (now - tokenTime);
				//tokenRenewDuration = 80;
				this.tokenExpireDate = new Date((now + tokenRenewDuration)*1000);
				console.log("expire time : ", this.tokenExpireDate);
				if(tokenRenewDuration < this.expireAlertSettings.forceRefreshTokenTime) this.expireAlertSettings.forceRefreshTokenTime = tokenRenewDuration / 2;
				if(tokenRenewDuration > 0) {
					this.setTokenTimer();
				}else{
					if(this.rememberMeIsActive) this.retryOrLogout();
				}
			}else{
				this.logout();
			}
		});
	}

	ngAfterViewInit() {
        this.router.events.subscribe((event: RouterEvent) => {
            this.setPageSpinner(event);
		});

		//JS motoru bir sebeple donmuş, token süresi geçtiği halde algılamamış ve logout işlemi de henüz gerçekleşmemişse, pencere aktif olduğunda refreshLogin tetiklenir.
		let self = this;
		window.onfocus = function() {
			if(self.isOnTokenExpired && self.authenticatedUser) {
				self.retryOrLogout();
			}
		}
	}
	
	setTokenTimer() {
		if(!this.authenticatedUser) return;

		this.tokenTimer = Observable.timer(this.tokenExpireDate);
		this.tokenInterval = Observable.interval(1000).takeUntil(this.tokenTimer);
		this.tokenSubscription = this.tokenInterval.subscribe( 
			time => {
				this.tokenExpiresInTime = this.tokenExpireDate.getTime() - new Date().getTime();
				this.authService.tokenExpiresInTime$.next(this.tokenExpiresInTime);
				if(this.tokenExpiresInTime < this.expireAlertSettings.forceRefreshTokenTime*1000) this.refreshLogin();
				if(this.isOnTokenExpired) this.retryOrLogout();
			});
	}

	refreshLogin() {
		if(this.tokenSubscription) this.tokenSubscription.unsubscribe();
		this.authService.refreshLogin().subscribe( loginResult => {} );
	}

	expireToken() {
		this.logout();
	}

	retryOrLogout() {
		console.log("retryOrLogout");
		if(this.tokenSubscription) this.tokenSubscription.unsubscribe();
		this.authService.retryLoginOrLogout().then( result => {
			console.log("retry to refresh login: ", result);
		}).catch( error => {
			this.logout();
		});
	}

	logout() {
		console.log("logout");
		if(!this.authenticatedUser) return;
		if(this.tokenTimer) this.tokenTimer = null;
		if(this.tokenSubscription) this.tokenSubscription.unsubscribe();
		this.authService.logout();
		this.authService.resetOtpValidatedMemberInfo();
		this.authenticatedUser = null;
	}

	getUserFirm() {
		if(!this.authenticatedUser) return;
		this.firmService.data.subscribe( result => {
			if(result) {
				let firm: Firm = new Firm(result[0]);
				this.authService.setFirm(firm);
			}
		});
		this.firmService.setCustomEndpoint('GetAll');
		this.firmService.fromEntity('FFirm').where('Id', '=', this.authenticatedUser.FirmId).expand(['Localization']).page(0).take(1).executeQuery();
	}

    setPageSpinner(event): void {
        if (event instanceof NavigationStart) {
            this.isLoading = true;
        }
        if (event instanceof NavigationEnd) {
            this.isLoading = false;
        }
        if (event instanceof NavigationCancel) {
            this.isLoading = false;
        }
        if (event instanceof NavigationError) {
            this.isLoading = false;
        }
	}
}
