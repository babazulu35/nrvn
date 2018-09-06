import { environment } from './../../../../../environments/environment';
import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { ContextMenuComponent } from './../context-menu/context-menu.component';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Input, ElementRef, ViewChild, Renderer, HostBinding, ChangeDetectorRef, ComponentRef, ComponentFactoryResolver, Injector, Inject, EventEmitter, Output, NgZone } from '@angular/core';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Http, Response, Headers, RequestOptions, RequestMethod, URLSearchParams } from "@angular/http";
import { AppSettingsService } from '../../../../services/app-settings.service';

declare var $:any;

@Component({
  selector: 'app-profile-photo',
  templateUrl: './profile-photo.component.html',
  styleUrls: ['./profile-photo.component.scss'],
  entryComponents: [ContextMenuComponent]
})
export class ProfilePhotoComponent implements OnInit {

	@ViewChild('uploadInput') uploadInput: ElementRef;
    @ViewChild('actionButton') actionButton: ElementRef;
    @HostBinding('class.c-profile-photo') true;
    emptyBox : Object;
  	response: any;
  	sizeLimit: number = 10000000; // 10MB
  	previewData: any;
  	errorMessage: string;
  	inputUploadEvents: EventEmitter<string>;
  	sasKeyRequest;
  	upload;
  	filterImageTypes : Array<Object>  = ['image/*'];

    @HostBinding('class.c-profile-photo--empty')
    isEmpty: boolean = true;

    @HostBinding('class.c-profile-photo--has-container')
    hasContainer: boolean = false;

    @HostBinding('class.c-profile-photo--circle')
    isCircle: boolean;

    @HostBinding('class.c-profile-photo--promise')
    isPromising: boolean;

    @Output() changeEvent: EventEmitter<Object> = new EventEmitter();

    @Input() set source(value: string) {
      this.imageSource = value;
      this.isEmpty = this.imageSource == null || this.imageSource.length == 0;
      if(this.imageSource) this.sanitizedImageSource = this.sanitizer.bypassSecurityTrustStyle("url('"+this.imageSource+"')");
      this.changeDetector.detectChanges();
    }

    @Input()
    set type(value:string) {
      this.imageType = value;
      switch(value) {
        case "avatar":
          this.hasContainer = true;
          this.emptyBoxData = {icon: 'add_a_photo', label: 'Profil Fotoğrafı Yükle'}
          this.imageActions = [{action: 'edit', label: 'Düzenle', icon: 'edit'}];
          this.isCircle = true;
        break;
        case "logo":
          this.emptyBoxData = {icon: 'add_circle_outline', label: 'Logo Yükle'}
          this.imageActions = [
            {action: 'edit', label: 'Düzenle', icon: 'edit'},
            {action: 'delete', label: 'Sil', icon: 'delete'}
          ];
          this.isCircle = false;
          this.filterImageTypes = ['image/png'];
        break;
        case "template-pic":
          this.emptyBoxData = {icon: 'add_circle_outline', label: 'Görsel Yükle'}
          this.imageActions = [
            {action: 'edit', label: 'Düzenle', icon: 'edit'},
            {action: 'delete', label: 'Sil', icon: 'delete'}
          ];
        this.isCircle = false;
        break;
        default:
          this.isCircle = false;
          this.emptyBoxData = {icon: 'add_a_photo', label: 'Fotoğraf Yükle'}
          this.imageActions = [
            {action: 'edit', label: 'Düzenle', icon: 'edit'},
            {action: 'delete', label: 'Sil', icon: 'delete'}
          ];
          this.isCircle = false;
      }
    }

    @Input() emptyBoxData : {label: string, icon:string} = {icon: 'add_a_photo', label: 'Profil Fotoğrafı Yükle'};

    @Input('actions') imageActions: {action: string, label: string, icon: string}[];

    get primaryAction(): {action: string, label: string, icon: string} {
      return this.imageActions && this.imageActions.length == 1 ? this.imageActions[0] : {action: 'openContext', label: "İşlemler", icon: 'more_vert' };
    }
    @Input() containerName : string = 'static';
    imageType: string;
    imageSource: string;
    sanitizedImageSource:any;
    contextMenu: ContextMenuComponent;
    imageData;
    apiUrl : string;
    sasKeyUrl : Array<any>;
    fileName : string;
  	constructor(
      private renderer: Renderer,
      private sanitizer: DomSanitizer,
      private changeDetector: ChangeDetectorRef,
      private resolver: ComponentFactoryResolver,
      private injector: Injector,
      public tether: TetherDialog,
	    private authenticationService : AuthenticationService ,
	    private http : Http,
	    private appSettingsService:AppSettingsService
      ) { }

  	ngOnInit() {
  		let channelCode = this.authenticationService.getUserChannelCode();
  		let firmCode = this.authenticationService.getUserFirmCode();
  		let baseUrl = environment.api.host + '/' + environment.api.path + '/' + firmCode + '/' + channelCode;
  		this.apiUrl = baseUrl + '/Account/GetSasKey';
  		if(this.authenticationService.getToken()){
        this.sasKeyRequest = this.http.post(this.apiUrl, { "IpAddress": "", "ContainerName": 'static' }, { headers: this.getHeaders() })
          .map((response) => {
              let payload = (response && response["_body"]) ? response.json() : '';
              return payload.SasKeyWriteAccessKey;
          });
        this.sasKeyRequest.subscribe(sasKeyUrl => {
          this.sasKeyUrl = sasKeyUrl.split('?');
          this.changeDetector.detectChanges();
        });
      }
      if(this.imageType == undefined) this.type = null;
      this.changeDetector.detectChanges();
  	}

  	handleInputChange(e) {
        let file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0],
        	pattern = '',
        	reader = new FileReader();
        	this.filterImageTypes.forEach(type => {
        		pattern += type + '|';
        	});
        	pattern = pattern.slice(0,-1);
		    if(file){
	        if (!file.type.match(pattern)) {
	            alert('Sadece '+ this.filterImageTypes.join() +' formatında görsel yükleyebilirsiniz.');
	            return;
	        }
	        let filename = file.name.split('.');
	        this.fileName = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 12) + '.' + filename[1];
	        reader.onload = this.handleReaderLoaded.bind(this);
	        reader.readAsArrayBuffer(file);
        }
    }
    handleReaderLoaded(e) {
        let reader = e.target;
        this.imageData = e.target.result;
		    this.startUpload();
   	}

    startUpload(){
    	this.isPromising = true;
    	let url = this.sasKeyUrl[0] + '/' + this.fileName + '?' + this.sasKeyUrl[1];
        this.upload = this.http.put(url, this.imageData, { headers: this.getUploadHeaders(this.imageData.length, '') });
        this.upload.subscribe(result => {
        	if(result.status === 201){
        		let fileUrl = result.url.split("?");
        		this.changeEvent.emit({action: "upload", data: this.fileName});
        		this.isPromising = false;
            this.source = fileUrl[0];
            
        	}
        });
    }

    openDialog() {
      //this.renderer.invokeElementMethod(this.uploadInput.nativeElement, 'click', []);
      $(this.uploadInput.nativeElement).click();
    }
    uploadErrorHandler() {

    }

    deletePhoto() {

    }

    deleteHandler() {
      this.source = null;
      this.uploadInput.nativeElement.value = null;
      this.changeEvent.emit({action: "delete", data: this.imageSource});
    }

    callAction(action:string) {
      switch(action) {
        case "openContext":
          let component:ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector)
          this.contextMenu = component.instance;

          this.contextMenu.title = "İŞLEMLER"
          this.contextMenu.data = this.imageActions;
          //this.contextMenu.iconSet = "photoUpload";

          this.tether.context(component, {
            target: this.actionButton.nativeElement,
            attachment: "top right",
            targetAttachment: "top right"
          }).then(result => {
            this.callAction(result['action']);
            this.contextMenu = null;
          }).catch( reason => {
            this.contextMenu = null;
          })
        break;
        case "edit":
          this.openDialog();
        break;
        case "delete":
          this.deleteHandler();
        break;
      }
    }

    getHeaders(): any {
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
    getUploadHeaders(length, type):any {
    	let headers = new Headers();
        headers.append('x-ms-blob-type', 'BlockBlob');
		//headers.append('Content-Length', length);
		//headers.append('Content-Type', 'image/png');
		headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        return headers;
    }
}
