
import { Component, OnInit, Input,HostBinding } from '@angular/core';
import { ShoppingCartService } from "../../../services/shopping-cart.service";
import { Router } from '@angular/router';
import { NotificationService } from "../../../services/notification.service";
import { OkcVariables } from "../../../classes/okc-variables";

@Component({
  selector: 'app-boxoffice-basket',
  templateUrl: './boxoffice-basket.component.html',
  styleUrls: ['./boxoffice-basket.component.scss']
})
export class BoxofficeBasketComponent implements OnInit {

	@HostBinding('class.or-boxoffice-basket') true;

   	tabs: Array<any> = [{}];
   	result:any;
    isToggleOpen = [];
   	subscription;
	validationResult;
	currentState:{description:string,id:number};
	okcVariables = OkcVariables;
    @Input() isDisabled:boolean;
  	constructor(
		private shoppingCartService:ShoppingCartService,
		private router : Router,
		private notificationService : NotificationService
	) {
		this.shoppingCartService.setCustomEndpoint('GotoBasket?includeStateModel=true',true);
	 }

  	ngOnInit() {
		this.shoppingCartService.setCustomEndpoint('GetCurrentState?includeStateModel=true', true);
		this.shoppingCartService.query({});	
		
		this.subscription = this.shoppingCartService.data.subscribe(results => {
					
					this.shoppingCartService.setCurrentState(results);
					
					if(results && results['CurrentState']){
						
						if(results && results['CurrentState'] == 4 && results["State"]["Events"].length > 0){
							this.result = results["State"];
							this.currentState = {description:'Basket',id:results['CurrentState']};
							
						}
					}
				},error => {
					let result = this.shoppingCartService.handleStateError(error);
					if(result['action'] == 'notifyAndRedirect'){
						this.notificationService.add({text:result['notification'], type:'warning'});
						this.router.navigate(result['routerLink']);
					}else{
						this.notificationService.add({text:error['Message'], type:'warning'});
					}
				});


  }
  paymentActionHandler(event){
  	switch (event.action) {
  		case "redirect":
  			this.shoppingCartService.flushCustomEndpoint();
  			this.shoppingCartService.flushCart();
  			this.shoppingCartService.removeCartUser();
  			this.notificationService.add({text:'Ödeme başarıyla gerçekleştirilmiştir.', type:'success'})
  			this.router.navigate(['boxoffice']);
  		break;
  	}
  }
	ngOnDestroy(){
  		if(this.subscription) this.subscription.unsubscribe();
  	}

  maxProductCount(product){
		return (product && product['MaxAllowedCountOfProducts'] && product['MaxAllowedCountOfProducts'] > 0) ? product['MaxAllowedCountOfProducts'] : 0;
	}
  toggle($event,index) {
		
		this.isToggleOpen[index] = $event;
	}

	actionHandler(params) {
		
		switch(params.action) {
			case('goto'):
				this.router.navigate(['boxoffice',params.data,'products']);
			break;
			case('refreshState'):
				this.result = params.state["State"];
				
			break;
			case('error'):
				this.validationResult = params.validation;
				
			break;
			case('emptyfield'):
				
			break;
		}
	}

	processAmount(amount) {
		return +(Math.floor(Number(amount) * 1000) / 1000).toFixed(2);
	}
	totalPriceDetailAmount(subtotal) {
		let total = 0;
		subtotal.PriceDetails.forEach(price => {
			//console.log("Ticketing Fee",price.TicketingFee);
			if (price.ServiceFee) {
				total += price.ServiceFee;
			}
			if (price.TicketingFee) {
				total += price.TicketingFee;
			}
		})
		total += subtotal.TransactionAmount;
		return this.processAmount(total);
	}

	private goToPayment() {
		this.shoppingCartService.setCustomEndpoint('GotoPayment?includeStateModel=true', true);
		let changeState = this.shoppingCartService.create({}); 
		let cancelReceiptResponse = window['DeviceIntegrationInstance'].cancelReceipt();
		if (cancelReceiptResponse.result.isTransactionSuccess) {
	        if (cancelReceiptResponse.result.deviceResultValue == this.okcVariables.CABLE_ERROR) {
	          	this.notificationService.add({ text: 'İletişim Problemi !! Lütfen OKC Cihazı Kablosunu Kontrol Ediniz.', type: 'warning' });
	        }
			else {
				changeState.subscribe(result => {
					if(result && result['State']) {
						switch(result['CurrentState']) {
							case(7):
								this.shoppingCartService.setCurrentState(result);
								this.router.navigate(['boxoffice', 'purchase']);
							break;
							case (8):
								this.shoppingCartService.setCurrentState(result);
								this.router.navigate(['boxoffice', 'collect-data'])
							break;
						}
					}					
				},error => {
					let result = this.shoppingCartService.handleStateError(error);
					//console.log('result',result)
					if(result['action'] == 'notifyAndRedirect'){						
						this.notificationService.add({text:result['notification'], type:'warning'});
						this.router.navigate(result['routerLink']);
					}else{
						this.notificationService.add({text:error['Message'], type:'warning'});
					}
				})
			}		

		}
		else {
	        this.notificationService.add({ text: 'Bir hata oluştu işleme devam edilemiyor', type: 'danger' });
	    }

		// this.router.navigate(['boxoffice', 'purchase']);
	}
	goToSimulate() {
		this.shoppingCartService.setCustomEndpoint('GotoPayment?includeStateModel=true', true);
		let changeState = this.shoppingCartService.create({}); 		
		changeState.subscribe(result => {
			if(result && result['State']) {
				switch(result['CurrentState']) {
					case(7):
						this.shoppingCartService.setCurrentState(result);
						this.router.navigate(['boxoffice', 'purchase']);
					break;
					case (8):
						this.shoppingCartService.setCurrentState(result);
						this.router.navigate(['boxoffice', 'collect-data'])
					break;
				}
			}					
		},error => {
			let result = this.shoppingCartService.handleStateError(error);
			
			if(result['action'] == 'notifyAndRedirect'){						
				this.notificationService.add({text:result['notification'], type:'warning'});
				this.router.navigate(result['routerLink']);
			}else{
				this.notificationService.add({text:error['Message'], type:'warning'});
			}
		})		
	}
	countProductSelected() {
		let toplam = 0;
		for(let i = 0 ; i < this.result['Events'].length; i++) {
			toplam += this.result['Events'][i].CountOfProductsSelected
		}
		return toplam;
	}
	private totalDiscount(){
		return this.result['SubTotal']['TotalAmount'] - this.result['SubTotal']['CalculatedTotalAmount'];
	}

	resultEvent(event) {
		this.goToSimulate(); 
		
	}


}
