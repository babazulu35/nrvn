import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { FormGroup, FormControl, ValidatorFn } from '@angular/forms';
import { LocalizationBoxComponent } from './../localization-box/localization-box.component';
import { Component, OnInit, ViewChild, ElementRef, HostBinding, Input, Output, EventEmitter, Renderer, ChangeDetectorRef, ComponentFactoryResolver, Injector, ComponentRef } from '@angular/core';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss'],
  entryComponents: [LocalizationBoxComponent]
})
export class TextAreaComponent implements OnInit {
  @ViewChild('input') input: ElementRef;

  @HostBinding('class.c-text-area') true;
  @HostBinding('class.c-text-area--error')
  get hasError():boolean { return this.formControl && !this.formControl.valid && (this.formControl.touched || this.formControl.dirty)}

  @HostBinding('class.c-text-area--disabled')
  @Input() isDisabled: boolean;

  @HostBinding('class.c-text-area--dirty')
  get isDirty():boolean {
    return this.value != null && this.value.toString().length > 0;
  }

  @HostBinding('class.c-text-area--focused')
  isFocused: boolean;

  @Output() changeEvent:EventEmitter<any> = new EventEmitter();
  @Output() localizationChangeEvent: EventEmitter<any> = new EventEmitter();
  @Output() typeEvent:EventEmitter<any> = new EventEmitter();

  @Input() form:FormGroup;
  @Input() name: string;
  @Input() label: string;
  @Input() value: string;
  @Input() placeholder: string = "";
  @Input() maxlength: number;
  @Input() required: boolean;
  @Input() cols: number;
  @Input() rows: number;
  @Input() wrap: string = "soft";
  @Input() readonly: boolean = false;
  @Input() typeDebounceTime: number = 500;
  @Input() dismissOnFocusOut: boolean = false;
  @Input() dismissOnEscape: boolean = true;
  @Input() autoFocusWhenEnabled: boolean = false;
  @Input() saveOnEnter: boolean = false;
  
  type: string = "textarea";
  
  @Input() set pattern(value: RegExp) {
    this.inputPattern = value;
  }

  @Input() set patternString(value:string) {
    this.pattern = new RegExp(value,"g");
  }

  @Input() set disabled(value: boolean) {
    this.isDisabled = value;
  }

  @Input() set isTypeEmitting(value: boolean) {
    if(value && this.typeSubscription == null) {
      this.typeSubscription = this.formControl.valueChanges
      .map(item => {
        return item;
       })
      .debounceTime(this.typeDebounceTime)
      .distinctUntilChanged()
      .subscribe( value => {
        if(this.defaultLocale) this.defaultLocale.value = this.value;
        this.typeEvent.emit(this.locales ? {locales: this.locales, localization: this.localization, value: this.value} : this.formattedValue);
      });
    }else{
      this.typeSubscription.unsubscribe();
      this.typeSubscription = null;
    }
  }

  locales: {id: string, code: string, value: string}[];
  defaultLocale: {id: string, code: string, value: string};
  
  @Input() set hasLocalization(value: boolean) {
    if(value) {
      this.locales = value ? JSON.parse(JSON.stringify(this.appSettings.getLocalSettings("locales"))) : null;
      this.defaultLocale = this.locales.find(item => item.id == this.appSettings.getLocalSettings("defaultLocale"));
    }else{
      this.locales = null;
      this.defaultLocale = null;
    }
  };

  @Input() set localization(value: {} | string) {
    if(this.locales) {
      if(value) {
        //if(!this.locales) this.hasLocalization = true;
        let defaultLocaleId = this.appSettings.getLocalSettings("defaultLocale");
        if(this.locales) this.locales.forEach( item => {
          if(value[item.id]) item.value = value[item.id];
          if(item.id == defaultLocaleId) this.defaultLocale = item;
        });
        if(this.defaultLocale) this.value = this.defaultLocale.value;
      }else{
        this.hasLocalization = this.locales != null;
        this.value = "";
      }
    }else{
      this.value = <string>value;
    }
  }

  get localization(): {} | string {
    let localization: {} = {};
    this.locales.forEach( item => localization[item.id]= item.value && item.value.length > 0 ? item.value : null);
    let validLocale = this.locales.find( item => item.value && item.value.length > 0);
    return validLocale ? localization : null;
  }

  get completedLocalizations(): {id: string, value: string}[] { return this.locales ? this.locales.filter( item => item.value != null && item.value.length > 0) : null };

  get focused():boolean { return this.isFocused };

  get formattedValue():any {
    let fValue: any;
    fValue = this.value;
    return fValue;
  }

  get isValid():boolean {
    let valid: boolean = true;
    valid = this.value && this.value.length > 0;
    return valid;
  }

  inputPattern: RegExp;
  typeSubscription;
  pristineValue: string;

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

  save(event?:any) {
    if(this.saveOnEnter) {
      this.emitChangeEvent();
      this.input.nativeElement.blur();
    }
  }

  onFocus(event?:any) {
    this.isFocused = true;
    this.pristineValue = this.value;
  }

  onFocusOut(event?:any) {
    this.isFocused = false;
    this.emitChangeEvent();
  }

  openLocalizationBox() {
    let component: ComponentRef<LocalizationBoxComponent> = this.resolver.resolveComponentFactory(LocalizationBoxComponent).create(this.injector);
    let localizationBox: LocalizationBoxComponent = component.instance;
    
    localizationBox.locales = this.locales;
    localizationBox.target = {label: this.label || this.name, name: this.name, input: "textarea"};
    
    this.tether.modal(component).then( result => {
      this.defaultLocale = this.locales.find(item => item.id == this.appSettings.getLocalSettings("defaultLocale"));
      if(this.defaultLocale) this.value = this.defaultLocale.value;
      this.changeEvent.emit({locales: this.locales, localization: this.localization, value: this.value});
    }).catch( reason => {
      this.defaultLocale = this.locales.find(item => item.id == this.appSettings.getLocalSettings("defaultLocale"));
      if(this.defaultLocale) this.value = this.defaultLocale.value;
      this.changeEvent.emit({locales: this.locales, localization: this.localization, value: this.value});
    });
  }

  emitChangeEvent() {
    if(this.defaultLocale) this.defaultLocale.value = this.value;
    this.changeEvent.emit(this.locales ? {locales: this.locales, localization: this.localization, value: this.value} : this.formattedValue);
  }
  
  patternValidator(): ValidatorFn {
    return (): {[key: string]: any} => {
      if(!this.inputPattern) return null;
      if(!this.value) return null;
      const name = this.value;
      const test = this.inputPattern.test(name);
      return !test ? {'patternValidator': {name}} : null;
    };
  }

}
