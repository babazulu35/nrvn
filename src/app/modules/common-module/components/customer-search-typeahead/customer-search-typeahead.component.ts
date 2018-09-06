import { SelectboxComponent } from './../../../base-module/components/selectbox/selectbox.component';
import { environment } from './../../../../../environments/environment';
import { Component, OnInit, HostBinding, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { Http, URLSearchParams, Headers, RequestOptions} from "@angular/http";
import { AuthenticationService } from "../../../../services/authentication.service";

import { Observable } from "rxjs/Observable";
import { TypeaheadComponent } from "../typeahead/typeahead.component";
import { PhoneFormatPipe } from './../../../../pipes/phone-format.pipe';
import { MaskStringPipe } from './../../../../pipes/mask-string.pipe';
@Component({
  selector: 'app-customer-search-typeahead',
  templateUrl: './customer-search-typeahead.component.html',
  styleUrls: ['./customer-search-typeahead.component.scss']
})

export class CustomerSearchTypeaheadComponent implements OnInit {
  @ViewChild(TypeaheadComponent) typeahead: TypeaheadComponent;
  @ViewChild(SelectboxComponent) querySelectBox: SelectboxComponent;
  @HostBinding('class.c-customer-search-typeahead') true;

  @Output() actionEvent:EventEmitter<any> = new EventEmitter();
  @Output() resultEvent:EventEmitter<any> = new EventEmitter();

  @Input() byCustomerTypes: boolean;

  queryType : number = 1;
  customerTypeValue: any;

  searchResults: Observable<{}> | Observable<{ title: string, list: { title?: string, icon?: string, MemberId: any,Name: string,Surname: string,DateOfBirth?: any,Gender: string,PhoneNumber: string,Email: string,ProfilePicture?: string, }[]}[]>;
  presets: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?: any}[] }[]> = Observable.of([]);

  placeholder: {};
  public selectedPlaceholder:string;
  public options:any;
  customerTypes: {value: any, label: string}[];

  constructor(
      private authenticationService : AuthenticationService,
      private http : Http
  ) { }

  ngOnInit() {

    this.options = [
      {'text':'İsim ile','value': 1},
      {'text': 'GSM ile','value': 2},
      {'text': 'E-posta ile','value': 3}
    ];

    this.placeholder = {
      '1':'İsme Göre Ara',
      '2': '05XX XXX XX XX',
      '3': '@'
    }

    if(this.byCustomerTypes) {
      this.customerTypes = [];
      this.customerTypes.push({label: "Bireysel Müşteri Ekle", value: 1});
      this.customerTypes.push({label: "Kurumsal Müşteri Ekle", value: 2});
      this.customerTypeValue = 1;
    }

    this.selectedPlaceholder = this.placeholder[this.queryType];
  }
  resultHandler(event) {
    this.resultEvent.emit(event);
    //this.isPartOfWizard == false ? this.tetherService.close(event) : null ;
  }

  selectboxHandler(type:string) {

  }
  onChangeSingleEvent(event) {

  }

  customerTypeHandler(event) {
    this.customerTypeValue = event;
    switch(event) {
      case 1:
        this.options= [
          {'text':'İsim ile','value': 1},
          {'text': 'GSM ile','value': 2},
          {'text': 'E-posta ile','value': 3}
        ];
        this.placeholder = {
          '1':'İsme Göre Ara',
          '2': '05XX XXX XX XX',
          '3': '@'
        }
      break;
      case 2:
        this.options = [{
          'text':'Vergi no ile',
          'value': '1'
        }];
        this.placeholder = {
          '1':'XXXXXXXXXXXX'
        }
      break;
    }
    this.queryType = 1;
    if(this.querySelectBox) this.querySelectBox.value = 1;
    this.selectedPlaceholder = this.placeholder[this.queryType];
  }

  dismissHandler(event) {
    //this.dismissEvent.emit(event);
    //this.tetherService.dismiss(event);
  }
  onSelectboxChange(event){
    this.queryType = event;
    this.selectedPlaceholder = this.placeholder[this.queryType];
    this.typeahead.searchValue = "";
  }

  typeaheadActionHandler(event) {
    switch(event.action) {
      case "selectItem":
        this.actionEvent.emit({action: event.action, params: event.params.selectedItem.params});
      break;
      default:
        this.actionEvent.emit(event);
      break;
    }
  }

 search(value){
  	if(value && value.length > 2){
	  	let limit = 10;
	  	let channelCode = this.authenticationService.getUserChannelCode();
	  	let firmCode  = this.authenticationService.getUserFirmCode();
	  	let apiUrl = environment.api.boxoffice;
	    let crmApiUrl = environment.api.boxoffice + '/api/v1.0/'+ firmCode +'/'+ channelCode +'/Crm/CallService/SearchCustomers';
      crmApiUrl += '?page=1';
      crmApiUrl += '&limit=' + limit;
      crmApiUrl += '&query=' + value;
      crmApiUrl += '&queryType=' + this.queryType;
      let listData = []
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'bearer ' + this.authenticationService.getToken());
      let phoneFormatPipe = new PhoneFormatPipe();
      let maskStringPipe = new MaskStringPipe();

      let member = this.http.post(crmApiUrl, {}, { headers: headers }).subscribe(response => {
      let payload = response.json();

      if(payload['EntityModel'] && payload['EntityModel']['Items']){
          for(let i = 0; i < payload['EntityModel']['Items'].length;i++){
          	let title = payload['EntityModel']['Items'][i]['Name'] + ' ' + payload['EntityModel']['Items'][i]['Surname'];
          	if(payload['EntityModel']['Items'][i]['PhoneNumber']){
          		title += '  /  ' + phoneFormatPipe.transform(payload['EntityModel']['Items'][i]['PhoneNumber'],true);
          	}else if(payload['EntityModel']['Items'][i]['Email']){
          		title += '  /  ' + maskStringPipe.transform(payload['EntityModel']['Items'][i]['Email'],'email');
          	}
            listData.push({
              title: title,
              icon:'person',
              params: {customer: payload['EntityModel']['Items'][i]}
            });
          }
          this.searchResults = Observable.of([{title: 'ARAMA SONUÇLARI', list: listData }]);
        }else{
          this.searchResults = Observable.of([]);
        }
      }, error => {
        this.searchResults = Observable.of([]);
      });
    }else {
      this.searchResults = Observable.of([]);
    }
    this.actionEvent.emit({action: "search", params:{queryType: this.queryType, value: value}});
  }

}
