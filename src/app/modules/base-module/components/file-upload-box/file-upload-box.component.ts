import { NotificationService } from './../../../../services/notification.service';
import { Http, Headers } from '@angular/http';
import { AuthenticationService } from './../../../../services/authentication.service';
import { environment } from './../../../../../environments/environment';
import { LocalizationBoxComponent } from './../localization-box/localization-box.component';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { Component, OnInit, HostBinding, Input, Output, EventEmitter, ComponentFactoryResolver, Injector, ComponentRef, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

import * as moment from 'moment';

@Component({
  selector: 'app-file-upload-box',
  templateUrl: './file-upload-box.component.html',
  styleUrls: ['./file-upload-box.component.scss'],
  entryComponents: [LocalizationBoxComponent]
})
export class FileUploadBoxComponent implements OnInit {
  @ViewChild("fileInput") fileInput: ElementRef;
  @HostBinding('class.c-file-upload-box') true;

  @HostListener('dragover', ['$event']) dragOverHandler(event) {
    this.isDragOver = true;
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('dragleave', ['$event']) dragLeaveHandler(event) {
    this.isDragOver = false;
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('drop', ['$event']) dropHandler(event) {
    this.createFile(event);
    this.isDragOver = false;
    event.preventDefault();
    event.stopPropagation();
  }

  // @HostListener('click', ['$event']) clickHandler(event) {
  //   if(this.isEmpty) this.fileInput.nativeElement.click();
  // }

  @HostBinding('class.c-file-upload-box--disabled')
  @Input() isDisabled: boolean;

  @HostBinding('class.c-file-upload-box--not-allowed')
  @Input() isNotAllowed: boolean;

  @HostBinding('class.c-file-upload-box--empty')
  get isEmpty(): boolean { return !this.value || this.value.length == 0 };

  @HostBinding('class.c-file-upload-box--transparent') isTransparent: boolean;

  @HostBinding('class.c-file-upload-box--drag-over')
  @Input() isDragOver: boolean;

  @HostBinding('class.c-file-upload-box--promise')
  @Input() isPromising: boolean;

  @HostBinding('class.c-file-upload-box--has-preview')
  get previewAvailable():boolean { return this.hasPreview && !this.isEmpty }

  @Output() changeEvent:EventEmitter<any> = new EventEmitter();
  @Output() validationEvent: EventEmitter<any> = new EventEmitter();

  @Input() value: string;
  @Input() name: string;
  @Input() label: string;
  @Input() inputLabel: string;
  @Input() fileTypes: string[];
  @Input() maxFileSize: number;
  @Input() addTimestampToFilename: boolean = true;
  @Input() autoUpload: boolean = true;
  @Input() validateFile: (file:File, fileData:any)=>{valid: boolean, message: string, payload?:any};
  @Input() showNotification: boolean = true;
  @Input() recordInfo: string;
  
  @Input('theme') set setTheme(value: string) {
    this.theme = value;
    this.isTransparent = this.theme == "button";
  }

  @Input() set type(value: string) {
    this.fileType = value;
    switch(this.fileType) {
      case "image":
        if(!this.fileTypes) this.fileTypes = ['image/*'];
        this.hasPreview = true;
      break;
      case "csv":
        if(!this.fileTypes) this.fileTypes = ['.csv', 'text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel', 'text/x-csv'];
        if(!this.maxFileSize) this.maxFileSize = 250 * 1024;
        if(!this.validateFile) {
          let self = this;
          this.validateFile = function(file: File, fileData) {
            let result: {valid: boolean, message: string, payload?:any};
            let customerFields: string[] = self.appSettingsService.getLocalSettings('customerCsvFields');
            let payload: any[] = [];
            let payloadItem: {};
            let fields: string[];
            let valid: boolean;
            fileData.split(/\n/).map( line => {
              fields = line.split(',');
              if(fields.length == customerFields.length) {
                payloadItem = {};
                customerFields.forEach ( (key, index) => {
                  payloadItem[key] = fields[index];
                });
                payload.push(payloadItem);
              }
            });
            valid = payload.length > 0;
            result = {
              valid: valid,
              message: valid ? (payload.length + " kişi başarıyla eklendi") : "Yüklenen csv dosyasından kişiler alınamadı.",
              payload: payload
            }
            return result;
          }
        }
      break;
    }
  }
  get type(): string { return this.fileType };
  
  @Input() set hasLocalization(value: boolean) {
    if(value) {
      this.locales = value ? JSON.parse(JSON.stringify(this.appSettingsService.getLocalSettings("locales"))) : null;
      this.defaultLocale = this.locales.find(item => item.id == this.appSettingsService.getLocalSettings("defaultLocale"));
    }else{
      this.locales = null;
      this.defaultLocale = null;
    }
  };

  @Input() set localization(value: {} | string) {
    if(this.locales) {
      if(value) {
        let defaultLocaleId = this.appSettingsService.getLocalSettings("defaultLocale");
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

  locales: {id: string, code: string, value: string}[];
  defaultLocale: {id: string, code: string, value: string};
  filename: string;
  hasPreview: boolean;
  sourcePath: string;
  fileType: string;
  theme: string;

  get localization(): {} | string {
    let localization: {} = {};{
      this.locales.forEach( item => localization[item.id]=item.value);
    }
    let validLocale = this.locales.find( item => item.value && item.value.length > 0);
    return validLocale ? localization : null;
  }

  get completedLocalizations(): {id: string, value: string}[] { return this.locales ? this.locales.filter( item => item.value != null && item.value.length > 0) : null };

  private sasKeyRequest;
  private sasKeyUrl;
  private uploadSubscription;

  constructor(
    private authenticationService: AuthenticationService,
    private appSettingsService: AppSettingsService,
    private http: Http,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    let channelCode = this.authenticationService.getUserChannelCode();
    let firmCode = this.authenticationService.getUserFirmCode();
    let baseUrl = environment.api.host + '/' + environment.api.path + '/' + firmCode + '/' + channelCode;
    let apiUrl = baseUrl + '/Account/GetSasKey';
    this.authenticationService.isLoggedIn$.subscribe( user => {
      let token = this.authenticationService.getToken();
      if(token){
        this.sasKeyRequest = this.http.post(apiUrl,
          { "IpAddress": "", "ContainerName": 'static' }, { headers: this.getHeaders() })
          .map((response) => {
              let payload = (response && response["_body"]) ? response.json() : '';
              return payload.SasKeyWriteAccessKey;
          });
          this.sasKeyRequest.subscribe(sasKeyUrl => {
            this.sasKeyUrl = sasKeyUrl.split('?');
          })
      }
    });

    this.sourcePath = this.appSettingsService.getLocalSettings("assetsCDNSource");
  }

  ngOnDestroy() {
    
  }

  openLocalizationBox() {
    let component: ComponentRef<LocalizationBoxComponent> = this.resolver.resolveComponentFactory(LocalizationBoxComponent).create(this.injector);
    let localizationBox: LocalizationBoxComponent = component.instance;
    
    localizationBox.locales = this.locales;
    localizationBox.target = {label: this.label || this.name, name: this.name, input: "file-upload", type: this.fileType};
    
    this.tether.modal(component).then( result => {
      this.defaultLocale = this.locales.find(item => item.id == this.appSettingsService.getLocalSettings("defaultLocale"));
      if(this.defaultLocale) this.value = this.defaultLocale.value;
      this.changeEvent.emit({locales: this.locales, localization: this.localization, value: this.value});
    }).catch( reason => {
      this.defaultLocale = this.locales.find(item => item.id == this.appSettingsService.getLocalSettings("defaultLocale"));
      if(this.defaultLocale) this.value = this.defaultLocale.value;
      this.changeEvent.emit({locales: this.locales, localization: this.localization, value: this.value});
    });
  }

  inputChangeHandler(event) {
    this.createFile(event);
  }

  removeFile(event) {
    this.value = null;
    this.fileInput.nativeElement.value = null;
    if(this.defaultLocale) this.defaultLocale.value = this.value;
    this.changeEvent.emit(this.locales ? {locales: this.locales, localization: this.localization, value: this.value} : this.value);
  }

  private createFile(event) {
    let file = event.dataTransfer ? event.dataTransfer.files[0] : event.target.files[0];

    if(file){
      if(this.maxFileSize && file.size > this.maxFileSize) {
        alert('Seçtiğiniz dosya büyüklüğü maksimum ' + this.maxFileSize / 1024 + 'Kb büyüklüğünde olmalıdır.')
        this.removeFile(null);
        return;
      };

      if(file.name.substr(0, 1) == ".") {
        alert(". ile başlayan dosya isimleri kullanılamaz.");
        return;
      }
      let filetype: string = file.type && file.type.length ? file.type : "."+(file.name.split('.')[1]);
      
      if(this.fileTypes && this.fileTypes.length && !filetype.match(this.fileTypes.join('|'))) {
        filetype = "."+(file.name.split('.')[1]);
        if(!filetype.match(this.fileTypes.join('|'))) {
          alert('Sadece '+ this.fileTypes.join(",") +' türünde dosya yükleyebilirsiniz.');
          this.removeFile(null);
          return;
        }
      }

      let extension = this.getFileExtension(file.name);
      let filenameParts = file.name.split("."+extension);
      
      if(!extension) {
        alert('Bilinmeyen bir türde dosya seçtiniz');
        this.removeFile(null);
        return;
      }
      //this.filename = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 12) + '.' + filenameParts[1];
      this.filename = this.addTimestampToFilename ? this.sanitizeFilename(filenameParts[0]) + "_" + Math.round(moment(new Date()).valueOf()/1000) + "." + extension : this.sanitizeFilename(filenameParts[0]) + "." + extension;
      let reader: FileReader = new FileReader();
      let self = this;
      reader.onload = function(readerEvent) {
        let validation: {valid: boolean, message: string, payload?: any} = self.validateFile ? self.validateFile(file, this.result) : null;
        if(validation) {
          if(validation.valid) {
            if(self.autoUpload) {
              self.startUpload(self.filename, this.result);
            }else{
              self.value = file.name;
              self.changeEvent.emit({file: file, fileData: this.result, payload: validation.payload});
            }
            if(self.validationEvent.observers.length) {
              self.validationEvent.emit(validation);
            }else {
              if(self.showNotification) self.notificationService.add({text: validation.message, type: "success"});
            }
          }else{
            if(self.validationEvent.observers.length) {
              self.validationEvent.emit(validation);
            }else {
              if(self.showNotification) self.notificationService.add({text: validation.message, type: "warning"});
            }
          }
        }else{
          if(self.autoUpload) {
            self.startUpload(self.filename, this.result);
          }else{
            self.value = file.name;
            self.changeEvent.emit({file: file, fileData: this.result, payload: validation.payload});
          }
        }
      }
      switch(this.type) {
        case "image":
          reader.readAsArrayBuffer(file);
        break;
        default: 
          reader.readAsText(file);
        break;
      }
    }else{

    }
  }

  private startUpload(filename: string, file: ArrayBuffer){
    this.isPromising = true;
    let url = this.sasKeyUrl[0] + '/' + filename + '?' + this.sasKeyUrl[1];
    this.uploadSubscription = this.http.put(url, file, { headers: this.getUploadHeaders() });
    this.uploadSubscription.subscribe(result => {
      if(result.status === 201){
        //let fileUrl = result.url.split("?");
        this.isPromising = false;
        this.value = filename;
        if(this.defaultLocale) this.defaultLocale.value = this.value;
        this.changeEvent.emit(this.locales ? {locales: this.locales, localization: this.localization, value: this.value} : this.value);
      }else {
        this.isPromising = false;
        this.notificationService.add({text: "Dosya yükleme işlemi başarısız oldu", type: "danger"});
        this.removeFile(null);
      }
    });
    this.changeDetector.detectChanges();
  }

  private getFilename(filename: string) {
    let extension = this.getFileExtension(filename);
    let nameParts = filename.split("."+extension);
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 12) + '.' + extension;
  }

  private sanitizeFilename(s: string) {
    var letters = { 
      "İ": "i", "ı": "i", 
      "Ş": "s", "ş": "s", 
      "Ğ": "g", "ğ": "g", 
      "Ü": "u", "ü": "u", 
      "Ö": "o", "ö": "o", 
      "Ç": "c", "ç": "c" };
    s = s.replace(/[İıŞşĞğÜüÖöÇç]/gi, function(letter){ return letters[letter]; });
    s = s.replace(/\s/g, "-");
    s = s.replace(/[^a-z0-9-]/gi, '');
    return s.toLowerCase();
  }

  private getFileExtension(filename) {
    var ext = /^.+\.([^.]+)$/.exec(filename);
    return ext == null ? "" : ext[1];    
  }

  private getHeaders(): any {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let token = this.authenticationService.getToken();
    if (token) {
        headers.append('Authorization', 'bearer ' + token);
        return headers;
    } else {
      throw "token error";
    }
  }

  private getUploadHeaders():any {
    let headers = new Headers();
    headers.append('x-ms-blob-type', 'BlockBlob');
    headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    return headers;
  }
}
