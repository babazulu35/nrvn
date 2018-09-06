import { countries, phoneNumberMetaData } from './../dicts/countries';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AppSettingsService } from './app-settings.service';
import { ResponseContentType } from '@angular/http';
import { Http, RequestOptionsArgs, Headers } from '@angular/http';
import { Injectable } from '@angular/core';

@Injectable()
export class CountryService {

  countries$: BehaviorSubject<{
    name: string,
    nativeName: string,
    localeId: string,
    code: string,
    callingCode: string,
    nationalPhoneNumberPattern?: string
  }[]> = new BehaviorSubject(null);

  get countries(): {
    name: string,
    nativeName: string,
    localeId: string,
    code: string,
    callingCode: string,
    nationalPhoneNumberPattern?: string
  }[]{ return this.appSettingsService.getLocalSettings('countries') };

  constructor(private http: Http, private appSettingsService: AppSettingsService) {
    if(!this.countries) {
      this.appSettingsService.getLocalSettings("useLocalCountryDict") ? this.getLocalCountries() : this.getRemoteCountries();
    }else{
      this.countries$.next(this.countries);
    }
  }

  private getRemoteCountries() {
    this.getLocalCountries();
    // let url = "https://restcountries.eu/rest/v2/all?fields=name;nativeName;callingCodes;alpha2Code;languages;alpha2Code;";
    // let headers = new Headers();
    // headers.set('Accept', 'application/json');
    // let options: RequestOptionsArgs = {
    //     url: url,
    //     headers: headers,
    //     params: null,
    //     withCredentials: false,
    //     responseType: ResponseContentType.Json
    // }
    // this.http.get(url, options).subscribe( 
    //   result => {
    //     let payload = result.json();
    //     if(payload && payload.length) {
    //       this.map(payload);
    //     }else{
    //       this.getLocalCountries();
    //     }
    //   }, error => {
    //       this.getLocalCountries();
    //   });
  }

  private getLocalCountries() {
    this.map(countries);
  }

  private map(payload) {
    let countryList: {
      name: string,
      nativeName: string,
      localeId: string,
      code: string,
      callingCode: string,
      nationalPhoneNumberPattern?: string
    }[] = [];
    if(payload && payload.length) payload.forEach( item => {
      countryList.push({
        name: item.name,
        nativeName: item.nativeName,
        callingCode: item.callingCodes[0],
        nationalPhoneNumberPattern: phoneNumberMetaData["countries"][item.alpha2Code] ? phoneNumberMetaData["countries"][item.alpha2Code][1] : null,
        code: item.alpha2Code,
        localeId: item.languages[0].iso639_1 + "-" + item.alpha2Code
      });
    });
    this.appSettingsService.setLocalSetting("countries", countryList);
    this.countries$.next(countryList);
  }

}