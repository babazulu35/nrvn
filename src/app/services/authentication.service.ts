import { Firm } from './../models/firm';
import { Roles } from './../models/roles';

import { BaseDataService } from './../classes/base-data-service';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestMethod, URLSearchParams } from "@angular/http";
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { LocalStorageService } from 'angular-2-local-storage';


import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import { User } from '../models/user';
import { NotificationService } from './notification.service';

@Injectable()
export class AuthenticationService {

    static readonly ROLE_SUPER_ADMIN: string = Roles.ROLE_SUPER_ADMIN;
    static readonly ROLE_FIRM_ADMIN: string = Roles.ROLE_FIRM_ADMIN;
    static readonly ROLE_BOX_OFFICE: string = Roles.ROLE_BOX_OFFICE;
    static readonly ROLE_CALL_CENTER: string = Roles.ROLE_CALL_CENTER;
    static readonly ROLE_PROMOTER: string = Roles.ROLE_PROMOTER;
    static readonly ROLE_CMS: string = Roles.ROLE_CMS;

    public tokenExpiresInTime$: BehaviorSubject<number> = new BehaviorSubject(0);
    private baseUrl: string;
    private token: string;
    private refreshToken: string;
    private expiresIn : number;
    private user: BehaviorSubject<User> = new BehaviorSubject(null);
    public user$ = this.user.asObservable();

    private authenticatedUser: User;
    private promoter: Firm;
    public promoter$: BehaviorSubject<Firm> = new BehaviorSubject(null);
    public firm: Firm;
    public firm$: BehaviorSubject<Firm> = new BehaviorSubject(null);
    redirectUrl: any;
    private retryLoginCount: number = 1;

    isLoggedIn: boolean = false;
    isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    // Two-Factor authentication -- MT
    private otpValidatedMemberId: number;
    private localeId: string = "tr-tr";

    private loginParams : Array<string>;
    constructor(
        private http: Http,
        private router: Router,
        private localStorageService: LocalStorageService,
        private notificationService : NotificationService,
    ) {
        this.baseUrl = environment.api.host + '/' + environment.api.path;
        let account = this.localStorageService.get('account');
        if(account) {
            this.token = account["token"] ? account["token"].toString() : null;
            this.refreshToken = account['refreshToken'] ? account['refreshToken'].toString() : null;
        }
        let user = this.localStorageService.get('user');
        if(user) {
            this.authenticatedUser = new User(user);
            this.user.next(this.authenticatedUser);
            this.user.complete();
            if(this.token && this.authenticatedUser) this.loginComplete();
        }else{
            if(this.token) this.getUser(this.token).subscribe(response => {
                this.loginComplete();
            }, error => {
                this.notificationService.add({type: "danger", text: error.Message});
            });
        }
    }
    login(username: string, password: string, promoterCode?: string, params?:any): Observable<any> {
        this.token = null;

        // if (username == "noservice" && password == "nirvana") {
        //     let user = new User();
        //     user.UserName = username;
        //     this.authenticatedUser = user;
        //     this.user.next(this.authenticatedUser);
        //     this.user.complete();
        //     this.loginComplete();
        //     return this.user$;
        // }
        let json = {
			'UserName': username,
			'Password': password,
            'PromoterCode': promoterCode,
			'grant_type': "refresh_token",
		}

        json['FirmCode'] = params.firmCode,
        json['ApiKey'] = params.apiKey;
        json['ChannelCode'] = params.channelCode;
        if(params.terminalId){
        	json['TerminalId'] = params.terminalId;
        }
        this.loginParams = params;
        let headers = new Headers({
            'accept': 'application/json',
            'content-type': 'application/json',
            'Accept-Language': this.localeId,
        });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.baseUrl + '/' + 'Token',
        	json,
        	options)
            .flatMap(
            	response => {
	                this.token = response.json().access_token;
                    this.refreshToken = response.json().refresh_token;
                    this.expiresIn = response.json().expires_in;
                    this.localStorageService.set('account', {
                        token: this.token,
                        refreshToken: this.refreshToken,
                        expiresIn: this.expiresIn,
                        tokenTime: new Date().getTime()
                    });
	                if(this.token){
                        this.redirectUrl = "/";
	                	return this.getUser(this.token);
	                }
            }
        );
    }

    recoverPassword(username: string, email: string) {
        let headers = new Headers({
            'accept': 'application/json',
            'accept-language': this.localeId,
            'content-type': 'application/json'
        });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.baseUrl + '/Account/ResetPassword', { "UserName": username, "Email": email }, options)
            .map(response => response.json());
    }

    logout( navigate : boolean = true) {
        if(!this.isLoggedIn) return;
        this.notificationService.notifications.next(null);
        this.localStorageService.remove('user');
        this.localStorageService.remove('token');
        this.localStorageService.remove('account');
       //this.localStorageService.remove('isCartCreated')
        this.token = null;
        this.authenticatedUser = null;
        this.isLoggedIn = false;
        this.isLoggedIn$.next(this.isLoggedIn);
        this.tokenExpiresInTime$.next(0);
        if(navigate){
        	this.router.navigateByUrl("/login");
        }
    }
    loginComplete() {
        if (this.authenticatedUser) this.authenticatedUser.isReady = true;
        this.isLoggedIn = true;
        this.isLoggedIn$.next(this.isLoggedIn);
        this.retryLoginCount = 1;
        this.redirect();
    }

    redirect() {
        if (this.redirectUrl){
        	let redirectUrl = this.redirectUrl;
        	this.redirectUrl = null;
        	this.router.navigate([redirectUrl]);
        }
    }

    refreshLogin(redirectTo : Array<string> = null): Observable<any>{
        this.redirectUrl = redirectTo;
        let json = {
			'refresh_token': this.refreshToken,
			'grant_type': "refresh_token",
		}
        let headers = new Headers({
            'accept': 'application/json',
            'content-type': 'application/json',
            'Accept-Language':this.localeId,
        });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.baseUrl + '/' + 'Token',
        	json,
        	options)
            .flatMap( response => {
                    this.token = null;
	                this.token = response.json().access_token;
	                this.expiresIn = response.json().expires_in;
                    this.localStorageService.set('account', {
                        token: this.token,
                        refreshToken: this.refreshToken,
                        expiresIn: this.expiresIn,
                        tokenTime: new Date().getTime()
                    });
                    this.loginComplete();
                    return Observable.of(this.localStorageService.get('account'));
            })
            .catch( (error) => {
                return Observable.throw(error.json());
            });
    }

    retryLoginOrLogout(): Promise<any> {
        this.retryLoginCount--;
        if(this.retryLoginCount < 0) return;
        let self = this;
        return new Promise(function(resolve, reject) {
            self.refreshLogin().subscribe( result => {
                resolve( self.localStorageService.get('account') );
            }, error => {
                self.logout();
                reject(error);
            });
        });
    }

    setPromoter(promoter: Firm){
        this.promoter = promoter;
        this.promoter$.next(this.promoter);
    }

    setFirm(firm: Firm){
        this.firm = firm;
        this.firm$.next(this.firm);
    }

    getPromoter():Firm {
        return this.promoter;
    }

    private getUser(token): Observable<any> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'bearer ' + token);
        let options = new RequestOptions({ headers: headers });
        if (token) {
            return this.http.get(this.baseUrl + '/' + 'Account/GetUserInfo', options).map(
                response => {
                	let user = new User(response.json());
                    this.authenticatedUser = user;
                    this.user.next(this.authenticatedUser);
                    this.user.complete();
                    if(this.loginParams){
                        this.authenticatedUser.FirmCode = this.loginParams['firmCode'];
                        this.authenticatedUser.ChannelCode = this.loginParams['channelCode'];
                        this.authenticatedUser.ApiKey = this.loginParams['apiKey'];
                        this.authenticatedUser.TerminalId = this.loginParams["terminalId"];
                    }
                    this.localStorageService.set('user', this.authenticatedUser);
                    return this.user$;
                },
                error => {
                    console.log("error : ", error.json());
                }
            )
        } else {
            return Observable.of([]);
        }
    }
    getToken(): string {
        return this.token;
    }
    getLocale():string {
        return this.localeId;
    }
    getRefreshToken(): string {
        return this.refreshToken;
    }
    getAuthenticatedUser() {
        return this.authenticatedUser;
    }
    getUserFirmCode(): string {
    	let authUser =  this.getAuthenticatedUser();
        return this.authenticatedUser ? this.authenticatedUser.FirmCode : null;
    }
    getUserFirmId(): number {
    	let authUser =  this.getAuthenticatedUser();
        return this.authenticatedUser ? this.authenticatedUser.FirmId : null;
    }
    getUserChannelCode(): string {
        return this.authenticatedUser ? this.authenticatedUser.ChannelCode : null;
    }
    getPromoterCode(): string {
        return this.promoter ? this.promoter["Code"] : null;
    }
    roleHasAuthenticate(...roles:any[]):boolean {
        if(!roles || !roles[0]) return true;
        if( Object.prototype.toString.call( roles[0] ) === '[object Array]' ) roles = roles[0];
        return !roles ? true : this.authenticatedUser && this.authenticatedUser.Roles && roles.find(item => this.authenticatedUser.Roles.find( role => item == role) != null) != null;
    }

    hasUserOnlyRole(role: string): boolean {
        if (this.authenticatedUser
            && this.authenticatedUser.Roles
            && this.authenticatedUser.Roles.length === 1
            && this.authenticatedUser.Roles[0] === role) {
                return true;
        }
    }

    // Two-factor authentication -- MT
    getOtpValidationInfo(memberId: number) {
		return memberId === this.otpValidatedMemberId;
	}

	setOtpValidatedMemberId(memberId: number) {
		this.otpValidatedMemberId = memberId;
	}

	resetOtpValidatedMemberInfo() {
		this.otpValidatedMemberId = 0;
	}

}
