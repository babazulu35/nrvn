import { HeaderSearchBarComponent } from './../../modules/common-module/components/header-search-bar/header-search-bar.component';
import { FeedbackFormComponent } from './../../modules/common-module/common/feedback-form/feedback-form.component';
import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { RelativeDatePipe } from './../../pipes/relative-date.pipe';
import { Component, OnInit, ComponentFactory, ComponentFactoryResolver, Injector, Input, ChangeDetectorRef, ComponentRef, ViewChild, ElementRef, Inject } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '../../services/translate.service';
import { NotificationService } from '../../services/notification.service';
import { EntityService } from '../../services/entity.service';

@Component({
  	selector: 'app-index',
  	templateUrl: './index.component.html',
  	styleUrls: ['./index.component.scss'],
  	entryComponents: [ HeaderSearchBarComponent ],
  	providers: [EntityService,{provide: 'entityServiceInstance1', useClass: EntityService },{provide: 'entityServiceInstance2', useClass: EntityService },{provide: 'entityServiceInstance3', useClass: EntityService },{provide: 'entityServiceInstance4', useClass: EntityService },{provide: 'entityServiceInstance5', useClass: EntityService},{provide: 'entityServiceInstance6', useClass: EntityService},{provide: 'entityServiceInstance7', useClass: EntityService},{provide: 'entityServiceInstance8', useClass: EntityService},{provide: 'entityServiceInstance9', useClass: EntityService}]
})
export class IndexComponent implements OnInit {
	
	selectedSeats=[];
	relocatedSeats=[];
	isSelected= [];
	simulatedSeats:Array<Object>;

	isRelocate:boolean;
	
	// Komple Alınacak alan

	



	errorMessage;
  	constructor(
        private route: ActivatedRoute,
        private router: Router,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        private tetherService: TetherDialog,
        private translateService : TranslateService,
		private changeDetector: ChangeDetectorRef,
		private notificationService : NotificationService,
		private entityService:EntityService,
		@Inject('entityServiceInstance1') private basketDataService: EntityService,
		@Inject('entityServiceInstance2') private productPerformanceService: EntityService,
		@Inject('entityServiceInstance3') private getOwnerService: EntityService,
		@Inject('entityServiceInstance4') private accessCodeService: EntityService,
		@Inject('entityServiceInstance5') private selectedSeatService: EntityService,
		@Inject('entityServiceInstance6') private venueRowService: EntityService,
		@Inject('entityServiceInstance7') private venueSeatService: EntityService,
		@Inject('entityServiceInstance8') private venueBlockService: EntityService,
		@Inject('entityServiceInstance9') private getImageService: EntityService,
	
    ) {
  		// notificationService.add({type:'success'});
  		// setTimeout(function(){
  		// 	notificationService.add({type:'warning'});
  		// }, 1000)
    }

	ngOnInit() {

	this.selectedSeats = [{ number:'B01-C6'},{number:'B01-C7'},{number:'B01-C8'},{number:'B01-C9'},{number:'B01-C10'},{number:'B01-C11'},{number:'B01-C12'},{number:'B01-C13'},{number:'B01-C14'},{number:'B01-C15'}]
  	}
	prepareQuery(service, key,  ids){
		service.where(key, '=', ids[0]);
		if(ids.length > 1){
			for (let i = 1; i < ids.length; i++) {
				service.or(key, '=', ids[i]);
			}
		}
	}
	chexkBoxEvent($event) {
		console.log("check event",$event);
	}

	log(value){
		console.log(value);
	}

	showContentOverlay() {
		let component: ComponentRef<HeaderSearchBarComponent> = this.resolver.resolveComponentFactory(HeaderSearchBarComponent).create(this.injector)
        let instance: HeaderSearchBarComponent = component.instance;
		this.tetherService.content(component);
	}

	feedback(){
		this.tetherService.confirm({
			title: 'Etkinliği iptal etmek istiyor musunuz?',
			description:'<b>DİKKAT!</b> Bu işlem geri alınamaz.',
			feedback: {label: 'İPTAL NEDENİ'},
			confirmButton: {label: 'İPTAL ET'},
			dismissButton: {label: 'VAZGEÇ'}
			}).then( result => {
				console.log(result);
			}).catch( reason => {
				console.log(reason);
			})
	}

	confirm(){
		this.tetherService.confirm({
			title: 'Etkinliği Sil?',
			description:'<b>DİKKAT!</b> Silmek istediğinizden emin misiiniz?',
			confirmButton: {label: 'SİL'},
			dismissButton: {label: 'VAZGEÇ'}
			}).then( result => {
				console.log(result);
			}).catch( reason => {
				console.log(reason);
			})
	}

	eventHandler(event){
		console.log("breadcrumb Event",event);
	}

	alert(){
		this.tetherService.confirm({
			title: 'Etkinlik silindi'}).then( result => {
				console.log(result);
			}).catch( reason => {
				console.log(reason);
			})
	}

	openContext(e){
		this.tetherService.context({
			title: "İŞLEMLER",
			data: [
				{ label: 'Kopyala', icon: 'layers', action: 'copy' },
				{ label: 'Gizle', icon: 'visibility', action: 'visibilityOn' },
				{ label: 'Göster', icon: 'visibility_off', action: 'visibilityOff' },
				{ label: 'Arşivle', icon: 'archive', action: 'archive' },
				{ label: 'Sil', icon: 'delete', action: 'delete' },
			]
		}, {target: e.target, attachment: "top right", targetAttachment: "top right",}).then(result => {
			console.log(result);
			switch(result['action']) {
				case "copy":
					this.tetherService.confirm({title: result["label"]}).then(res=>{}).catch(err=>{});
				break;
				case "delete":
					this.tetherService.confirm({title: result["label"], description:"<b>DİKKAT!</b> Silmek istediğinize emin misiniz?", confirmButton:{label: "SİL"}, dismissButton:{label: "VAZGEÇ"}}).then(res=>{}).catch(err=>{});
				break;
			}
		}).catch(reason=>{});
	}

	// Koltuk Ekleme Componenti
	resultEvent($event){
		this.isRelocate = $event.isRelocated;
		if($event.isRelocate == false) {
		console.log("Action Event Result" + $event.currentSeat + ' New Seat' + $event.newSeat);
	}	
}
	events(event){
		console.log("finale event" + event);
	}

	print() {
	
	let printContents = document.getElementById('prints').innerHTML; 
	
	let popUp = window.open('','_blank','top=0,left=0,heigth:50%,width:80%');

	popUp.document.open();
	popUp.document.write(`
		<html>
		<head>
			<style>
				@page { size: ticket}
			</style>
		</head>
			<body class="ticket" onload="window.print();window.close()">
				
					${printContents}
				
			</body>
		</html>
	
	`);
	popUp.document.close();
	

}

printDiv() {
	let printContents = document.getElementById('prints').innerHTML; 
	if(window) {
		
			let popup = window.open('','',"top=200,left=200,width:300,height=300");
			popup.window.focus();
			popup.document.open();
			popup.document.write(`
			 <!DOCTYPE html><html><head>
			 	<link rel="stylesheet" href="/assets/ticket.css" media="print,screen">
				 <style>
					@page { size: ticket}
				 </style>
				</head>
				<body class="ticket" onload="window.print();window.close()">	
					${printContents}					
				</body> 
				</html>
			`);

			popup.onbeforeunload = function(event) {
				popup.close();
				return '.\n';
			}

			popup.onabort = function(event) {
				popup.document.close();
				popup.close();
			}

	}

}



}