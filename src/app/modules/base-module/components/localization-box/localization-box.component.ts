import { AppSettingsService } from './../../../../services/app-settings.service';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit, HostBinding, Input, HostListener, ViewChild, ChangeDetectorRef, ElementRef, Output, EventEmitter } from '@angular/core';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-localization-box',
  templateUrl: './localization-box.component.html',
  styleUrls: ['./localization-box.component.scss']
})
export class LocalizationBoxComponent implements OnInit {
  @ViewChild('defaultLocaleInput') defaultLocaleInput: any;
  @ViewChild('content') content: ElementRef;
  
  @HostBinding("class.c-localization-box") true;

  @HostListener('keyup.enter') enterHandler(){
    this.submit();
  };

  @Output() changeEvent: EventEmitter<any> = new EventEmitter();

  @Input() locales: {id: string, code: string, value?: string}[];
  @Input() target: {label?: string, name: string, input?: string, type?: string};
  @Input() title: string;
  @Input() showWithoutBox: boolean;

  @Input() set localization(value: {} | string) {
    if(value) {
      let defaultLocaleId = this.appSettings.getLocalSettings("defaultLocale");
      if(typeof value === "string") {
        this.defaultLocale.value = value;
      }else{
        if(this.locales) this.locales.forEach( item => {
          if(value[item.id]) item.value = value[item.id];
        });
      }
    }
  }

  get localization(): {} | string {
    if(!this.locales) return null;
    let localization: {} = {};
    this.locales.forEach( item => localization[item.id]= item.value && item.value.length > 0 ? item.value : null);
    let validLocale = this.locales.find( item => item.value && item.value.length > 0);
    return validLocale ? localization : null;
  }

  public get defaultLocale():{id: string, code: string, value?: string} {
    return this.locales ? this.locales.find(item => item.id == this.appSettings.getLocalSettings("defaultLocale")) : null;
  }

  public get otherLocales(): {id: string, code: string, value?: string}[] {
    return this.locales ? this.locales.filter(item => item.id != this.appSettings.getLocalSettings("defaultLocale")) : null;
  }

  public validation: {
		DefaultLocale: { isValid: any, message: string },
		OtherLocales: { isValid: any, message: string }
	} = {
		DefaultLocale: {
			message: "Varsayılan dil girişi zorunludur.",
			isValid(): boolean {
        let otherLocalesHasValue:boolean = this.otherLocales ? this.otherLocales.find( item => item.value && item.value.length > 0) : false;
				return otherLocalesHasValue ? this.defaultLocale && this.defaultLocale.value && this.defaultLocale.value.length > 0 : true;
			}
		},
		OtherLocales: {
			message: "Diğer zorunlu dilleri giriniz.",
			isValid():boolean {
				return true;
			}
		}
	};

	public get isValid():boolean {
		if( this.validation
			&& this.validation.DefaultLocale.isValid.call(this)
			&& this.validation.OtherLocales.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
  };
  
  private pristineLocales: {id: string, code: string, value?: string}[];

  constructor(
    private appSettings: AppSettingsService,
    private changeDetector: ChangeDetectorRef,
    public tether: TetherDialog
  ) { 
    if(!this.locales) this.locales = JSON.parse(JSON.stringify(this.appSettings.getLocalSettings("locales")));
  }

  ngOnInit() {
    if(!this.title) this.title = "Dil Seçenekleri";
    
    if(this.tether && this.tether.action$) {
      this.tether.action$.subscribe( result => {
        if(result && result.action == "dismiss") this.resetLocales();
      });
    }
  }

  ngAfterViewInit() {
    if(this.defaultLocaleInput) this.defaultLocaleInput.focus(); //TextInputComponent
    this.pristineLocales = cloneDeep(this.locales);
  }

  inputChangeHandler(event, locale) {
    locale.value = event;
    this.changeEvent.emit({locales: this.locales, localization: this.localization, value: this.defaultLocale.value});
  }

  public submit(event?:any) {
    if(this.isValid && this.tether) this.tether.close(this.locales);
  }

  public dismiss() {
    this.resetLocales();
    if(this.tether) this.tether.dismiss();
  }

  private resetLocales() {
    let existLocale;
    this.pristineLocales.forEach( pristineLocale => {
      existLocale = this.locales.find( locale =>  locale.id == pristineLocale.id );
      if(existLocale) existLocale.value = pristineLocale.value;
    });
    if(!this.changeDetector["destroyed"]) this.changeDetector.detectChanges();
  }

}
