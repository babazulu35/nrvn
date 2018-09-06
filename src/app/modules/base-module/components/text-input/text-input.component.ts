import { StringMask } from './../../../../classes/string-mask';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { LocalizationBoxComponent } from './../localization-box/localization-box.component';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { PromiseIconComponent } from './../../../base-module/components/promise-icon/promise-icon.component';
import { Component, OnInit, HostBinding, Input, Output, EventEmitter, ViewChild, ElementRef, Renderer, ChangeDetectorRef, ComponentRef, ComponentFactoryResolver, Injector, HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

declare var Pikaday;
import * as moment from 'moment';
import 'moment/locale/tr'

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  entryComponents: [LocalizationBoxComponent]
})
export class TextInputComponent implements OnInit {
  @ViewChild(PromiseIconComponent) promiseIcon: PromiseIconComponent;
  @ViewChild('input') input: ElementRef;

  @HostBinding('class.c-text-input') true;
  
  @HostBinding('class.c-text-input--error')
  get hasError():boolean {
    if(this.form && !this.required) return false;
    if(this.formControl && !this.formControl.pristine && !this.isDirty && this.required) return true;
    if(this.formControl && !this.formControl.touched && !this.formControl.dirty) return false;
    return this.formControl ? !this.isValid || (!this.formControl.valid && this.isDirty) : !this.isValid;
  }

  @HostBinding('class.c-text-input--flex')
  @Input() isFlex: boolean;

  @HostBinding('class.c-text-input--disabled')
  @Input() isDisabled: boolean;

  @HostBinding('class.c-text-input--underline')
  isUnderline: boolean = false;

  @HostBinding('class.c-text-input--no-border')
  isNoBorder: boolean = false;

  @HostBinding('class.c-text-input--focused')
  isFocused: boolean;

  @HostBinding('class.c-text-input--autosize')
  get isAutosize(){
    return this.size == "autosize";
  }
  @HostBinding('class.c-text-input--lg')
  get isLg(){
    return this.size == "lg";
  }
  @HostBinding('class.c-text-input--md')
  get isMd(){
    return this.size == "md";
  }
  @HostBinding('class.c-text-input--sm')
  get isSm(){
    return this.size == "sm";
  }

  @HostBinding('class.c-text-input--sm-text')
  get isSmText(){
    return this.size == "sm-text";
  }

  @HostBinding('class.c-text-input--md-text')
  get isMdText(){
    return this.size == "md-text";
  }

  @HostBinding('class.c-text-input--dirty')
  get isDirty():boolean {
    return (this.value != null && this.value.toString().length > 0 && this.value.toString() != "NaN");
  }

  @HostListener('keypress', ['$event'])
  keydownHandler(e) {
      let code: number = e.which || e.keyCode;
      if(code <= 46) return;
      let char:string = String.fromCharCode(code);
      if(char && char.length && this.keydownPattern && !this.keydownPattern.test(char)) {
        e.preventDefault();
        e.stopPropagation();
      }
  }

  @Output() changeEvent:EventEmitter<any> = new EventEmitter();
  @Output() localizationChangeEvent: EventEmitter<any> = new EventEmitter();
  @Output() typeEvent:EventEmitter<any> = new EventEmitter();
  @Output() dismissEvent:EventEmitter<any> = new EventEmitter();
  @Output() focusEvent:EventEmitter<any> = new EventEmitter();

  @Input() form:FormGroup;
  @Input() name: string;
  @Input() label: string;
  @Input() value: string;
  @Input() placeholder: string = "";
  @Input() min: number;
  @Input() max: number;
  @Input() maxlength: number;
  @Input() readonly: boolean;
  @Input() required: boolean;
  @Input() icon: string;
  @Input() iconAsButton: boolean = false;
  @Input() autocomplete: string = "off";
  @Input() isIconAlignLeft:boolean = false;
  @Input() isPromising: boolean = false;
  @Input() typeDebounceTime: number = 500;
  @Input() dismissOnFocusOut: boolean = false;
  @Input() dismissOnEscape: boolean = true;
  @Input() dateTimeFormat: string = 'DD.MM.YYYY, dddd HH:mm';
  @Input() autoFocusWhenEnabled: boolean = false;
  @Input() emitWhenInit: boolean = false;
  @Input() blurWhenEnter: boolean = true;
  @Input() includeTime = true;
  
  @Input() maskOptions: {
    reverse?: boolean,
    usedefaults?: boolean
  }
  @Input() set mask(value: string) {
    if(!this.input || !this.isMaskAvailable) return;
    if(value) {
      if(!this.isTypeEmitting) {
        this.isTypeEmitting = true;
      }
      if(this.inputMask && this.inputMask.pattern == value) return;
      this.inputMask = new StringMask(value, this.maskOptions);
    }else{
      this.inputMask = null;
    }
  }
  @Input() isMaskAvailable: boolean = true;
  
  @Input() size: string = "md";

  @Input() set type(value: string) {
    this.inputType = value || "text";
    this.rawType = value;
    let self = this;
    switch(this.rawType) {
      case 'alpha':
        this.pattern = /^[A-Za-z\sçÇşŞöÖğĞıİüÜ]+$/;
        this.keydownPattern = this.inputPattern;
      break;
      case 'username':
        this.pattern = /^[A-Za-z0-9\sçÇşŞöÖğĞıİüÜ.]+$/;
        this.keydownPattern = this.inputPattern;
      break;
      case 'numeric':
        this.inputType = "text";
        this.pattern = /^[0-9,.]+$/;
        this.keydownPattern = this.inputPattern;
      break;
      case "digit":
        this.inputType = "text";
        this.pattern = /^[0-9,.]+$/;
        this.keydownPattern = this.inputPattern;
      break;
      case 'price':
        this.pattern = /^\d+([.,]\d{1,2})?$/;
        this.keydownPattern = /^[0-9,.]+$/;
      break;
      case 'email':
        this.pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      break;
      case 'url':
        //this.pattern = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
        this.pattern = /^(http(s)?(:\/\/))?(www\.)?[a-zA-Z0-9-_\.]+(\.[a-zA-Z0-9]{2,})([-a-zA-Z0-9:%_\+.~#?&//=]*)/;
      break;
      case 'tel':
        this.typeDebounceTime = 300;
        this.mask = "+900 (000) 000 0000";
        this.maxlength = "+900 (000) 000 0000".length;
        this.pattern = /(?:\(\d{3}\)|\d{3})[- ]?\d{3}[- ]?\d{4}/;
        this.keydownPattern = /[0-9]/;
      break;
      case 'search':
        if(!this.icon) this.icon = "search";
      break;
      case 'lat':
        this.inputType = "number";
        this.pattern = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
        //this.keydownPattern = /[0-9,.]/;
      break;
      case 'lon':
        this.inputType = "number";
        this.pattern = /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
        //this.keydownPattern = /[0-9,.]/;
      break;
      case 'latlon':
        this.inputType = "number";
        this.pattern = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
        //this.keydownPattern = /[0-9,.]/;
      break;
      case 'datepicker':
        if(this.placeholder == null) this.placeholder = "Bir Tarih Seçin";
        if(!this.icon) this.icon = "insert_invitation";
        moment.locale('tr');
        let picker = new Pikaday({
	    	field: this.input.nativeElement,
        showTime: this.includeTime,
        showMinutes: this.includeTime,
        showSeconds: false,
        use24hour: true,
        incrementHourBy: 1,
        incrementMinuteBy: 5,
        yearRange: 30,
        autoClose: !this.includeTime,
        format: this.dateTimeFormat,
        	onSelect: function(date) {
            self.value = moment(date).format(self.dateTimeFormat);
        	},
        	i18n: {
            previousMonth : 'Previous Month',
            nextMonth     : 'Next Month',
            months        : moment.localeData()["_months"],
            weekdays      : moment.localeData()["_weekdays"],
            weekdaysShort : moment.localeData()["_weekdaysShort"]
			    }
	  	  });
        this.pikaday = picker;
      break;
      case 'tckn':
        this.inputType = "text";
        this.maxlength = 11;
        this.pattern = /^[1-9]{1}[0-9]{10}$/;
        this.keydownPattern = /[0-9]/;
      break;
    }
  }

  @Input() set minDate(value:Date) {
    if(value) value = moment(value).toDate();
    if(this.pikaday) this.pikaday.setMinDate(value);
  }

  @Input() set maxDate(value) {
    if(value) value = moment(value).toDate();
    if(this.pikaday) this.pikaday.setMaxDate(value);
  }

  @Input() set yearRange(value) {
    if(this.pikaday && this.pikaday._o) this.pikaday._o.yearRange = value;
  }

  @Input() set date(value: string) {
  	if(value != null && moment(value).isValid()){
      this.value = moment(value).format(this.dateTimeFormat);
  	}else{
      this.value = null;
    }
  }
  @Input() set pattern(value: RegExp) {
    this.inputPattern = value;
  }

  @Input() set patternString(value:string) {
    this.pattern = new RegExp("^("+value+"){1}$");
  }

  @Input() set theme(value: string) {
    this.isUnderline = value == 'underline';
    this.isNoBorder = value == "no-border";
  }

  @Input() set iconAlign(value: string) {
    this.isIconAlignLeft = value == "left";
  }

  @Input() set disabled(value: boolean) {
    this.isDisabled = value;
  }

  @Input() set isTypeEmitting(value: boolean) {
    if(value && this.typeSubscription == null) {
      this.typeSubscription = this.formControl.valueChanges
        .map(value => {
          if(!this.stateUserTyping && value) this.stateUserTyping = true;
          return this.formatValue(value);
        })
        .debounceTime(this.typeDebounceTime)
        .distinctUntilChanged()
        .subscribe( value => {
          this.stateUserTyping = false;
          this.value = value;
          if(this.defaultLocale) this.defaultLocale.value = this.value;
          if(!this.changeDetector["destroyed"]){
            this.changeDetector.detectChanges();
            this.typeEvent.emit(this.locales ? {locales: this.locales, localization: this.localization, value: this.value} : this.formattedValue);
          }
        });
    }else{
      if(this.typeSubscription) this.typeSubscription.unsubscribe();
      this.typeSubscription = null;
    }
  }
  get isTypeEmitting():boolean { return this.typeSubscription != null };

  locales: {id: string, code: string, value: string}[];
  defaultLocale: {id: string, code: string, value: string};
  
  @Input() set hasLocalization(value: boolean) {
    if(value) {
      this.locales = value ? JSON.parse(JSON.stringify(this.appSettings.getLocalSettings("locales"))) : null;
      this.defaultLocale = this.locales.find(item => item.id == this.appSettings.getLocalSettings("defaultLocale"));
      if(!this.isTypeEmitting) {
        this.isTypeEmitting = true;
      }
    }else{
      this.locales = null;
      this.defaultLocale = null;
    }
  };
  get hasLocalization():boolean { return this.locales && this.locales.length > 0 };

  @Input() set localization(value: {} | string) {
    if(this.locales) {
      if(value) {
        let defaultLocaleId = this.appSettings.getLocalSettings("defaultLocale");
        if(typeof value === "string") {
          this.defaultLocale = this.locales.find(item => item.id == defaultLocaleId);
          this.defaultLocale.value = value;
        }else{
          if(this.locales) this.locales.forEach( item => {
            if(value[item.id]) item.value = value[item.id];
            if(item.id == defaultLocaleId) this.defaultLocale = item;
          });
        }
        if(this.defaultLocale) this.value = this.defaultLocale.value;
      }else{
        this.hasLocalization = this.locales != null;
        this.value = "";
      }
    }else{
      this.value = typeof value === "object" ? null :  <string>value;
    }
  }

  get localization(): {} | string {
    if(!this.locales) return null;
    let localization: {} = {};
    this.locales.forEach( item => localization[item.id]= item.value && item.value.length > 0 ? item.value : null);
    let validLocale = this.locales.find( item => item.value && item.value.length > 0);
    return validLocale ? localization : null;
  }

  get completedLocalizations(): {id: string, value: string}[] { return this.locales ? this.locales.filter( item => item.value != null && item.value.length > 0) : null };

  get focused():boolean { return this.isFocused };

  get stateIcon() {
    return this.stateUserTyping ? "keyboard" : this.icon;
  }

  get formattedValue():any {
    if(this.readonly) return this.value;
    let fValue: any;
    let number: number;
    switch(this.rawType) {
      case "datepicker":
        if(this.value) fValue = moment(this.value, this.dateTimeFormat, true).toISOString();
      break;
      case "number":
      case "numeric":
      case "price":
      case "digit":
        if(!this.inputMask && this.value) number = parseFloat(this.value.toString().replace(/[^0-9,.]/g,''));
        if(!isNaN(number)) {
          if(!isNaN(this.min) && number < this.min) fValue = this.min;
          if(!isNaN(this.max) != null && number > this.max) fValue = this.max;
          if(this.rawType != "digit") {
            fValue = number;
            this.value = fValue.toString();
          }else {
            fValue = this.value;
          }
        }else {
          if(this.value) fValue = (this.isMaskAvailable && this.inputMask) ? this.inputMask.cleanValue(this.value) : this.value;
        }
      break;
      case "tel":
        if(this.value) fValue = (this.isMaskAvailable && this.inputMask) ? this.inputMask.cleanValue(this.value) : this.value;
      break;
      default:
        fValue = this.value;
      break;
    }
    return fValue;
  }

  get isValid():boolean {
    let valid: boolean = true;
    if(this.value == null || this.formattedValue == null) return true;
    switch(this.rawType) {
      case "number":
      case "numeric":
        if(this.min != undefined && this.max != undefined) {
          valid = parseFloat(this.value) >= this.min && parseFloat(this.value) <= this.max;
        }else if(this.min != undefined && this.max == undefined) {
          valid = parseFloat(this.value) >= this.min;
        }else if(this.min == undefined && this.max != undefined) {
          valid = parseFloat(this.value) <= this.max;
        }
      break;
      case "tel":
        valid = this.formattedValue.length >= 10 && this.formattedValue.length <= 15;
      break;
      case "datepicker":
        valid= moment(this.value, this.dateTimeFormat, true).isValid();
      break;
    }
    return valid;
  }

  inputType: string = 'text';
  rawType: string;
  inputPattern: RegExp;
  keydownPattern: RegExp;
  inputMask: StringMask;
  typeSubscription;
  pristineValue: string;
  isTriggeredBefore: boolean = false;
  stateUserTyping: boolean = false;

  pikaday:any;

  public formControl: FormControl = new FormControl({value: this.value, disabled: this.isDisabled}, this.patternValidator());


  constructor(
    private renderer: Renderer,
    private elementRef: ElementRef,
    private changeDetector: ChangeDetectorRef,
    private appSettings: AppSettingsService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog
  ) { }

  ngOnInit() {
    if(this.form && this.name) {
      this.form.addControl(this.name, this.formControl);
      this.changeDetector.detectChanges();
      this.formControl.statusChanges.subscribe( status => {
        this.isDisabled = status == "DISABLED";
      });
    }
  }

  ngAfterViewInit() {
    if(this.value && this.emitWhenInit) this.emitChangeEvent();

  }

  ngOnChanges(changes) {
    if(changes.isDisabled && this.formControl) {
      changes.isDisabled.currentValue ? this.formControl.disable() : this.formControl.enable();
      if(this.autoFocusWhenEnabled && !this.formControl.disabled) this.focus();
    }
  }

  ngOnDestroy() {
    if(this.formControl && this.form) {
      this.form.removeControl(this.name);
      this.formControl = null;
    }
  }

  focus(event?:any) {
    //this.input.nativeElement.focus();
    let self = this;
    setTimeout(function() {
      self.input.nativeElement.focus();
    }, 10);
  }

  blur(event?:any) {
    this.elementRef.nativeElement.focus();
  }

  enterHandler(event) {
    this.save(event);
  }

  escapeHandler(event) {
    if(this.dismissOnEscape){
      this.value = this.pristineValue;
      this.dismissChanges();
    }
  }

  save(event?:any) {
    this.emitChangeEvent();
    this.isTriggeredBefore = true;
    if(this.blurWhenEnter) this.input.nativeElement.blur();
    this.isTriggeredBefore = false;
  }

  onFocus(event?:any) {
    this.isFocused = true;
    this.pristineValue = this.value;
    this.focusEvent.emit({action: "on", name: this.name});
  }

  onFocusOut(event?:any) {
    this.isFocused = false;
    if(this.isTriggeredBefore) return;
    if(!this.hasLocalization){
      this.dismissOnFocusOut ? this.dismissChanges() :  this.emitChangeEvent();
    }
    // this.dismissOnFocusOut ? this.dismissChanges() :  this.emitChangeEvent();
    this.focusEvent.emit({action: "out", name: this.name});
  }

  openLocalizationBox() {
    let component: ComponentRef<LocalizationBoxComponent> = this.resolver.resolveComponentFactory(LocalizationBoxComponent).create(this.injector);
    let localizationBox: LocalizationBoxComponent = component.instance;
    
    localizationBox.locales = this.locales;
    localizationBox.target = {label: this.label || this.name, name: this.name, input: "textinput"};
    
    this.tether.modal(component).then( result => {
      this.defaultLocale = this.locales.find(item => item.id == this.appSettings.getLocalSettings("defaultLocale"));
      if(this.defaultLocale) this.value = this.defaultLocale.value;
      this.changeEvent.emit(this.locales ? {locales: this.locales, localization: this.localization, value: this.value} : this.formattedValue);
      this.typeEvent.emit(this.locales ? {locales: this.locales, localization: this.localization, value: this.value} : this.formattedValue);
    }).catch( reason => {
      this.defaultLocale = this.locales.find(item => item.id == this.appSettings.getLocalSettings("defaultLocale"));
      if(this.defaultLocale) this.value = this.defaultLocale.value;
      this.changeEvent.emit({locales: this.locales, localization: this.localization, value: this.value});
    });
  }

  dismissChanges(event?:any) {
    this.isTriggeredBefore = true;
    this.input.nativeElement.blur();
    this.isTriggeredBefore = false;
    this.dismissEvent.emit(this.value);
  }

  setValue(value: string) {
    this.value = this.formatValue(value);
  }

  formatValue(value, atLast?: boolean): string{
    if(value === null) return "";
    let cleanValue:string = this.isMaskAvailable && this.inputMask ? this.inputMask.cleanValue(value) : value;
    switch(this.rawType) {
      case "tel":
        if(atLast){
          if(cleanValue.substr(0, 2) == "05" && cleanValue.length == 11) cleanValue = "9"+cleanValue;
          if(cleanValue.substr(0, 2) != "90" && cleanValue.length == 10) cleanValue = "90"+cleanValue;
        }
        if(this.isMaskAvailable && this.inputMask) {
          if(cleanValue.substr(0, 2) == "90") {
            this.mask = "+00 (000) 000 0000";
            this.maxlength = "+00 (000) 000 0000".length;
          }else if(cleanValue.substr(0, 2) == "05") {
            if(cleanValue.length > 11) {
              this.mask = "+990 (000) 000 0000";
            }else{
              this.mask = "0 (000) 000 0000";
            }
            this.maxlength = "+990 (000) 000 0000".length;
          }else{
            this.maxlength = "+990 (000) 000 0000".length;
            
            if(cleanValue.length > 10) {
              this.mask = "+990 (000) 000 0000";
            }else{
              this.mask = "(000) 000 0000";
            }
          }
          value = this.inputMask.apply(cleanValue);
        }else{

        }
      break;
      default:
        if(this.isMaskAvailable && this.inputMask) {
          value = this.inputMask.apply(cleanValue);
        }
      break;
    }
    return value;
  }

  emitChangeEvent() {
    if(this.value !== null) this.value = this.formatValue(this.value, true);
    this.changeDetector.detectChanges();
    if(this.defaultLocale) this.defaultLocale.value = this.value;
    this.changeEvent.emit(this.locales ? {locales: this.locales, localization: this.localization, value: this.value} : this.formattedValue);
  }

  iconClickHandler(event) {
    if(this.iconAsButton) this.emitChangeEvent();
  }

  patternValidator(): ValidatorFn {
    return (): {[key: string]: any} => {
      if(!this.inputPattern) return null;
      if(!this.value || !this.inputType) return null;
      const name = this.value;
      const test = this.inputPattern.test(name);
      return !test ? {'patternValidator': {name}} : null;
    };
  }
}
