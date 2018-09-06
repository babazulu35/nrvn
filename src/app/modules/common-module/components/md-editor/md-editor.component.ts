import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { LocalizationBoxComponent } from './../../../base-module/components/localization-box/localization-box.component';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { Component, OnInit, ViewChild, ContentChild, ElementRef, Renderer, HostBinding, Input, Output, EventEmitter, HostListener, AfterViewInit, AfterContentInit, ComponentRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as SimpleMDE from 'simplemde';

@Component({
  selector: 'app-md-editor',
  templateUrl: './md-editor.component.html',
  styleUrls: ['./md-editor.component.scss'],
  entryComponents: [LocalizationBoxComponent]
})
export class MdEditorComponent implements OnInit {
  @ViewChild('textarea') textarea: ElementRef;

  @HostBinding('class.c-md-editor') true;
  @HostBinding('class.c-md-editor--disabled')
  @Input() isDisabled: boolean;

  @Output() editorValue: EventEmitter<any> = new EventEmitter();
  @Output() changeEvent:EventEmitter<any> = new EventEmitter();
  
  @Input() options:{
    previewOn?:boolean,
    focusOn?:boolean,
    placeholder?:string,
  }

  inputValue:string;
  
  @Input() set value(value:string) {
    if(!value) value = "";
    if(this.mdEditor) {
      if(this.mdEditor.value() != value) this.mdEditor.value(value);
    }else{
      this.inputValue = value;
    }    
  }

  get value(): string {
    if(this.mdEditor) {
      return this.mdEditor.value();
    }else{
      return this.inputValue;
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

  @Input() name: string;
  @Input() label: string;
  @Input() cols: number;
  @Input() rows: number;

  public mdEditor:SimpleMDE;

  constructor(
    private el:ElementRef,
    private renderer:Renderer,
    private appSettings: AppSettingsService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog
  ) { }

  ngOnInit(){
    this.mdEditor = new SimpleMDE({ 
      element: this.textarea.nativeElement,
      autofocus: this.options && this.options.focusOn == true  ? true : false,
      spellChecker:false,
      promptURLs: false,
      placeholder: this.options ? this.options.placeholder : "",
      initialValue: this.inputValue,
      toolbar: ["bold", "italic", "heading-1","heading-2","heading-3", this.options && this.options.previewOn == true ? "preview" : ''],
      status: false
    });

    this.mdEditor.codemirror.self = this;
    this.mdEditor.codemirror.on("change", this.editorChangeHandler);
  }

  ngOnDestroy() {
    if(this.mdEditor) this.mdEditor.codemirror.off("change", this.editorChangeHandler)
    this.mdEditor = null;
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

  editorChangeHandler(event) {
    let value = event.self.mdEditor.value();
    if(event.self.defaultLocale) event.self.defaultLocale.value = value;
    event.self.changeEvent.emit(event.self.locales ? {locales: event.self.locales, localization: event.self.localization, value: event.self.value} : event.self.value);
    event.self.editorValue.emit(value);
  }

}
