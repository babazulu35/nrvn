import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, Headers } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseDataService } from "../classes/base-data-service";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './authentication.service';
import { environment } from '../../environments/environment';

@Injectable()
export class CrmMemberService extends BaseDataService {
	private httpThis;
	private headersThis: Headers = new Headers();
	private tokenThis: string;

	count: BehaviorSubject<number> = new BehaviorSubject(0);
	data: BehaviorSubject<any> = new BehaviorSubject({});
	queryParams: Object = {
		protectedFilter : null,
		filter: [],
		sort: [],
		pageSize: 10,
		page: 1
	};
	queryParamSubject: BehaviorSubject<Object> = new BehaviorSubject(this.queryParams);

	constructor(
		http: Http,
		storeService: StoreService,
		authenticationService: AuthenticationService
	) {
		super(http, 'Crm/CallService', storeService, authenticationService);

		// --------------- private fields in baseclass -------------------------
		this.httpThis = http;
		// this.setHeaderThis('Content-Type', 'application/json');
		// this.setHeaderThis('Accept-Language', 'tr-tr');
		// let token = this.authenticationService.getToken();
		// if (token) {
		// 	this.setHeaderThis('Authorization', 'bearer ' + token);
		// } else {
		// 	Observable.throw('Token Error');
		// }
		
		// ---------------------------------------------------------------------

		this.setStoreAvailability(false);
		this.setCustomApi('boxoffice');
	}

	searchCustomers(value, queryType, page = '0', limit = '10'){

		let queryString = '';
		queryString += 'page=' + page;
		queryString += '&limit=' + limit;
		queryString += '&query=' + value;
		queryString += '&queryType=' + queryType;

		let query = new URLSearchParams(queryString);

		let subscription = this.executePostAsGet(query, false);
		subscription.connect();
		return subscription;
	}

	getMemberFromID(memberId:number) {
		this.setCustomApi('backoffice');
		this.setCustomEndpoint('GetMemberInternal', true);

		let queryString = `MemberId=${memberId}`;

		let query = new URLSearchParams(queryString);

		let subscription = this.executePostAsGet(query, true);
		subscription.connect();
		return subscription;
	}

	getMembersWithIdList (memberIds: any) {
		this.setCustomApi('backoffice');
		this.setCustomEndpoint('GetMembersWithIdList', true);

		let queryParams = {securityKey: '52E8C979-7B31-424B-9016-FC3F6B467E37'};

		let subscription = this.postWithQueryParams(memberIds, queryParams);
		subscription.connect();
		return subscription;
	}


	getMemberDetailScreenModel(memberId: number) {
		this.setCustomApi('backoffice');
		this.setCustomEndpoint('GetMemberDetailScreenModel', true);

		let queryString = `MemberId=${memberId}`;

		let query = new URLSearchParams(queryString);

		let subscription = this.executePostAsGet(query, true);
		subscription.connect();
		return subscription;
	}

	sendNewVerificationCode(mobilePhone: string) {
		this.setCustomApi('backoffice');
		this.setCustomEndpoint('SendNewVerificationCode', true);
		let queryString = `mobilePhone=${mobilePhone}`;

		let query = new URLSearchParams(queryString);

		let subscription = this.executePostAsGet(query, true);
		subscription.connect();
		return subscription;
	}

	validateOTP(mobilePhone: string, mobileVerificationCode: string) {
		this.setCustomApi('backoffice');
		this.setCustomEndpoint('ValidateOTP', true);
		let validateOtpModel = {
			'MobilePhone': mobilePhone,
			'MobileVerificationCode': mobileVerificationCode
		}

		return this.executePost(validateOtpModel);
	}

	addMemberEmailForBackOffice(memberId: number, emailAddress: string, isDefault: boolean, isActivated: boolean) {
		this.setCustomApi('backoffice');
		this.setCustomEndpoint('AddMemberEmailForBackOffice', true);

		let addMemberEmailForBackOfficeModel = {
			'MemberId': memberId,
			'EmailAddress': emailAddress,
			'IsDefault': +isDefault,
			'IsActivated': +isActivated,
			'LinkURL': environment.emailValidation.linkUrl || ''
		};

		return this.executePost(addMemberEmailForBackOfficeModel);
	}

	disconnectSocialMedia(memberId: number, socialMedia: string) {
		this.setCustomApi('backoffice');
		this.setCustomEndpoint('RemoveMemberLicenseAndDisconnectSocialMedia', true);

		let disconnectSocialMediaModel;

		switch (socialMedia) {
			case 'Facebook':
				disconnectSocialMediaModel = {
					'MemberId': memberId,
					'DisconnectFacebook': true
				};
				break;
			case 'Spotify':
				disconnectSocialMediaModel = {
					'MemberId': memberId,
					'DisconnectSpotify': true
				};
				break;
			default:
				break;
		}

		return this.executePost(disconnectSocialMediaModel);

	}

	removeMemberLicense(memberId: number, licenseId: number) {
		this.setCustomApi('backoffice');
		this.setCustomEndpoint('RemoveMemberLicenseAndDisconnectSocialMedia', true);

		let removeMemberLicenseModel = {
			'MemberId': memberId,
			'LicenseId': licenseId
		}

		return this.executePost(removeMemberLicenseModel);
	}

	addMemberPhoneForBackOffice(memberId: number, phoneType: number, isDefault: boolean,
								isActivated: boolean, countryCode: string, areaCode: string, localNumber: string, phoneNumber: string) {
		this.setCustomApi('backoffice');
		this.setCustomEndpoint('AddMemberPhoneForBackOffice', true);

		let addMemberPhoneForBackOfficeModel = {
			'MemberId': memberId,
			'PhoneType': phoneType,
			'IsDefault': +isDefault,
			'IsActivated': +isActivated,
			'CountryCode': countryCode,
			'AreaCode': areaCode,
			'LocalNumber': localNumber,
			'PhoneNumber': phoneNumber
		}

		return this.executePost(addMemberPhoneForBackOfficeModel);
	}

	validateMemberPhoneForBackOffice(memberId: number, phoneNumber: string, mobileVerificationCode: string, oldPhone?: string) {
		this.setCustomApi('backoffice');
		this.setCustomEndpoint('ValidateMemberPhoneForBackOffice', true);

		let queryString = '';
		queryString += 'memberId=' + memberId.toString();
		queryString += '&phoneNumber=' + phoneNumber;
		queryString += '&mobileVerificationCode=' + mobileVerificationCode;

		if (oldPhone) {
			queryString += '&oldPhone=' + oldPhone;
		}

		let query = new URLSearchParams(queryString);

		let subscription = this.executePostAsGet(query, true);
		subscription.connect();
		return subscription;
	}

	executeQuery(){
		let query = this.getQuery();
		let subscription = this.executePostAsGet(query);
		subscription.connect();
		return subscription;
	}

	private executePostAsGet(queryParams: URLSearchParams, hasSingleRecord = false) {
		let options = { headers: this.getHeadersThis() };

		if (queryParams) {
			options['search'] = queryParams;
		}

		return this.httpThis.post(this.getApiUrl(), {}, options)
			.map((res) => {
				let obj = res.json();
				this.data.next(obj);
				return obj;
			})
			.catch((res) => this.handleErrorThis(res))
			.publishReplay(1).refCount().publish();
	}

	// ------------------- private fields in baseclass -------------------------
	private handleErrorThis(error: Response | any) {

		if(error.status == 401){
			let errorObject = JSON.parse(error['_body']);
			if(errorObject && errorObject['ErrorCode'] && errorObject['ErrorCode'] == 'AU005'){
				this.notificationService.add({text:'İlgili işlem için yetkiniz bulunmamaktadır.', type:'danger'});
			} else {
				this.authenticationService.retryLoginOrLogout().then( result => {
                    this.notificationService.add({type: "warning", text: "İşlem sırasında oturumunuz otomatik olarak güncellenmiştir. Son yaptığınız işlemi tekrarlayınız."});
                }).catch( reason => {});
				return Observable.throw(error.json());
			}
		} else {
			return Observable.throw(error.json());
		}
	}

	setHeaderThis(type : string, value : any){
		this.headersThis.append(type, value);
	}

	private getHeadersThis(): any {
		//return this.headersThis;
		return this.headers;
	}
	// -------------------------------------------------------------------------
}
