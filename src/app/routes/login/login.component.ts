import { AuthDialogBoxComponent } from './../../modules/common-module/components/auth-dialog-box/auth-dialog-box.component';
import { User } from './../../models/user';
import { LocalStorageService } from 'angular-2-local-storage';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { AppSettingsService } from '../../services/app-settings.service';
import { ShoppingCartService } from '../../services/shopping-cart.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild(AuthDialogBoxComponent) authDialogBox: AuthDialogBoxComponent;

  authAlert: {type: string, title: string, description: string}
  isAuthenticatedUser: boolean;
  advanceMessage: string;
  appSettings : AppSettingsService;
  isEkstraField:boolean = false;
  extraParams: {isFromApp: boolean, apiKey: string, firmCode: string, channelCode: string, terminalId : string} = {isFromApp:false, apiKey:'',firmCode:'',channelCode:'',terminalId:''};
  showSettings : boolean = false;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private appSettingsService:AppSettingsService,
    private localStorageService: LocalStorageService,
    private shoppingCartService: ShoppingCartService
  ) {
    this.appSettings = appSettingsService;
  }

  ngOnInit() {
    
  	let self = this;
    if(this.route.snapshot.data['action'] == 'logout'){
				this.shoppingCartService.setCustomEndpoint('CreateShoppingSession?includeStateModel=true',true);
				let resultSSession = this.shoppingCartService.create({});
				resultSSession.subscribe(() => {
					this.shoppingCartService.getCartSummary();
					this.shoppingCartService.removeCartUser();
          
				},(err) => {
					console.log("CreateShoppingSessionError",err);
				})
    	this.authService.logout();
      return;
    }
    let user:User = this.localStorageService.get('user') as User;
    if(user) {
      this.extraParams.apiKey = user.ApiKey || "";
      this.extraParams.firmCode = user.FirmCode || "";
      this.extraParams.channelCode = user.ChannelCode || "";
      this.extraParams.terminalId  = user.TerminalId.toString() || "";
    }

    if(window['AppSettingsManagerInstance']){
      this.showSettings = false;
    }else{
      this.showSettings = true;
      if(this.extraParams.apiKey && this.extraParams.firmCode && this.extraParams.channelCode){
			this.isEkstraField = false;
		}else{
			this.isEkstraField = true;
			setTimeout(function(){
        if(self.authDialogBox && self.authDialogBox.authForm) {
          self.authDialogBox.authForm.patchValue({
              'apiKey': self.extraParams.apiKey,
              'firmCode': self.extraParams.firmCode,
              'channelCode': self.extraParams.channelCode,
              'terminalId': self.extraParams.terminalId
          });
        }
			},300)
		}
	}

  }
  ngAfterViewInit(){
  }
  authSubmitEventHandler(event) {
    if(window['AppSettingsManagerInstance']){
      this.extraParams.apiKey = window['AppSettingsManagerInstance'].getApiKey();
      this.extraParams.firmCode = window['AppSettingsManagerInstance'].getFirmCode();
      this.extraParams.channelCode = window['AppSettingsManagerInstance'].getChannelCode();
      this.extraParams.terminalId = window['AppSettingsManagerInstance'].getTerminal();
      this.extraParams.isFromApp = true;
    }else{
      this.extraParams.isFromApp = false;
      if(event){
        this.extraParams.apiKey = event.apiKey;
        this.extraParams.firmCode = event.firmCode;
        this.extraParams.channelCode = event.channelCode;
        this.extraParams.terminalId = event.terminalId;
      }
    }
    this.authService.login(event.username, event.password, event.promoterCode, this.extraParams
    	).subscribe(
      response => {
      	this.appSettings.getClientSettings().subscribe(items => {
            this.appSettings.setClientSettings(items);
        });
        this.authService.loginComplete();
      },
      error => {
        this.authDialogBox.reset();
        this.authAlert = {
          type: "warning",
          title: "Kullanıcı adı veya parolanız hatalı",
          description: "Yeniden deneyin ya da parolamı unuttum linkine tıklayarak parolanızı sıfırlaryın."
        }
      }
    );
  }

  advanceAuthSubmitEventHandler($event) {
    this.authService.loginComplete();
  }

  toggleHandler(event) {
  	let self = this;
    this.isEkstraField = event;
    setTimeout(function(){
      self.authDialogBox.authForm.patchValue({
            'apiKey': self.extraParams.apiKey,
            'firmCode': self.extraParams.firmCode,
            'channelCode': self.extraParams.channelCode,
            'terminalId': self.extraParams.terminalId
        });
    },300)
  }

}
