import { Component, OnInit, HostBinding, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { ShoppingCartService } from '../../../services/shopping-cart.service';
import { NotificationService } from '../../../services/notification.service';
import { HeaderTitleService } from '../../../services/header-title.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { environment } from './../../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Http, URLSearchParams, Headers, RequestOptions} from "@angular/http";
import { VenueTemplateEditorComponent } from "../../../modules/common-module/components/venue-template-editor/venue-template-editor.component";

@Component({
  selector: 'app-boxoffice-select-seat',
  templateUrl: './boxoffice-select-seat.component.html',
  styleUrls: ['./boxoffice-select-seat.component.scss']
})
export class BoxofficeSelectSeatComponent implements OnInit, AfterViewInit {
	@HostBinding('class.or-boxoffice-seat-select') true;
	@ViewChild(VenueTemplateEditorComponent) venueTemplateEditor: VenueTemplateEditorComponent;
	subscription;
	state;
	firmCode;
	channelCode;
	selectedSeatList;
	selectedSeatCount:number = 0;
	isValid:boolean = false;
	roles : Object = {1:'sales_screen_box_office', 2:'sales_screen_box_office'};
	editorRole : string;
	status:number = 0;
	showBe:boolean = true;
	reRender:boolean = false;
	performanceId;
	productId;
	environmentApiPath: string = environment["api"]["boxoffice"] + "/" + environment["api"]["path"] + "/";
  	constructor(
		private shoppingCartService : ShoppingCartService,
		private router: Router, 
		private route : ActivatedRoute,
		private headerTitleService:HeaderTitleService,
		private authenticationService : AuthenticationService,
		private notificationService : NotificationService,
		
  	) {
  		this.channelCode = authenticationService.getUserChannelCode();
  		this.firmCode = authenticationService.getUserFirmCode();
		this.shoppingCartService.setCustomEndpoint('SelectSeats?includeStateModel=true', true);		
  	}

	ngOnInit() {
			
	}
	ngAfterViewInit() {
			this.reRender = true;
			//this.shoppingCartService.removeSeat();
			this.subscription = this.shoppingCartService.data.subscribe(result => {
				this.shoppingCartService.setCurrentState(result);
				if (result && result['CurrentState'] == 2) {
					this.state = result['State'];
					this.productId = this.state['CurrentProductId'];
					this.performanceId = this.state['CurrentPerformanceId'];
					this.editorRole = this.roles[this.state['ProductSelectionType']];
					this.selectedSeatCount = 0;
				}
			}, error => {
	          let resulta = this.shoppingCartService.handleStateError(error);
	          if(resulta['action'] == 'notifyAndRedirect'){
	            this.notificationService.add({text:resulta['notification'], type:'warning'});
	            this.router.navigate(resulta['routerLink']);
	          }else{
	            this.notificationService.add({text:error['Message'], type:'warning'});
	          }
        });
		this.shoppingCartService.setCustomEndpoint('GetCurrentState?includeStateModel=true', true);
		this.shoppingCartService.query({});					
		this.selectedSeatCount = 0;

	}
  	ngOnDestroy(){
  		if(this.subscription) this.subscription.unsubscribe();
		  
  	}
	goBackPreviousState() {
		this.shoppingCartService.removeSeat();
		//console.log(this.shoppingCartService.getCurrentState());
		if(this.shoppingCartService.getCurrentState()['CurrentState'] == 2) {
			this.shoppingCartService.goBack().subscribe( goBackResult => {
				this.shoppingCartService.setCurrentState(goBackResult);
				let goback = this.shoppingCartService.redirectToCorrectStateRoute();
				this.router.navigate(goback['routerLink']);			
			})
		}
	}
	saveEditorAndGo(status:Object) {
		//console.log("Save and Go Status",status['validStatus']);
		
		if(status['validStatus'] == true)
		{
			this.reRender = false;
			if(this.shoppingCartService.getSelectedSeat())
			{
				//console.log("This State",this.state);
				this.shoppingCartService.setCustomEndpoint('SelectSeats?includeStateModel=true', true);
	/*			this.shoppingCartService.setCustomEndpoint('GetCurrentState', true);
				this.shoppingCartService.query({});	*/			
				let save = this.shoppingCartService.create(this.shoppingCartService.getSelectedSeat());
				save.subscribe(result => {
					this.shoppingCartService.setCurrentState(result);
					//console.log("Result Log",result);
					


					if(result && result['CurrentState'] == 4) {
						this.router.navigate(['boxoffice', 'basket']);
					}
					else if(result && result['CurrentState'] == 8)
					{
						this.router.navigate(['boxoffice', 'collect-data']);
					}
					else if(result && result['CurrentState'] == 2) {
							this.performanceId  = result['State']['CurrentPerformanceId'];
							this.productId =  result['State']['CurrentProductId'];
							this.state = result['State'];
							this.editorRole = this.roles[this.state['ProductSelectionType']];
							this.reRender = true;
							this.router.navigate(['boxoffice', 'select-seat']);					
					}		
				}, error => {
					if (error) {
						if (error['Type'] === 2) {
							this.notificationService.add({
								type: 'warning',
								text: `${error['ErrorCode']}: ${error['Message']}`
							});
						} else {
							this.notificationService.add({
								type: 'warning',
								text: 'İşleminiz gerçekleştirilirken bir hata oluştu. Lütfen tekrar deneyiniz.'
							});
						}
						this.shoppingCartService.goBack().subscribe(
							response => {
								this.shoppingCartService.setCurrentState(response);
								let goback = this.shoppingCartService.redirectToCorrectStateRoute();
								this.router.navigate(goback['routerLink']);
							});
					}
				})
			}
		}
		else {
			
			this.onPromise(true).then(result => {
				if(result) {
					this.notificationService.add({ text: 'Lütfen Koltuk/Blok Seçimlerinizi Eksiksiz Yapınız!', type: 'warning', timeOut:5000 });
				}
			})
		}
			
	}
	onPromise (status) {
		return new Promise(resolve => {
			resolve(status);
		})
	}
	selectEditorHandler(event) {

		let seatData = [];
		let blockData = [];
		this.isValid = false;
		this.selectedSeatCount = 0;	
		this.selectedSeatList = event.payload;	
		if(typeof event.payload == 'string') {
			this.selectedSeatCount  = 0;

		}
		else {
			this.selectedSeatCount = this.selectedSeatList.length;	
		}
		switch(event.type){
			
			case 'JSB:EVENT_SELECT':
				if(event.payload.length > 0)
				
				{
					let seat = {};
					if(this.state['ProductSelectionType']== 2) {
						
						for(let i  = 0; i < this.selectedSeatList.length; i++) {
							seatData.push({
								"RowId": this.selectedSeatList[i]['RowId'],
								"SeatId": this.selectedSeatList[i]["Id"]							
							});
						}
						seat["Seats"] = seatData;
						this.selectedSeatCount = seatData.length;
	
						if(this.selectedSeatCount == this.state['RemainingProductSelections']){
							this.isValid = true;
						}
						else if(this.selectedSeatCount > this.state['RemainingProductSelections']) {
							this.selectedSeatCount == this.state['RemainingPorductSelections'];
							this.isValid = false;
							this.notificationService.add({ text: 'Seçebileceğiniz maksimum koltuk adedini aştınız.', type: 'danger', timeOut:3000 });
						}
					}
					if(this.state['ProductSelectionType'] == 1){
						this.isValid = true;
						if(this.selectedSeatList[0]["Id"] != undefined)
						{
							seat = {
								"BlockId": this.selectedSeatList[0]["Id"]
							}
						}
						else {
							this.isValid = false;
							Object.keys(seat).length = 0;
						}					
					}
					this.shoppingCartService.selectSeat(seat)	
					//console.log(event.payload, seat);			
				}				
			break;
		}
	}

  	venueEditorEventHandler(event) {
		//console.log("Seçilen Event ",event.payload);
		this.isValid = false;
		
		if(this.selectedSeatCount > this.state["RemainingProductSelections"]) {
			this.selectedSeatCount = this.state["RemainingProductSelections"];
			this.isValid = false;
		}
		else if( this.selectedSeatCount == this.state["RemainingProductSelections"])
		{
			this.isValid = true;
		}		
		this.selectedSeatList = event.payload;
		
	    switch(event.type) {
	    	case 'JSB:EVENT_SELECT':
				for(let i = 0 ; i < this.selectedSeatList.length ; i++)
				{
					if(this.selectedSeatList){
						//console.log(this.selectedSeatList[i]);
						this.selectedSeatCount = this.selectedSeatList.length;
						let seat = {};
						let dat = [];
						if(this.state['ProductSelectionType'] == 2) {
							
							dat.push({
								"RowId": this.selectedSeatList[i]['RowId'],
								"SeatId": this.selectedSeatList[i]["Id"]
							})
							
							seat["Seats"] = dat;
							//console.log(seat["Seats"]);
						}
						if(this.state['ProductSelectionType'] == 1) {
							seat = {
								"BlockId": this.selectedSeatList[i]["Id"]
							}
						}
						this.shoppingCartService.selectSeat(seat);
					}
					else {
						this.shoppingCartService.removeSeat();
					}
					break;
				}
				
	    	}
  		}
}
