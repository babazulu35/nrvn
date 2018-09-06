import { FormGroup, FormControl } from '@angular/forms';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { AutocompleteComponent } from './../autocomplete/autocomplete.component';
import { CountryService } from './../../../../services/country.service';
import { Component, OnInit, Input, HostBinding, ElementRef, ViewChild, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

import { asYouType, parse, format } from 'libphonenumber-js';

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  providers: [CountryService]
})
export class PhoneInputComponent implements OnInit {
  @ViewChild(AutocompleteComponent) countryInput: AutocompleteComponent;
  @ViewChild('phoneInput') phoneInput: TextInputComponent;
  
  @HostBinding('class.c-phone-input') true;

  @HostBinding('class.c-phone-input--error') get hasError():boolean {
    return this.phoneInput ? this.phoneInput.hasError : true;
  }
  @HostBinding('class.c-phone-input--disabled') @Input() isDisabled: boolean = false;

  @Output() changeEvent: EventEmitter<string> = new EventEmitter();

  @Input() set countryCode(code: string) {
    this.rawCountryCode = code;
    if(!this.asyoutype) this.asyoutype = new asYouType(<any>this.rawCountryCode);
    if(this.countries) {
      let existCountry = this.countries.find( item => item.code == code);
      this.setSelectedCountry(existCountry);
    }
  };
  @Input() set value(value: string) {
    this.asyoutype = new asYouType();
    this.asyoutype.input("+"+value);
    this.countryCode = this.asyoutype.country;
    this.phoneNumber = this.asyoutype.national_number;
    this.phoneInput.setValue(this.phoneNumber);
  }

  get value():string {
    return this.selectedCountry ? this.selectedCountry.callingCode + this.phoneNumber : this.phoneNumber;
  }

  @Input() form: FormGroup;
  @Input() name: string;
  @Input() required: boolean;
  @Input() areaCode: string;
  @Input() phoneNumber: string;
  @Input() icon: string = "search";
  @Input() placeholder: string = "(5XX) XXXXXXX";
  @Input() typeDebounceTime = 100;
  @Input() isPromising: boolean;
  @Input() emitOnlyEnter: boolean;

  countries: {
    name: string,
    nativeName: string,
    localeId: string,
    code: string,
    callingCode: string,
    nationalPhoneNumberPattern?: string
  }[];

  selectedCountry: {
    name: string,
    nativeName: string,
    localeId: string,
    code: string,
    callingCode: string,
    nationalPhoneNumberPattern?: string
  };

  rawCountryCode: string;
  inputMask: string;
  inputPattern: string;
  
  get formControl():FormControl { return this.phoneInput.formControl };

  private asyoutype: asYouType;

  constructor(
    private elementRef: ElementRef,
    private countryService: CountryService,
    private tether: TetherDialog,
    private changeDetector: ChangeDetectorRef
  ) { 
    
  }

  ngOnInit() {
    this.countryService.countries$.subscribe( result => {
      this.countries = result;
      if(!this.rawCountryCode) this.rawCountryCode = "TR";
      if(this.rawCountryCode) {
        if(this.countries) {
          let existCountry = this.countries.find( item => item.code == this.rawCountryCode);
          this.setSelectedCountry(existCountry);
        }
      }
    });
  }

  setSelectedCountry(country) {
    this.selectedCountry = country;
    if(this.selectedCountry) {
      if(this.selectedCountry.code == "TR") {
        this.inputMask = "(000) 000 0000";
        this.placeholder = "(5XX) XXX XXXX";
        this.inputPattern = "\\([2-589]{1}[0-9]{2}\\)[- ]\\d{3}[- ]\\d{4}";
      }else{
        this.inputMask = null; //this.asyoutype && this.asyoutype.template ? this.asyoutype.template.replace(/x/g, "0") : null;
        this.placeholder = this.asyoutype && this.asyoutype.template ? this.asyoutype.template.toUpperCase() :  "XXX XXX XXXX";
        this.inputPattern = this.selectedCountry.nationalPhoneNumberPattern;
      }
    }
    this.changeDetector.detectChanges();
  }

  openCountryBox(content) {
    this.tether.context(content, {
      target: this.elementRef.nativeElement,
      attachment: "top left",
      targetAttachment: "top left",
      dialog: {
        style: {
          width: this.elementRef.nativeElement.offsetWidth+"px"
        }
      }
    }).then( result => {

    }).catch( reason => {});
    let self = this;
    setTimeout(function(){
      if(self.countryInput) self.countryInput.textInput.focus();
    }, 30);
  }

  closeCountryBox(event?:any) {
    let self = this;
    this.tether.dismiss();
  }

  countrySelectHandler(event) {
    this.closeCountryBox();
    this.setSelectedCountry(event.params.rawData);
    this.phoneInput.value = "";
    this.phoneInput.focus();
  }

  inputChangeHandler(event) {
    this.phoneNumber = event;
    if(this.selectedCountry && this.phoneInput && !this.phoneInput.hasError) this.changeEvent.emit(this.value);
    this.changeDetector.detectChanges();
  }

}
