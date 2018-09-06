import { InvoiceCustomerCheckComponent } from './../invoice-customer-check/invoice-customer-check.component';
import { Installments } from './../../../../models/installments';
import { Subscription } from 'rxjs/Subscription';


import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { NotificationService } from './../../../../services/notification.service';
import { ShoppingCartService } from './../../../../services/shopping-cart.service';
import { WizardHeaderComponent } from './../../../common-module/components/wizard-header/wizard-header.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, HostBinding, Input, ViewChild, ViewChildren, ElementRef, Output, EventEmitter, ComponentRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { OkcVariables } from '../../../../classes/okc-variables';
import { AuthenticationService } from "../../../../services/authentication.service";
import { MessageModalComponent } from './../../common/message-modal/message-modal.component';
import { LocalStorageService } from 'angular-2-local-storage';
import { InstallmentOptionsComponent } from '../installment-options/installment-options.component';
import { InstallmentService } from '../../../../services/installment.service';
import { InvoiceCustomerInfoBoxComponent } from '../invoice-customer-info-box/invoice-customer-info-box.component';
import { InvoiceCustomerInfo } from '../../../../models/invoice-customer-info';
import { TransactionServiceService } from '../../../../services/transaction-service.service';
//import { InvoiceTypes } from '../../../../models/invoice-types';


declare var $: any;

@Component({
	selector: 'app-multiple-payment-block',
	templateUrl: './multiple-payment-block.component.html',
	styleUrls: ['./multiple-payment-block.component.scss'],
	entryComponents:[MessageModalComponent,InstallmentOptionsComponent,InvoiceCustomerCheckComponent,InvoiceCustomerInfoBoxComponent],
	providers:[InstallmentService, TransactionServiceService]
})
export class MultiplePaymentBlockComponent implements OnInit {
	@ViewChild(WizardHeaderComponent) wizardHeader: WizardHeaderComponent;
	@ViewChildren('paymentInput') paymentInputs: ElementRef[];

	@HostBinding('class.c-multiple-payment-block') true;

	@Output() paymentActionEvent: EventEmitter<{ action: string, paymentData: any, paymentList: any[], transactionRefId?:any,type?:any }> = new EventEmitter();

	@Input() customerScore: number;

	//@Input() paymentTypes: {type: string, name: string, icon: string, amount?:number, isSelected?: boolean, isFocused?:boolean, isPromising?: boolean, params?: {paymentType: any}}[];
	@Input() paymentTypes: any = [];
	@Input() paymentList: { id: string, type: string, name: string, amount: number, info?: string, isPromising?: boolean, params?: { payment: any } }[];
	@Input() paymentListStorage: { id: string, type: string, name: string, amount: number, info?: string, isPromising?: boolean, params?: { payment: any } }[];
	@Input() remainingAmount: number;
	@Input() productCount: number;
	@Input() orderSummaryList: { name: string, amount: string }[];
	@Input() isBalanced: boolean;
	@Input() currency: string = "TL";
	okcVariables = OkcVariables;
	paymentOutput = [];
	customer;
	total;
	amountStore: any;
	lastInputPayment: any;
	paymentProcessType: number;
	@Input() state;
	levels: { key: string, title: string, params?: any }[];
	currentLevel: { key: string, title: string, params?: any };
	currentLevelIndex: number = -1;
	isPrintLastReceipt: boolean = false;
	currentState:any;
	isOnProcessType: boolean = true;
	selectedPayment: { type: string, name: string, icon: string, isSelected?: boolean, isPromising?: boolean, params?: { paymentType: any } };
	subscription;
	isPostPaymentSending : boolean = false;
	isTransactionCancelling : boolean = false;
	productIds : Array<any> = [];
	addToSlipStatus:number = 0;
	@Input() expiresIn:number;
	isExpired:boolean;
	private TCNumber : string;
	transactionBasketRefId:any;
	printAllowed:boolean = true;
	voidPaymentSuccess:boolean = false;
	isCancel:boolean = false;
	installmentFlag:boolean = false;
	installmentData:{BankBkmId:number,NumberOfInstallments:number};
	installments:Installments[];
	//invoiceTypes: InvoiceTypes;

	sendInvoiceTypeToService = false;
	invoiceCustomerInfo: InvoiceCustomerInfo;

	constructor(
		private shoppingCartService: ShoppingCartService,
		private notificationService: NotificationService,
		private router: Router,
		private resolver: ComponentFactoryResolver,
		private authenticationService : AuthenticationService,
		private injector: Injector,
		private localStorageService: LocalStorageService,
		private installmentService: InstallmentService,
		private transactionService: TransactionServiceService,
		public tetherService: TetherDialog) { }

	ngOnInit() {
		this.levels = [];		
		this.levels.push({ key: "payment", title: "ÖDEME İŞLEMLERİ" });
		this.levels.push({ key: "summary", title: "ALIŞVERİŞ ÖZETİ" });
		this.customer = this.shoppingCartService.getCartUser();
		this.customerScore = 0; //Kullanıcı puanı, servis bağlanınca maplenebilir veya getter olarak düzenlenebilir
		this.paymentProcessType = 0;
			if(this.state['Products'] && this.state['Products'].length > 0){
				//console.log("The State Data On Multiple Pay",this.state);
				this.state["PaymentOptions"].forEach(payment => {
					
				this.paymentTypes.push({
						Id: payment["Id"],
						Name: payment["Name"],
						Type: payment["Type"],
						TypeId: payment["TypeId"],
						Type_Desc: payment["Type_Desc"],
						icon: "account_balance_wallet",
						isSelected: false,
						isFocused: false
					})
				});
				this.total = this.state["SubTotal"];
				this.productCount = 0;
				this.remainingAmount = this.total.CalculatedTotalAmount;
				this.state['Products'].forEach(product=>{
					this.productIds.push(product['ProductId']);
				});
			}else{
				this.notificationService.add({text:'Seçmiş olduğunuz ürünler eklenememektedir.',type:'warning'});
				this.router.navigate(['/boxoffice']);
			}
		/*

			this.paymentTypes = [];
			this.paymentTypes.push({type: "creditCard", name: "KREDİ KARTI", icon: "credit_card"});
			this.paymentTypes.push({type: "bankTransfer", name: "BANKA HAVALESİ", icon: "note-multiple-outline"});
			this.paymentTypes.push({type: "cash", name: "NAKİT", icon: "account_balance_wallet"});
			this.paymentTypes.push({type: "customerScore", name: "PUAN", icon: "local_activity"});

		*/

		if (!this.paymentList) {
			this.paymentList = []; this.paymentListStorage = [];
		}		

		// if (this.addToSlipStatus !== 1) {
		// 	this.addProductsToSlip();
		// 	if (this.state.SubTotal.Discounts.length > 0 || this.state.SubTotal.Discounts != null ) {
		// 		this.discountAmount();
		// 	}
		// }


		this.gotoLevel(0);
		
		if(this.state.Installment)
		{
			this.installmentService.setCustomEndpoint('GetInstallments');
			this.installmentService.query({});
			this.installmentService.data.subscribe(result => {
				this.installments = result;
			})	
		}

/* 		if(this.state.InvoiceTypes.length) {
			this.invoiceTypes = <InvoiceTypes>this.state.InvoiceTypes;
			console.log("The Invoice Types",this.invoiceTypes);
		} */
	
	}

	ngAfterViewInit() {

	}
	
	payment(payment: {id:string,type:string,amount:number,name:string,info?:string,isBalanced?: boolean, balance?: any, paymentType?: any})
	{
		try {
			let acsToken = this.authenticationService.getToken();
			let refreshToken = this.authenticationService.getRefreshToken();
			if( (acsToken == '' || acsToken == undefined) || (refreshToken == '' || refreshToken == undefined) ) {
				this.notificationService.add({ text: 'Token Bilgisi Bulunamadığından Ödemeye Başlanamıyor', type: 'danger' });
			}
			else {
				let paymentRequest = {
					Amount: payment.amount,
					PaymentType: payment.type, //2 kk 1 nakit
					PaymentProcessType: this.paymentProcessType,
	                AccessToken: acsToken,
	                RefreshToken: refreshToken,
					InvoiceNumber: this.state['TransactionBasketRefId'],
									
					ReceiptMessages: [
					    {
					        MessageText: "Ref: " + this.state['TransactionBasketRefId'],
					        ReceiptMessageParameters: [this.okcVariables.ReceiptMessageType_Size24, this.okcVariables.ReceiptMessageType_CENTER, this.okcVariables.ReceiptMessageType_BOLD]
					    }
					]	
				};
				if(this.sendInvoiceTypeToService) {
					paymentRequest['InvoiceType'] = 2
				}				
				if(this.installmentFlag)
				{
					paymentRequest['BankBkmId'] = this.installmentData.BankBkmId;
					paymentRequest['NumberOfInstallments'] = this.installmentData.NumberOfInstallments;
				}
				
				let paymentRequestJson = JSON.stringify(paymentRequest);
				let paymentResponse = window['DeviceIntegrationInstance'].doPayment(paymentRequestJson);
				//console.log("paymnet request json",paymentRequestJson);
				if(paymentResponse.dynamicData != undefined && paymentResponse.dynamicData != null && paymentResponse.dynamicData != "" ) {
					let obj = JSON.parse(paymentResponse.dynamicData);
					let responseToken = obj.AccessToken;
					//console.log("Token From Tanju",responseToken);
					//console.log("Expires From Setted Storage",this.localStorageService.get('account')['expiresIn']);
					this.localStorageService.remove('account');
					this.localStorageService.set('account',{
						token: responseToken,
                        refreshToken: refreshToken,
                        expiresIn: this.expiresIn,
                        tokenTime: new Date().getTime()					
					})
				}
				if (paymentResponse.result.isTransactionSuccess) {
					if (paymentResponse.result.deviceResultValue == this.okcVariables.PAYMENT_SUCCESS) {
							this.paymentProcessType = 0;
							this.isCancel = false;
							this.finalizeProcess();	
					}
					else if (paymentResponse.result.deviceResultValue == this.okcVariables.PAYMENT_SUCCESS_BUT_NOT_PRINT_MF) {
							this.notificationService.add({ text: 'Ödeme Başarılı Bir Şekilde Tamamlandı.!! Son Aşamada Yetersiz Kağıt veya Cihaz Bağlantılarından Dolayı Bir Hata Oluşmuştur !!', type: 'warning', timeOut: 10000 });
							this.isPrintLastReceipt = true;
							this.confirm();
					}
					else if (paymentResponse.result.deviceResultValue == this.okcVariables.PAYMENT_FAILED_ON_FISCAL_PROCESS) {
						this.paymentProcessType = 1;
						this.isCancel = false;
						this.notificationService.add({ text: 'Mali İşlem Tamamlanamadı. Yetersiz Kağıt veya Cihaz Bağlantılarını Kontrol Ediniz!!', type: 'danger', timeOut: 10000 });
					}
					else if(paymentResponse.result.deviceResultValue == this.okcVariables.PAYMENT_FAILED_START_RETURN_PROCESS) {	
						//console.log("On Void Area");
						this.paymentActionEvent.emit({ action: "voidPayment", paymentData: [], paymentList: [paymentResponse.response],type: payment.type });
					}
					else if (paymentResponse.result.deviceResultValue == this.okcVariables.NO_PAPER) {
						this.msgHandler('NO_PAPER', 'warning');
					}
					else if (paymentResponse.result.deviceResultValue == this.okcVariables.CABLE_ERROR) {
						this.msgHandler('CABLE_ERROR', 'warning');
					}
					else if (paymentResponse.result.deviceResultValue == this.okcVariables.TIMEOUT) {
						this.msgHandler('TIMEOUT', 'warning');
					}
					else if (paymentResponse.result.deviceResultValue == this.okcVariables.PAYMENT_FAILED) {
						this.msgHandler('PAYMENT_FAILED', 'danger');
					}
					else {
						this.msgHandler('PAYMENT_FAILED', 'danger');
					}
				}
				else {
					this.msgHandler('PAYMENT_PROCESS_FAILED', 'danger');
				}					
			}


		}
		catch (err) {
			this.msgHandler('EXCEPTION', 'danger', err);
		}
	}
	
	makePayment_2(paymentType,amount,map?:string) {		

		if (this.addToSlipStatus !== 1) {
			this.addProductsToSlip();
			if (this.state.SubTotal.Discounts.length > 0 || this.state.SubTotal.Discounts != null ) {
				this.discountAmount();
			}
		}

		this.isCancel = true;
/* 		if (map != 'onFiscalError') {
			this.lastInputPayment = JSON.parse(JSON.stringify(paymentType));
			amount = "";
		} */		
		this.lastInputPayment = JSON.parse(JSON.stringify(paymentType));
		//console.log("Payment Type",paymentType);
		this.payment({
			id: Math.random().toString(30).substr(2, 5),
			type: paymentType.Type,
			name: paymentType.Type_Desc,
			amount: amount
		});
	}

	msgHandler(msgType: string, type: string, params?: any) {
		switch (msgType) {
			case ('CABLE_ERROR'):
				this.isTransactionCancelling = false;
				this.notificationService.add({ text: 'İletişim Problemi !! Lütfen OKC Cihazı Kablosunu Kontrol Ediniz.', type: type });
				break;
			case ('TIMEOUT'):
				
				this.notificationService.add({ text: 'ÖKC ürün satış işlemi sırasında zaman aşımı, işlem iptal ediliyor.', type: type });
				break;
			case ('PAYMENT_FAILED'):
				this.notificationService.add({ text: 'Ödeme başarısız oldu.', type: type });
				break;
			case ('NO_PAPER'):
				this.notificationService.add({ text: 'Yetersiz Kağıt.', type: type })
				break;
			case ('PAYMENT_PROCESS_FAILED'):
				this.notificationService.add({ text: "İşlem Başarılı Bir Şekilde Tamamlanamadı", type: type })
				break;
			case ('EXCEPTION'):
				this.notificationService.add({ text: "Bir Hata oluştu /" + params, type: type });
				break;
		}
	}

	cancelTransaction() {
		if(!this.isPostPaymentSending && !this.isTransactionCancelling){
			this.addToSlipStatus = 0;
			this.isTransactionCancelling = true;
			let cancelTransactionResponse = this.cancelReceiptProcess();
			if (cancelTransactionResponse == true) {
				
				//console.log("Current State Is",this.shoppingCartService.getCurrentState());

				this.shoppingCartService.setCustomEndpoint('GoBack', true);
				let changeState = this.shoppingCartService.create({});
				changeState.subscribe(state => {

					this.shoppingCartService.setCustomEndpoint('CancelProducts', true);
					let productIds = {"ProductIds": this.productIds};
					let cancelProducts = this.shoppingCartService.create(productIds);
					cancelProducts.subscribe(result=>{
						this.isTransactionCancelling = false;
						this.shoppingCartService.flushCart();
						this.expiresIn = result['ExpiresIn'];
						this.router.navigate(['/boxoffice']);
					}, error => {
						this.isTransactionCancelling = false;
						this.notificationService.add({ text: error['Message'], type: 'warning' })
					})
				})
			}
		}
	}

	removePayment(payment: { id: string }, event) {
		let paymentItem: any = this.paymentList.find(item => item.id == payment.id);
		if (paymentItem) {
			try {
				let paymentCancelRequest = {
					PaymentIndex: this.paymentListStorage.indexOf(paymentItem)
				};
				let paymentCancelRequestJson = JSON.stringify(paymentCancelRequest);
				let paymentCancelResponse = window["DeviceIntegrationInstance"].cancelPayment(paymentCancelRequestJson);
				if (paymentCancelResponse.result.isTransactionSuccess) {
					if (paymentCancelResponse.result.deviceResultValue == this.okcVariables.CANCEL_PAYMENT_SUCCESS) {
						paymentItem.isPromising = true;
						let balance: number = Number(this.remainingAmount) + Number(paymentItem.amount);
						if (isNaN(balance)) {
							if (confirm('Ödeme silme sırasında bir hata ile karşılaşıldı. Tüm ödemeler silinecek, onaylıyor musunuz?')) {
								let cancelAllResponse = window["DeviceIntegrationInstance"].cancelAllPayment();
								this.isBalanced = false;
								paymentItem.isPromising = false;
								paymentItem.amount = "";
							}
							return false;
						} else {
							let responseData = {
								Id: paymentItem.id,
								Balance: balance,
								IsBalanced: balance == 0
							}
							paymentItem.isPromising = false;
							this.isBalanced = responseData.IsBalanced;
							this.remainingAmount = this.processAmount(responseData.Balance); //paymentCancelResponse.response.decimalTotalRemainAmount; //Math.round(Number(responseData.Balance) * 100) / 100;

							this.paymentList.splice(this.paymentList.indexOf(paymentItem), 1);
							if (this.paymentList.length == 0) this.remainingAmount = this.total.CalculatedTotalAmount //TotalAmount;
						}
					}
					else if (paymentCancelResponse.result.deviceResultValue == this.okcVariables.NO_PAPER) {
						this.msgHandler('NO_PAPER', 'warning');
					}
					else if (paymentCancelResponse.result.deviceResultValue == this.okcVariables.CABLE_ERROR) {
						this.msgHandler('CABLE_ERROR', 'warning');
					}
					else if (paymentCancelResponse.result.deviceResultValue == this.okcVariables.TIMEOUT) {
						this.msgHandler('TIMEOUT', 'warning');
					}
					else {
						this.notificationService.add({ text: 'Ödeme İptal Edilemedi', type: 'danger' });
					}
				}
				else {
					this.notificationService.add({ text: 'Ödeme İptal Edilirken Bir Hata Oluştu !', type: 'danger' });
				}
			}
			catch (err) {
				this.msgHandler('EXCEPTION', 'danger', err);
			}
		}
	}
	discountAmount() {
		let totalDiscount:number = 0;
		this.state.SubTotal.Discounts.forEach(discounts => {
		  if(discounts) {
			totalDiscount += discounts.AppliedDiscountAmount
		}
	  });
	
		let discountRequest = {
		  DiscountAmount: totalDiscount,
		  ItemIndex: null,
		  Name: "İndirim Toplamı"
		  };
	
		let discountRequestJson = JSON.stringify(discountRequest);
		let discountResponse = window['DeviceIntegrationInstance'].discount(discountRequestJson); 
	}

	submitClickHandler(event) {

		if (this.currentLevel) {
			if (this.currentLevel.key === 'payment') {
				// TODO: Bu button buradan kalkacak mı?
			} else {
				this.nextLevel();
			}
		} else {
			return;
		}
	}

	openCalculator() {

	}

	paymentInputFocusHandler(paymentType, event) {
		paymentType.amount = this.remainingAmount;
		paymentType.isFocused = true;
	}

	paymentInputBlurHandler(paymentType, event) {
		paymentType.isFocused = false;
	}

	wizardActionHandler(event: { action: string, params?: any }) {
		switch (event.action) {
			case "goBack":
				this.previousLevel();
				break;
		}
	}

	nextLevel() {
		this.gotoLevel(Math.min(this.currentLevelIndex + 1, this.levels.length - 1));
	}



	previousLevel() {
		this.gotoLevel(Math.max(this.currentLevelIndex - 1, 0));
	}

	gotoLevel(key: any) {
		if (Number.isInteger(key)) {
			this.currentLevelIndex = key;
		} else {
			let self = this;
			this.levels.forEach(function (item, index) {
				if (item.key == key) {
					self.currentLevelIndex = index;
					return;
				}
			});
		}
		let targetLevel = this.levels[this.currentLevelIndex];
		if (targetLevel != this.currentLevel) {
			this.currentLevel = targetLevel;
		}
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

	// Ticket Fee Calculation
	ticketFeeAmount(ticketfee){
		let total = 0;
		ticketfee.PriceDetails.forEach(price => {
			if(price.TicketingFee)
			{
				total += price.TicketingFee;
			}
		})
		return this.processAmount(total);
	}

	serviceFeeAmount(servicefee){

		let total = 0;
		servicefee.PriceDetails.forEach(price => {
			if(price.ServiceFee)
			{
				total += price.ServiceFee;
			}
		})
		return this.processAmount(total);
	}

	totalDiscountAmount(discounts) {
		let amount = 0;
		if (discounts) {
			discounts.forEach(discount => {
				amount += discount['AppliedDiscountAmount'];
			})
		}
		return this.processAmount(amount);
	}

	ngOnDestroy() {
		if (this.subscription) this.subscription.unsubscribe();
	}
	addProductsToSlip() {
		if (this.state && this.state.Products && this.state.Products.length > 0) {
			let self = this,
				waitFor = 100,
				items = [],
				TCNumber = this.TCNumber;

			/* handshake yapıldıysa  kontrolu ekleyebiliriz. */

			this.state.Products.forEach(item => {
				
				if (item.Prices.Product) {
					let name = (item.ProductName) ? item.ProductName + ' ' + item.VariantName : item.VariantName;
					items.push({
						Name: name,
						Barcode: item.VariantId,
						Quantity: item.CountOfProductsSelected,
						UnitPrice: item.Prices.Product.Amount,
						TaxRate: item.Prices.Product.Vat,
						TransactionType: this.okcVariables.TransactionType_EArchive,
						TCNumber: TCNumber,
						InvoiceNumber: this.state['TransactionBasketRefId']
					})
				}
				if (item.Prices.ServiceFee) {
					items.push({
						Name: 'Hizmet Bedeli',
						Barcode: '',
						Quantity: item.CountOfProductsSelected,
						UnitPrice: item.Prices.ServiceFee.Amount,
						TaxRate: item.Prices.ServiceFee.Vat,
						TransactionType: this.okcVariables.TransactionType_EArchive,
						TCNumber: TCNumber,
						InvoiceNumber:  this.state['TransactionBasketRefId']
					})
				}
				if (item.Prices.TicketingFee) {
					items.push({
						Name: 'Biletleme Bedeli',
						Barcode: '',
						Quantity: item.CountOfProductsSelected,
						UnitPrice: item.Prices.TicketingFee.Amount,
						TaxRate: item.Prices.TicketingFee.Vat,
						TransactionType: this.okcVariables.TransactionType_EArchive,
						TCNumber: TCNumber,
						InvoiceNumber:  this.state['TransactionBasketRefId']
					})
				}
			});
			if (this.state.TransactionFees.TicketingTrxFee) {
				items.push({
					Name: 'İşlem Bedeli',
					Barcode: '',
					Quantity: 1,
					UnitPrice: this.state.TransactionFees.TicketingTrxFee.Amount,
					TaxRate: this.state.TransactionFees.TicketingTrxFee.Vat,
					TransactionType: this.okcVariables.TransactionType_EArchive,
					TCNumber: TCNumber,
					InvoiceNumber: this.state['TransactionBasketRefId']
				})
			}
			
			for (let i: number = 0; i < items.length; i++) {
				if (!self.saleItem(items[i])) {
					this.shoppingCartService.flushCart();
					this.router.navigate(['/boxoffice']);
					break;
				}
			}

		 this.addToSlipStatus = 1;
		}
	}

	saleItem(saleItemRequest) {
		//console.log("Sale Item Request",saleItemRequest);
		if (saleItemRequest) {
			try {
				let saleItemRequestJson = JSON.stringify(saleItemRequest);
				let saleItemResponse = window['DeviceIntegrationInstance'].saleItem(saleItemRequestJson);
				if (saleItemResponse.result.isTransactionSuccess) {
					if (saleItemResponse.result.deviceResultValue == this.okcVariables.ITEMSALE_SUCCESS) {
						return true;
					}
					else if (saleItemResponse.result.deviceResultValue == this.okcVariables.POS_HAS_UNCOMPLETED_PROCESS) {

						let cancelResult = this.cancelReceiptProcess();
						if (cancelResult == true) {
							return this.saleItem(saleItemRequest);
						}
						else {
							return false;
						}
					}
					else if (saleItemResponse.result.deviceResultValue == this.okcVariables.PAIRING_REQUIRED) {
						let result = window["DeviceIntegrationInstance"].handShake();
						if (result == true) {
							return this.saleItem(saleItemRequest)
						} else {
							this.notificationService.add({ text: 'ÖKC ile eşleşme yapılamadı.', type: 'danger' });
							return false;
						}
					}
					else if (saleItemResponse.result.deviceResultValue == this.okcVariables.NO_PAPER) {
						this.notificationService.add({ text: 'Yetersiz Kağıt.', type: 'warning' })
						return false;
					}
					else if (saleItemResponse.result.deviceResultValue == this.okcVariables.CABLE_ERROR) {
						this.isTransactionCancelling = false;
						this.notificationService.add({ text: 'İletişim Problemi !! Lütfen OKC Cihazı Kablosunu Kontrol Ediniz.', type: 'warning' });
						return false;
					}
					else if (saleItemResponse.result.deviceResultValue == this.okcVariables.TIMEOUT) {
						this.notificationService.add({ text: 'ÖKC ürün satış işlemi sırasında zaman aşımı, işlem iptal ediliyor.', type: 'warning' });
						this.cancelReceiptProcess();
						return false;
					}
					else {
						this.notificationService.add({ text: 'ÖKC ürün satış işlemi sırasında bir hata oluştu, işlem iptal ediliyor.', type: 'warning' });
						this.cancelReceiptProcess();
						return false;
					}
				}
				else {
					this.notificationService.add({ text: 'ÖKC ürün satış işlemi sırasında bir hata oluştu, işlem iptal ediliyor.', type: 'warning' });
					this.cancelReceiptProcess();
					return false;
				}
			}
			catch (err) {
				alert(err);
			}
		}
	}

	get userLetters(): string {
		let letters: string = "";
		if (this.customer && this.customer["Name"] && this.customer["Name"].length) letters += this.customer["Name"].charAt(0).toUpperCase();
		if (this.customer && this.customer["Surname"] && this.customer["Surname"].length) letters += this.customer["Surname"].charAt(0).toUpperCase();
		return letters;
	}

	cancelReceiptProcess() {
		/*Cancel Receipt Process Start*/
		let cancelReceiptResponse = window['DeviceIntegrationInstance'].cancelReceipt();
		if (cancelReceiptResponse.result.isTransactionSuccess) {
			if (cancelReceiptResponse.result.deviceResultValue == this.okcVariables.CANCEL_RECEIPT_SUCCESS) {

				return true;
			}
			else if (cancelReceiptResponse.result.deviceResultValue == this.okcVariables.NO_PAPER) {
				this.notificationService.add({ text: 'Yetersiz Kağıt.', type: 'warning' });
				return false;
			}
			else if (cancelReceiptResponse.result.deviceResultValue == this.okcVariables.CABLE_ERROR) {
				this.isTransactionCancelling = false;
				this.notificationService.add({ text: 'İletişim Problemi !! Lütfen OKC Cihazı Kablosunu Kontrol Ediniz.', type: 'warning' });
				return false;
			}
			else if (cancelReceiptResponse.result.deviceResultValue == this.okcVariables.TIMEOUT) {
				this.notificationService.add({ text: 'İşlem zaman aşımına uğradı.', type: 'warning' })
				return false;
			}
			else {
				this.notificationService.add({ text: 'Varolan İşlem İptal Edilemiyor', type: 'danger' });
				return false;
			}
		}
		else {
			this.notificationService.add({ text: 'Varolan işlemi iptal ederken bir hata oluştu !', type: 'danger' });
			return false;
		}
		/*Cancel Receipt Process End*/
	}

	processAmount(amount) {
		return +(Math.floor(Number(amount) * 1000) / 1000).toFixed(2);
	}

	confirm() {
		this.tetherService.confirm({
			title: 'ÖKC Kasiyer Parolası',
			description: 'Son İşlem Kopyasını Basmak İçin Kasiyer Parolasını Giriniz',
			feedback: { label: 'KASİYER ŞİFRESİ' },
			confirmButton: { label: 'GİRİŞ' },
			dismissButton: { label: 'VAZGEÇ' }
		}).then(result => {
			//console.log("Result",result);
			if(result.feedback == undefined) {
				this.finalizeProcess();
			}
			else
			{
				this.printLastReceipt(result.feedback);
			}
			
		}).catch(reason => {
			//console.log("Catch Result",reason);
			if(reason) {
				this.finalizeProcess();
			}
		})
	}

	finalizeProcess() {
		this.voidPaymentSuccess = false;				
		if(this.printAllowed == true)
			{
				this.paymentActionEvent.emit({ action: "printTicket", paymentData: [], paymentList: [],transactionRefId: this.state['TransactionBasketRefId'] });
			}
			else {
				this.paymentActionEvent.emit({ action: "redirect", paymentData: [], paymentList: [] });
			}		
	}

	printLastReceipt(adminPass: string) {
		let printLastReceiptRequest = {
			AdminPassword: adminPass
		};
		let printLastReceiptRequestJson = JSON.stringify(printLastReceiptRequest);

		let cancelReceiptResponse = window['DeviceIntegrationInstance'].printLastReceipt(printLastReceiptRequestJson);
		if (cancelReceiptResponse.result.isTransactionSuccess) {
			if (cancelReceiptResponse.result.deviceResultValue == this.okcVariables.LAST_RECEIPT_SUCCESS) {
				this.finalizeProcess();
				this.notificationService.add({ text: 'Son İşlem Kopyası Başarı ile Basıldı.', type: 'success' });			
			}
			else if (cancelReceiptResponse.result.deviceResultValue == this.okcVariables.LAST_RECEIPT_FAILED) {
				
				this.notificationService.add({ text: 'İşlemi Yaparken Bir Hata Oluştu!', type: 'danger' });
				this.confirm();
			}
			else if (cancelReceiptResponse.result.deviceResultValue == this.okcVariables.LAST_RECEIPT_NEED_ADMIN_PASSWORD) {
				this.notificationService.add({ text: 'Lütfen Kasiyer Parolasını Giriniz', type: 'danger' });
				this.confirm();
			}
			else if (cancelReceiptResponse.result.deviceResultValue == this.okcVariables.NO_PAPER) {
				this.notificationService.add({ text: 'Yetersiz Kağıt.', type: 'warning' });
				this.confirm();
			}
			else if (cancelReceiptResponse.result.deviceResultValue == this.okcVariables.CABLE_ERROR) {
				this.isTransactionCancelling = false;
				this.notificationService.add({ text: 'İletişim Problemi !! Lütfen OKC Cihazı Kablosunu Kontrol Ediniz.', type: 'warning' });
				this.confirm();
			}
			else if (cancelReceiptResponse.result.deviceResultValue == this.okcVariables.TIMEOUT) {
				this.notificationService.add({ text: 'İşlem zaman aşımına uğradı.', type: 'warning' })
				this.confirm();
			}
			else {
				this.notificationService.add({ text: 'İşlemi Yaparken Bir Hata Oluştu!', type: 'danger' });
				this.confirm();
			}
		}
		else {
			this.notificationService.add({ text: 'İşlemi Yaparken Bir Hata Oluştu!', type: 'danger' });
		}
		/*Cancel Receipt Process End*/
	}

	timeEventHandler(event) {
		this.isExpired = event.isTimeEnd;
		if(this.isExpired == true) {
			this.cancelTransaction();
		}
	}
	
	checkBoxEvent($event) {
		this.printAllowed = $event;
	}
	tabChangeHandler(event) {
		//console.log("Change handler",event);
	}

	invoiceModal(event, type: number, type_desc: string) {
		if (!event) return;
		this.sendInvoiceTypeToService = event;
		let component: ComponentRef<InvoiceCustomerCheckComponent> = this.resolver.resolveComponentFactory(InvoiceCustomerCheckComponent).create(this.injector);
		this.tetherService.modal(component, {
			escapeKeyIsActive: true,
			outsideClickIsActive: false,
			dialog: {style: {  maxWidth: '400px', width: '80vw', height: '250px' }}
		}).then(result => {
			if (result) {
				if (result.isInvoiceUser) {
					this.sendInvoiceTypeToService = true;
					if (result.identity) {
						this.invoiceCustomerInfo = new InvoiceCustomerInfo();
						this.invoiceCustomerInfo.NationalIdentityNumber = result.identity;
						this.invoiceCustomerInfo.PhoneNumber = this.customer.PhoneNumber;
						this.openInvoiceCustomerInfoBox();
					}
				}
			}
		
		}).catch(reason => {
			if(reason) {
				this.sendInvoiceTypeToService = false;

			}
		})
	}

	openInvoiceCustomerInfoBox() {
		const comp: ComponentRef<InvoiceCustomerInfoBoxComponent> = this.resolver.resolveComponentFactory(InvoiceCustomerInfoBoxComponent).create(this.injector);
		comp.instance.invoiceCustomerInfo = this.invoiceCustomerInfo;
		this.tetherService.modal(comp, {escapeKeyIsActive: true, dialog: {style: { maxWidth: '600px', width: '110vw', height: '700px' }}})
							.then(form => {
								console.log(form['invoiceCustomerInfo']);
								this.transactionService.setMemberInfo(form['invoiceCustomerInfo']).subscribe(response => {
									this.notificationService.add({ type: 'success', text: 'Bilgileriniz eklendi.'});
								}, error => {
									if (error && error.Type === 2) {
										this.notificationService.add({ type: 'error', text: `${error.ErrorCode}: ${error.Message}`});
									} else {
										this.notificationService.add({ type: 'error', text: 'Bilgileriniz eklenirken bir sorun oluştu.'});
									}
									this.sendInvoiceTypeToService = false;
								})
							}).catch(ex => {
								this.sendInvoiceTypeToService = false;
							});
	}

	installmentOptions() {
		let component: ComponentRef<InstallmentOptionsComponent> = this.resolver.resolveComponentFactory(InstallmentOptionsComponent).create(this.injector);
		component.instance.installmentOptions = this.installments;
		
		this.tetherService.modal(component, {
			escapeKeyIsActive: true,
			outsideClickIsActive: true,			
			dialog: {style: {  maxWidth: "400px", width: "80vw", height: "20vh" }}			
		}).then(result => {
			if(result) {
				if(result.installmentCount > 1)
				{
					this.installmentFlag = true;
					this.installmentData = {
						BankBkmId: result.bkmCode,
						NumberOfInstallments: result.installmentCount
					}
					this.makePayment_2({Type:2,Type_Desc:"Kredi Kartı"},this.remainingAmount);
				}
				else {
					this.installmentFlag = false;
					this.makePayment_2({Type:2,Type_Desc:"Kredi Kartı"},this.remainingAmount);
				}

			}
		}).catch(reason => {

		})	

	}

}
