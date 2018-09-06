import { Component, OnInit, Inject, Injector, ComponentFactoryResolver, ComponentRef,HostBinding } from '@angular/core';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { EntityService } from './../../../services/entity.service';
import { ShoppingCartService } from '../../../services/shopping-cart.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { PrintTicketV2Component } from './../../../modules/common-module/components/print-ticket-v2/print-ticket-v2.component';
import { MessageModalComponent } from "../../../modules/boxoffice-module/common/message-modal/message-modal.component";
import { OkcVariables } from "../../../classes/okc-variables";
@Component({
  selector: 'app-boxoffice-purchase',
  templateUrl: './boxoffice-purchase.component.html',
  styleUrls: ['./boxoffice-purchase.component.scss'],
  providers: [ EntityService],
  entryComponents:[PrintTicketV2Component,MessageModalComponent]
  
})
export class BoxofficePurchaseComponent implements OnInit {
	@HostBinding('class.or-boxoffice-purchase') true;
   	tabs: Array<any> = [{}];
   	result : Object;
   	currentState:any;
   	previousState:any;
	refId:string;
	expiresIn;
   	subscription;
	okcVariables = OkcVariables;
	voidCalled:any;
	ticketCount = 1;
	ticketCountText;
	subTitle;
  	constructor(
		private shoppingCartService:ShoppingCartService,
		private router : Router,
		private injector: Injector,
		private resolver: ComponentFactoryResolver,
		private tetherDialog: TetherDialog,
		private notificationService : NotificationService,
		private authenticationService : AuthenticationService,
		private entityService: EntityService
	) {
		//this.shoppingCartService.setCustomEndpoint('GotoPayment?includeStateModel=true', true)
	 }

  	ngOnInit() {
		  // Conflict Sonrası test edilmesi gerekli
/*		this.subscription = this.shoppingCartService.data.subscribe(results => {
			console.log("Current State Is",results);
			if(results && results['CurrentState'] == 4){
				
			}
			this.result = results["State"];
		});
*/
		let state = this.shoppingCartService.getCurrentState();			
		//	this.expiresIn = result["ExpiresIn"];
			if(state["ExpiresIn"] > 0 || state["ExpiresIn"] != null) {
					this.expiresIn = state["ExpiresIn"];
			}			
			if(state && state['State']){
				this.shoppingCartService.setCurrentState(state);
				if (state['CurrentState'] == 7) {
					this.currentState = state['State'];
					this.refId = state['State']['TransactionBasketRefId'];
					this.previousState = this.shoppingCartService.getPreviousState()['State'];
				}

			}

  }
  paymentActionHandler(event){
  	switch (event.action) {
  		case "redirect":
  			this.shoppingCartService.flushCustomEndpoint();
  			this.shoppingCartService.flushCart();
  			this.shoppingCartService.removeCartUser();
			this.router.navigate(['boxoffice']);
/*			this.authenticationService.refreshLogin().subscribe(refreshResult => 
				{
					if(refreshResult) {
						this.router.navigate(['boxoffice']);	
					}
				}
			);*/

  			this.notificationService.add({text:'Ödeme başarıyla gerçekleştirilmiştir.', type:'success'});
  			
  		break;
		case "printTicket":
			this.notificationService.add({text:'Ödeme gerçekleştirilmiştir Biletiniz Basılıyor.', type:'success'});
			this.getPrintModal(event.transactionRefId);
			this.shoppingCartService.flushCustomEndpoint();
  			this.shoppingCartService.flushCart();
  			this.shoppingCartService.removeCartUser();
  						
		break;
		case "voidPayment":			
			if(event.type == 2) {
				this.ticketCountText = "Otomatik İptal İşlemi Başlatıldı.Kartı Pos Cihazına Takınız";
				this.subTitle = " Ödeme iptal ediliyor.Ödeme alındı, Bilet Oluşmadı.";
				this.voidPayment(event.paymentList[0]);		
			}
			else {
				this.ticketCountText = "İade Sonrası Ekranı Kapatıp Devam Edebilirsiniz";
				this.subTitle = "Hata Kayıt Altına Alındı ve Müşteri Bilgilendirildi.Lütfen Tahsilat Tutarını İade Ediniz.";
				this.getMessageModal();
			}

			//this.getMessageModal(event.paymentList[0],event.type);
		break;
  	}
  }


// CANCEL VER2
getMessageModal() {
	  let component: ComponentRef<MessageModalComponent> = this.resolver.resolveComponentFactory(MessageModalComponent).create(this.injector);
	  component.instance.title = "Satış Başarısız!";
	  component.instance.subTitle = this.subTitle ;
	  component.instance.ticketCount =  this.ticketCountText ;
	   this.tetherDialog.modal(component, {
			escapeKeyIsActive: false,
			outsideClickIsActive: false,			
			dialog: {style: {  maxWidth: "400px", width: "80vw", height: "20vh" }}
		}).then(result => {
			if(result.status == "success") {
				this.shoppingCartService.flushCustomEndpoint();
				this.shoppingCartService.flushCart();
				this.shoppingCartService.removeCartUser();	
				this.router.navigate(['boxoffice']);	
/*				this.authenticationService.refreshLogin().subscribe(refreshResult => 
					{
						if(refreshResult) {
							
						}
					}
				);*/							
				
			}
			// TODO: reload page?
			// this.router.navigate(['/transaction', `${this.pageID}?refresh`]);
		}).catch(reason => {
			if(reason) {
				this.router.navigate(['boxoffice']);
/*				this.authenticationService.refreshLogin().subscribe(refreshResult => 
					{
						if(refreshResult) {
								
						}
					}
				);*/				
			}
		});	
		
}

closeModal_2() {
  	this.tetherDialog.close( {
  		status: 'onSleep'
  	});
  }

voidPayment(element) {
	let paymentVoidRequest =  {};
	paymentVoidRequest['Amount'] = element['decimalTotalReceiptAmount'],
	paymentVoidRequest['BankBkmId'] = element['bankBkmId'],
	paymentVoidRequest['BatchNo'] =  element['batchNo'],
	paymentVoidRequest['Stan'] =   element['stan'],
	paymentVoidRequest['TerminalId'] = element['terminalId'];
	this.getMessageModal();
	setTimeout(() => {
		let paymentVoidRequestJson = JSON.stringify(paymentVoidRequest);
		let paymentVoidResponse = window["DeviceIntegrationInstance"].voidPayment(paymentVoidRequestJson);
		if (paymentVoidResponse.result.isTransactionSuccess) {
			if (paymentVoidResponse.result.deviceResultValue == this.okcVariables.VOID_PAYMENT_SUCCESS) {			 
				 var start = new Date().getTime();
					 for (var i = 0; i < 1e7; i++) {
					   if ((new Date().getTime() - start) > 5000){					  	
						 break;
					   }	
					 }

		   }
		   else {
			   this.closeModal_2();
			   this.ticketCountText = "Otomatik Ödeme İptali Başarısız Oldu!";
			   this.subTitle = "Fiş Üzerindeki bilgilerle Pos Üzerinden Manuel İptal Yapınız";
			   this.getMessageModal();				
		   }
		this.closeModal_2();
		this.subTitle = "Ödeme iptal edildi.";
		this.ticketCountText = "Devam Etmek İçin Lütfen Ekranı Kapatınız";
		this.getMessageModal();		   
	   }
	},2000)
}




  closeModal() {
  	this.tetherDialog.close( {
  		status: 'success'
  	});
  } 

  getPrintModal(basketRefId?:any) {
	  let component: ComponentRef<PrintTicketV2Component> = this.resolver.resolveComponentFactory(PrintTicketV2Component).create(this.injector);
		component.instance.basketRefId = basketRefId;
		this.tetherDialog.modal(component, {
			escapeKeyIsActive: false,
			outsideClickIsActive: false,			
			dialog: {style: { maxWidth: "400px", width: "40vw", height: "5vh" }}
		}).then(result => {
			if(result.status == "success") {
				this.router.navigate(['boxoffice']);
/*				this.authenticationService.refreshLogin().subscribe(refreshResult => 
					{
						if(refreshResult) {
							this.router.navigate(['boxoffice']);	
						}
					}
				);*/				
				
			}
			// TODO: reload page?
			// this.router.navigate(['/transaction', `${this.pageID}?refresh`]);
		}).catch(reason => {
			if(reason) {
				this.router.navigate(['boxoffice']);
/*				this.authenticationService.refreshLogin().subscribe(refreshResult => 
					{
						if(refreshResult) {
							this.router.navigate(['boxoffice']);	
						}
					}
				);	*/			
			}
		});
  }
  
	ngOnDestroy(){
  		if(this.subscription) this.subscription.unsubscribe();
  	}

	private goBack(){
		this.shoppingCartService.goBack().subscribe(result => {
			this.shoppingCartService.setCurrentState(result);
			let goback = this.shoppingCartService.redirectToCorrectStateRoute();
			this.router.navigate(goback['routerLink']);
		})
	}	  

}
