import { HeaderTitleService } from './../../services/header-title.service';
import { Component, OnInit, Inject, ComponentRef, ComponentFactoryResolver, Injector, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EntityService } from './../../services/entity.service';
import { TicketForwardingService } from './../../services/ticket-forwarding.service';
import { GeneratePdfService } from './../../services/generate-pdf.service';
import { TransactionServiceService } from './../../services/transaction-service.service';
import { NotificationService } from './../../services/notification.service';
import { PrintDataService } from './../../services/print-data.service';
import { BasketItemType } from './../../models/basket-item-type.enum';
import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { PdfViewerComponent } from './../../modules/common-module/common/pdf-viewer/pdf-viewer.component';
import { TicketDetails } from './../../models/ticket-details';
import { PaymentService } from './../../services/payment.service';
import { TransactionRefundReasonBoxComponent } from '../../modules/boxoffice-module/common/transaction-refund-reason-box/transaction-refund-reason-box.component';
import { environment } from './../../../environments/environment';
import { OkcVariables } from '../../classes/okc-variables';
import { RelativeDatePipe } from './../../pipes/relative-date.pipe';
import { AuthenticationService } from '../../services/authentication.service';
import { AppSettingsService } from '../../services/app-settings.service';
import { UserCardContextComponent } from './../../modules/common-module/common/user-card-context/user-card-context.component';
import { CrmMemberService } from '../../services/crm-member.service';
import { CrmAnonymousUserService } from './../../services/crm-anonymous-user.service';
import { AccessCodeHistoryType } from './../../models/accesscode-history-type.enum'
import { AccessCodeHistoryModalComponent } from './../../../app/modules/boxoffice-module/common/access-code-history-modal/access-code-history-modal.component';
import { SalesChannelType } from '../../models/sales-channel-type.enum';
import { TransactionTypeNew } from '../../models/transaction-type-new.enum';
import { TransactionSubType } from '../../models/transaction-sub-type.enum';
import { Roles } from '../../models/roles';

@Component({
	selector: 'app-transaction-view',
	templateUrl: './transaction-view.component.html',
	styleUrls: ['./transaction-view.component.scss'],
	entryComponents: [
		PdfViewerComponent, TransactionRefundReasonBoxComponent, AccessCodeHistoryModalComponent, UserCardContextComponent
	],
	providers: [
		EntityService, TicketForwardingService, GeneratePdfService,
		TransactionServiceService, PrintDataService, PaymentService,
		AppSettingsService,CrmMemberService,CrmAnonymousUserService,
		{provide: 'entityServiceInstance1', useClass: EntityService },
		{provide: 'entityServiceInstance2', useClass: EntityService },
		{provide: 'entityServiceInstance3', useClass: EntityService },
		{provide: 'entityServiceInstance4', useClass: EntityService },
		{provide: 'entityServiceInstance5', useClass: EntityService },
		{provide: 'entityServiceInstance6', useClass: EntityService },
	],
})
export class TransactionViewComponent implements OnInit, OnDestroy {

	isSeatInfoLoading: boolean;
	errorMessage;
	subscription;
	isLoading = false;
	selectedItems: Array<Object> = [];
	pageID;
	transaction: any;

	basketRefId; //
	memberInfo;   // Müşteri Bilgileri

	paymentItems; // İşlem özeti
	groupedItems; // Nihai nesne

	productsByPerformance; // Ara nesne
	items = {
		Ticket: [],
		Service: [],
		Product: [],
		TicketingTrxFee: [],
		Installment: [],

		Discount: [],
	};
	totals = {
		Ticket: 0,
		Service: 0,
		Product: 0,
		TicketingTrxFee: 0,
		Installment: 0,

		Vat: 0,
		Discount: 0,

		General: 0
	};

    groupSaleTotal: number;

	// Refund Variables -- MT
	refundReasonID;
	refundableItems;
	refundTransaction;
	refundPaymentType;
	paymentEndDateForRefundableItems;
	paymentEndDate;

	// Functions (Selected)
	actionButtons = [
		{ label: 'Biletleri Bas', icon: 'print', action: 'printTicket', role: Roles.TRANSACTION_BULK_PRINT_TICKET },
		{ label: 'PDF Biletleri E-Posta ile Gönder', icon: 'mail', action: 'sendConfirmationMail',  role: Roles.TRANSACTION_BULK_TICKET_EMAIL },
		{ label: 'PDF Biletleri Görüntüle', icon: 'local_movies', action: 'previewPDF', role: Roles.TRANSACTION_BULK_TICKET },
		{ label: 'Faturaları Görüntüle', icon: 'visibility', action: 'displayEInvoice', role: Roles.TRANSACTION_BULK_INVOICE },
		{ label: 'Biletleri İade Et', icon: 'replay', action: 'refund', role: Roles.TRANSACTION_BULK_REFUND }
	]
	// Functions (Item)
	itemContextMenuData = [
		{ label: 'Bileti Yazdır', icon: 'print', action: 'printTicket', role: Roles.TRANSACTION_ITEM_PRINT_TICKET },
		{ label: 'PDF Bileti E-Posta ile Gönder', icon: 'mail', action: 'sendConfirmationMail', role: Roles.TRANSACTION_ITEM_TICKET_EMAIL },
		{ label: 'PDF Bileti Görüntüle', icon: 'local_movies', action: 'previewPDF', role: Roles.TRANSACTION_ITEM_TICKET },
		{ label: 'Faturayı Görüntüle', icon: 'visibility', action: 'displayEInvoice', role: Roles.TRANSACTION_ITEM_INVOICE },
		{ label: 'QR Yenile', icon: 'qrcode', action: 'qrcode', role: Roles.TRANSACTION_ITEM_REGENERATE_QR },
		{ label: 'İşlem Geçmişi', icon: 'history', action: 'showHistory', role: Roles.TRANSACTION_ITEM_QR_HISTORY },
		{ label: 'Bileti İade Et',  icon: 'replay', action: 'refund', role: Roles.TRANSACTION_ITEM_REFUND },
	]
	// Functions (All)
	transactionContextMenuData = [
		{ label: 'Biletleri Bas', icon: 'print', action: 'printTicket', role: Roles.TRANSACTION_BASKET_PRINT_TICKET },
		{ label: 'Konfirmasyon SMS\'i Gönder', icon: 'sms', action: 'sendConfirmationSms', role: Roles.TRANSACTION_BASKET_CONFIRMATION_SMS },
		{ label: 'Konfirmasyon E-Postası Gönder', icon: 'mail', action: 'sendConfirmationMail', role: Roles.TRANSACTION_BASKET_CONFIRMATION_EMAIL },
		{ label: 'Barkod SMS\'i Gönder', icon: 'message', action: 'sendBarcodeSms', role: Roles.TRANSACTION_BASKET_WALLET_SMS },
		{ label: 'Fatura E-Postası Gönder', icon: 'mail_outline', action: 'sendInvoiceMail', role: Roles.TRANSACTION_BASKET_INVOICE_EMAIL },
		{ label: 'PDF Biletleri Görüntüle', icon: 'local_movies', action: 'previewPDF', role: Roles.TRANSACTION_BASKET_TICKET },
		{ label: 'Faturaları Görüntüle', icon: 'visibility', action: 'displayEInvoice', role: Roles.TRANSACTION_BASKET_INVOICE },
		{ label: 'İşlemi İade Et', icon: 'replay', action: 'refund', role: Roles.TRANSACTION_BASKET_REFUND }
	];

	isBoxOfficeUser = false;
	ticketHistoryComponent: AccessCodeHistoryModalComponent;
	

	constructor(
		private route: ActivatedRoute,
		private authenticationService: AuthenticationService,
		private router: Router,
		private resolver: ComponentFactoryResolver,
		private injector: Injector,
		public tetherDialog: TetherDialog,
		private notificationService: NotificationService,
		private ticketForwardingService: TicketForwardingService,
		private generatePDFService: GeneratePdfService,
		private transactionServiceService: TransactionServiceService,
		private entityService: EntityService,
		private printService: PrintDataService,
		private headerTitleService: HeaderTitleService,
		public paymentService: PaymentService,
		private appSettingsService: AppSettingsService,
		public tetherService: TetherDialog,
		private crmMemberService: CrmMemberService,
		private crmAnonymMemberService: CrmAnonymousUserService,
		@Inject('entityServiceInstance1') private itemCampaignService: EntityService,
		@Inject('entityServiceInstance2') private productPerformanceService: EntityService,
		@Inject('entityServiceInstance3') private paymentItemService: EntityService,
		@Inject('entityServiceInstance4') private accessCodeService: EntityService,
		@Inject('entityServiceInstance6') private accessCodeHistoriesService: EntityService,
	) {
	}

	ngOnInit() {

		if (this.authenticationService.getAuthenticatedUser()
			&& this.authenticationService.hasUserOnlyRole(AuthenticationService.ROLE_BOX_OFFICE)) {
			this.isBoxOfficeUser = true;
		}

		this.paymentEndDateForRefundableItems = this.appSettingsService.getLocalSettings('paymentEndDateForRefundableItems');

		this.headerTitleService.setTitle('İşlemler');
		this.headerTitleService.setLink('/transactions');

		this.itemCampaignService.setCustomEndpoint('GetAll');
		this.itemCampaignService.fromEntity('TItemCampaign');

		this.productPerformanceService.setCustomEndpoint('GetAll');
		this.productPerformanceService.fromEntity('EPerformanceProduct');

		this.accessCodeService.setCustomEndpoint('GetAll');
		this.accessCodeService.fromEntity('TAccessCode');

		this.paymentService.setCustomApi('boxoffice');
		this.paymentService.setCustomEndpoint('RefundTransaction', true);

		this.subscription = this.route.params.subscribe(params => {
			this.pageID = +params['id'];
			this.resetVariables();

			this.isLoading = true;
			this.entityService.setCustomEndpoint('GetAll');
			this.entityService.fromEntity('TBasket')
				.where('Id', '=', this.pageID)
				.expand(['Currency'])
				.expand(['MemberInfo'])
				.expand(['SalesChannel'])
				.expand(['SalesSubChannel'])
				.expand(['Items', 'Variant', 'VariantType', 'Localization'])
				.expand(['Items', 'Variant', 'Product', 'Localization'])
				.take(1).page(0)
				.executeQuery();

			this.paymentItemService.setCustomEndpoint('GetAll');
			this.paymentItemService.fromEntity('TPaymentItem')
				.where('BasketId', '=', this.pageID)
				.take(10000).page(0)
				.executeQuery();
		});

		this.paymentItemService.data.subscribe(entities => {
			this.paymentItems = entities;
			if(this.paymentItems.length && this.paymentItems[0]) {
				this.paymentEndDate = new Date(this.paymentItems[0].PaymentEndTime);
			}
		}, error => this.errorMessage = <any>error);

		this.entityService.data.subscribe(entities => {
			this.resetVariables();

			if(entities && entities.length > 0){
				this.transaction = entities[0];
				this.basketRefId = this.transaction.RefId;

				// ------------------ grouping ---------------------------------
				let allItemIDs = [];
				let itemsByProduct = {}
				this.transaction['Items'].forEach(item=>{ // iterate all items
					allItemIDs.push(item.Id);

					let type = BasketItemType[item.Type];

					// ---- Categorizing items and computing general totals ----
					this.items[type].push(item);

					this.totals[type] += item.Amount;
					this.totals['Vat'] += item.VatAmout;
					this.totals['Discount'] += item.DiscountAmount;

					if (item.DiscountAmount != 0) {
						this.items['Discount'].push(item);
					}
					// ---------------------------------------------------------

					// ------- group items by product --------------------------
					if (item.Variant && item.Variant.Product) {

						let productId = item.Variant.Product.Id;
						if(!itemsByProduct[productId]){
							itemsByProduct[productId] = {
								Product: item.Variant.Product,
								Items: {
									Ticket: [],
									Service: [],
									Product: [],
									TicketingTrxFee: [],
									Installment: [],
								},
								AllItems: []
							}
						}
						itemsByProduct[productId].Items[type].push(item);
						itemsByProduct[productId].AllItems.push(item);
					} else {
						// TODO: item without a product
					}
					// ---------------------------------------------------------
				});

				// --------------- General Total -------------------------------
				this.totals['General'] =
					+ this.totals['Ticket']
					+ this.totals['Service']
					+ this.totals['Product']
					+ this.totals['TicketingTrxFee']
					- this.totals['Discount'];
					// + this.totals['Vat'];
				// -------------------------------------------------------------

				// ------------------- get seat information --------------------
				this.isSeatInfoLoading = true;
				this.transactionServiceService.getTransactionSeats(this.transaction.Id, this.transaction.Items.length)
											  .subscribe(response => {
													if (response && response.Items && response.Items.length) {
														response.Items.forEach(accessCode => {
															let i = this.transaction.Items.findIndex(item => item.Id === accessCode.ItemId);
															if (i > -1) {
																this.transaction.Items[i].AccessCodeInfo = accessCode;
															}
														});
													}
													this.isSeatInfoLoading = false;
											  }, error => {
													this.isSeatInfoLoading = false;
													this.errorMessage = <any>error
											  });
				// -------------------------------------------------------------

				// ------------------- get campaigns ---------------------------
				// this.prepareQuery(this.itemCampaignService, 'ItemId', allItemIDs);
				this.itemCampaignService.expand(['Item'])
										.expand(['Campaign', 'Localization'])
										.where('Item/BasketId','=', this.transaction.Id)
										.take(100000).page(0).executeQuery();
				// ---------------------------------
				this.itemCampaignService.data.subscribe(campaigns => {
					if (campaigns && campaigns.length && campaigns.length > 0) {
						campaigns.forEach(campaign => {
							let i = this.transaction.Items.findIndex(item => item.Id === campaign.ItemId);
							if (i > -1) {
								this.transaction.Items[i].ItemCampaign = campaign;
							}
						});
					}
					this.preparegroupedItems();
				});
				// -------------------------------------------------------------

				// ------------- get performance informations ------------------
				let productIDs = Object.keys(itemsByProduct);
				this.prepareQuery(this.productPerformanceService, 'ProductId', productIDs);
				this.productPerformanceService
				.expand(['Performance', 'Localization'])
				.expand(['Performance', 'Event', 'Localization'])
				.take(100000).page(0).executeQuery();
				// ---------------------------------
				this.productPerformanceService.data.subscribe(entities=>{
					// ------ group products by Performance --------------------
					this.productsByPerformance = {};
					entities.forEach(item => {
						let product = itemsByProduct[item.ProductId];

						if(this.productsByPerformance[item.PerformanceId]){
							this.productsByPerformance[item.PerformanceId].Products.push(product);
						} else {
							this.productsByPerformance[item.PerformanceId] = {
								Performance: item.Performance,
								Products: [product]
							}
						}
					});
					// ---------------------------------------------------------
					this.preparegroupedItems();
				});
				// -------------------------------------------------------------
			}
		}, error => this.errorMessage = <any>error);

	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	resetVariables() {
		this.transaction = {};
		// this.paymentItems = [];
		this.groupedItems = [];
		this.productsByPerformance = {};
		this.items = {
			Ticket: [],
			Service: [],
			Product: [],
			TicketingTrxFee: [],
			Installment: [],

			Discount: [],
		}
		this.totals = {
			Ticket: 0,
			Service: 0,
			Product: 0,
			TicketingTrxFee: 0,
			Installment: 0,

			Vat: 0,
			Discount: 0,

			General: 0,
		}
	}

	prepareQuery(service, key,  ids){
		service.where(key, '=', ids[0]);
		if(ids.length > 1){
			for (let i = 1; i < ids.length; i++) {
				service.or(key, '=', ids[i]);
			}
		}
	}

	preparegroupedItems(){
		if (!this.productsByPerformance || Object.keys(this.productsByPerformance).length < 1) return;

		this.groupedItems = [];
		Object.keys(this.productsByPerformance).forEach(key=>{
			let performance = this.productsByPerformance[key];
			// -------- Calculate Performance Totals and gather discounts ------
			let totals = {
				Ticket: 0,
				Service: 0,
				Product: 0,
				TicketingTrxFee: 0,
				Installment: 0,
				Vat: 0,
				Discount: 0,
				General: 0,
			}
			let discounts = [];			
			performance.Products.forEach(product=>{
				product.AllItems.forEach(item=>{
					let type = BasketItemType[item.Type]

					totals[type] += item.PaidAmount;
					totals['Vat'] += item.VatAmout;
					totals['Discount'] += item.DiscountAmount;

					if (item.ItemCampaign) {
						discounts.push(item.ItemCampaign);
					}
				});
			});
			totals['General'] =
				+ totals['Ticket']
				+ totals['Service']
				+ totals['Product']
				+ totals['TicketingTrxFee'];
				// - totals['Discount']; // commented this because totals calculated from PaidAmount
				// + totals['Vat'];

			performance['Totals'] = totals;
			performance['Discounts'] = discounts;
			// -----------------------------------------------------
			this.groupedItems.push(performance);
		});

        this.groupSaleTotal = 0;
		this.groupedItems.forEach(performance => {
			this.groupSaleTotal += performance.Totals.Product;
		});

		this.setMenus();

		this.isLoading = false;
	}

	selectItem(isSelected: boolean, event: Event): void {
		if (isSelected) {
			this.selectedItems.push(event);
		} else {
			let selectedEvent = this.selectedItems.filter(item => {
				return (event === item);
			})[0];
			this.selectedItems.splice(this.selectedItems.indexOf(selectedEvent), 1);
		}
	}

	selectAllItems(selectAll: boolean): void {
		if (selectAll && this.items && this.items.Product.length > this.selectedItems.length) {
			this.selectedItems = [];
			this.items.Product.forEach(item => {
				if(!this.isItemDisabled(item))
					this.selectedItems.push(item);
			});
		}
		if (!selectAll) {
			this.selectedItems = [];
		}
	}

	get isMultiSelectionActive(): boolean {
		return this.selectedItems.length > 0;
	}

	callSelectedItemsAction(action){
		this.actionHandler(action, this.selectedItems);
	}

	// Functions (All)
	openContextMenu(e){
		let content = {
			title: 'İŞLEMLER',
			data: this.transactionContextMenuData
		}

		this.tetherDialog.context(content, {
			target: e.target,
			attachment: 'top right',
			targetAttachment: 'top right',
		}).then(result => {
			switch (result['action']) {
				case 'printTicket':
					this.actionHandler('printTicket', []);
					break;
				case 'sendConfirmationSms':
					this.isLoading = true;
					this.transactionServiceService.sendConfirmationSMS(this.transaction.RefId).subscribe(response=>{
						this.isLoading = false;
						this.notificationService.add({ text: 'İşlem başarılı.', type: 'success' });
					}, error=>{
						console.log('<-------sendConfirmationSms error------->', error);

						this.errorMessage = <any>error;
						this.isLoading = false;
						this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
					})
					break;
				case 'sendConfirmationMail':
					this.actionHandler('sendConfirmationMail', this.items.Product);
					break;
				case 'sendBarcodeSms':
					this.sendBarcodeSms();
					break;
				case 'sendInvoiceMail':
					this.isLoading = true;
					this.transactionServiceService.setCustomEndpoint('SendInvoiceMail');
					this.transactionServiceService.save({
						'BasketRefList': [this.transaction.RefId]
					}).subscribe(response=>{
						this.isLoading = false;
						this.notificationService.add({ text: 'İşlem başarılı.', type: 'success' });
					}, error=>{
						console.log('<-------sendInvoiceMail error------->', error);

						this.errorMessage = <any>error;
						this.isLoading = false;
						this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
					});
					break;
				case 'previewPDF':
					this.actionHandler('previewPDF', this.items.Product);
					break;
				case 'downloadPDF':
					this.actionHandler('downloadPDF', this.items.Product)
					break;
				case 'printPDF':
					this.actionHandler('printPDF', this.items.Product)
					break;
				case 'displayEInvoice':
					this.actionHandler('displayEInvoice', this.items.Product);
					break;
				case 'downloadEInvoice':
					this.actionHandler('downloadEInvoice', this.items.Product);
					break;
				case 'printEInvoice':
					this.actionHandler('printEInvoice', this.items.Product);
					break;
				case 'refund':
					this.actionHandler('refund', [])
					break;
			}
		}).catch(reason => console.log('dismiss reason : ', reason));
	}

	// Functions (Item)
	openItemContextMenu(e, item) {

		let content = {
			title: 'İŞLEMLER',
			data: this.getItemContextMenuData(item)
		}

		this.tetherDialog.context(content, {
			target: e.target,
			attachment: 'top right',
			targetAttachment: 'top right',
		}).then(result => {
			if (result) {
				this.actionHandler(result['action'], item);
			}
		}).catch(reason => console.log('dismiss reason : ', reason));
	}

	actionHandler(action, items) {
		if (!(items instanceof Array)) {
			items = [items];
		}

		let barcodes = [];
		let itemIds = []

		switch (action) {
			case 'qrcode':
				let barcode;
				if (items.length > 0) {
					this.regenerateBarcode(items[0]);
				}
				break;
			case 'downloadPDF':
			case 'previewPDF':
			case 'printPDF':
				items.forEach(item => itemIds.push(item.Id));
				this.getPDF(itemIds, action);
				break;
			case 'refund':
				this.refundTransaction = items.length < 1 ? true : false;
				// Refund All Items
				if (this.refundTransaction) {
					items = this.items.Product;
				}

				this.refundableItems = this.filterRefundableItems(items);

				if (this.refundableItems.length > 0) {

					if (this.paymentItems && this.paymentItems.length) {
						this.refundableItems.forEach(
							refundableItem => {
								let p = this.paymentItems.find(
									paymentItem => paymentItem.BasketId == refundableItem.BasketId
								);
								refundableItem.PaymentType = p.Type_Desc;
							}
						);

						// Assuming that all transaction is paid at one -- MT
						this.refundPaymentType = this.refundableItems[0].PaymentType;
					}

					switch (this.transaction.SalesChannel.Name) {
						case 'Box Office':
						case 'BoxOffice':
							if (this.refundPaymentType.includes('Nakit')) {
								this.openRefundReasonModal('İade');
							} else {
								if (this.refundTransaction) {
									this.openRefundSelectionBox();
								} else {
									this.openRefundReasonModal('İade');
								}
							}
							break;
						case 'Web':
						case 'Mobile':
						case 'Backstage':
							this.openRefundReasonModal('İade');
							break;
						default:
							this.notificationService.add({
								text: 'Seçtiğiniz ürünler iade edilebilir değildir.',
								type: 'danger'
							});
							break;
					}
				} else {
					this.notificationService.add({
						text: 'Seçtiğiniz ürünler iade edilebilir değildir.',
						type: 'danger'
					});
				}
				break;
			case 'sendConfirmationMail':
				items.forEach(item => itemIds.push(item.Id));
				this.isLoading = true;
				this.transactionServiceService.setCustomEndpoint('SendConfirmationMail');
				this.transactionServiceService.save(itemIds).subscribe(response=>{
					this.isLoading = false;
					this.notificationService.add({ text: 'İşlem başarılı.', type: 'success' });
				}, error=>{
					console.log('<-------SendConfirmationMail error------->', error);

					this.errorMessage = <any>error;
					this.isLoading = false;
					this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
				});
				break;
			case 'printTicket':

				if(items.length > 0){

					items.forEach(i => {
						if(i.RefundStatus != '3'){
							barcodes.push(i.AccessCodeInfo.Code)
						}
					});
				}

				this.getTicketDetailsAndPrint(barcodes.length > 0 ? barcodes : undefined);

				break;
			case 'displayEInvoice':
			case 'downloadEInvoice':
			case 'printEInvoice':
				items.forEach(i => itemIds.push(i.Id));
				this.getEInvoicePDF(itemIds, action);
				break;
			case 'showHistory':
				const item = items[0];
				this.showHistory(item);
				break;
		}
	}

	private showHistory(item) {
		this.accessCodeHistoriesService.setCustomEndpoint('GetAll');
		this.accessCodeHistoriesService.fromEntity('TAccessCode')
									   .where('ItemId', '=', item.Id)
									   .expand(['Item'])
									   .expand(['AccessCodeHistories'])
									   .expand(['Performance', 'Localization'])
									   .take(1)
									   .page(0)
									   .executeQuery();

		this.accessCodeHistoriesService.data.skip(1).first().subscribe(accessCodes => {
		if (accessCodes && accessCodes.length && accessCodes.length > 0) {
			const accessCode = accessCodes[0];
			let component: ComponentRef<AccessCodeHistoryModalComponent> = this.resolver.resolveComponentFactory(AccessCodeHistoryModalComponent)
																						.create(this.injector);
			this.ticketHistoryComponent = component.instance;

			const performanceName = accessCode.Performance.Localization.Name;
			const ticketType = item.Variant.VariantType.Localization.Name;

			this.sortArrayByDate(accessCode.AccessCodeHistories);
			const ticketHistories = accessCode.AccessCodeHistories;

			this.ticketHistoryComponent.performanceName = performanceName;
			this.ticketHistoryComponent.ticketType = ticketType;

			let date = new Date(accessCode.Performance.Date);
			this.ticketHistoryComponent.performanceCreateDate = date;

			ticketHistories.forEach(history => {

				switch (history.Type) {
					case AccessCodeHistoryType.AccessRequest:
						history.Type_Desc = "Access Denied";
						break;
					case AccessCodeHistoryType.Cancel:
						history.Type_Desc = "Cancellation";
						break;
					case AccessCodeHistoryType.Forward:
						history.Type_Desc = "Ticket Forwarding";
						break;
					case AccessCodeHistoryType.New:
						history.Type_Desc = "New";
						break;
					case AccessCodeHistoryType.Refund:
						history.Type_Desc = "Refund";
						break;
					case AccessCodeHistoryType.Regenerate:
						history.Type_Desc = "Regenerate QR";
						break;
					case AccessCodeHistoryType.Relocate:
						history.Type_Desc = "Relocation";
						break;
					case AccessCodeHistoryType.Returned:
						history.Type_Desc = "Returned";
						break;
					case AccessCodeHistoryType.ValidAccess:
						history.Type_Desc = "Valid Access";
						break;
				}
			});
			this.ticketHistoryComponent.ticketHistories = ticketHistories;

			this.tetherService.modal(component, {
				escapeKeyIsActive: true,
				dialog: {
					style: { maxWidth: "400px", width: "80vw", height: "15vh", maxHeight: "100px" }
				}
			}).then(result => {

			}).catch(reason => {

			});
		}
		}, error => {

		});
	}

	private sortArrayByDate(array){
		array.sort(function(a, b){
			return new Date(b.CreateDate).getTime() - new Date(a.CreateDate).getTime();
		});
	}

	private regenerateBarcode(item) {
		let validAccessCode;
		if (item.AccessCodeInfo && item.AccessCodeInfo.Code) {
			validAccessCode = item.AccessCodeInfo.Code;
			this.isLoading = true;
			this.ticketForwardingService.reGenerateBarcode(validAccessCode).subscribe(
				response => {
					if (response && response['Barcode']) {
						this.isLoading = false;
						item.AccessCodeInfo.Code = response['Barcode'];
						this.notificationService.add({ text: 'Barkod yenileme işlemi başarı ile tamamlandı.', type: 'success' });
					} else {
						this.isLoading = false;
						this.notificationService.add({ text: 'Barkod yenileme işlemi başarı ile tamamlandı.', type: 'success' });
					}
				},
				error => {
					this.isLoading = false;
					if (error && error.Type === 2) {
						this.notificationService.add({ text: error.Message, type: 'danger' });
					} else {
						this.notificationService.add({ text: 'Barkod yenileme işlemi gerçekleştirilemedi.', type: 'danger'});
					}
				}
			);
		} else {
			this.notificationService.add({ text: 'Barkod yenileme gerçekleştirilemedi.', type: 'danger' });
		}
	}

	private sendBarcodeSms() {
		this.isLoading = true;
		this.ticketForwardingService.sendBarcodeSms(this.basketRefId)
									.subscribe(
										response => {
											this.isLoading = false;
											this.notificationService.add({ text: 'Barkod SMS\'i gönderildi.', type: 'success' });
										},
										error => {
											this.isLoading = false;
											this.notificationService.add({ text: 'Barkod SMS\'i gönderilemedi.', type: 'danger' });
										}
									);
	}

	private getPDF(items, action = 'downloadPDF'){
		this.isLoading = true;
		this.transactionServiceService.downloadPdf(items)
									  .subscribe(response => {
										  let blob = new Blob([response.blob()], {type: 'application/pdf'});
										  let downloadUrl = window.URL.createObjectURL(blob);
										  switch (action) {
											  	case 'previewPDF':
											  		this.openPdfModal(downloadUrl);
													break;
												case 'downloadPDF':
													this.downloadPdf(downloadUrl);
													break;
												case 'printPDF':
													this.printPDF(downloadUrl);
													break;
												default:
													break;
									  	  }
										  this.isLoading = false;
										}, error => {
											console.log('<-------getPDF error------->', error);
											this.errorMessage = <any>error;
											this.isLoading = false;
											this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
		});
	}

	openPdfModal(src) {
		let component: ComponentRef<PdfViewerComponent> = this.resolver.resolveComponentFactory(PdfViewerComponent).create(this.injector);
		component.instance.src = src;

		this.tetherDialog.modal(component, {
			escapeKeyIsActive: true,
			dialog: {style: { maxWidth: '600px', width: '80vw', height: '50vh' }}
		}).then(result => {
			// TODO: reload page?
			// this.router.navigate(['/transaction', `${this.pageID}?refresh`]);
		}).catch(reason => {
			console.log('refund modal dismiss reason', reason);
		});
	}

	openUserCardContext(e, item) {
		this.accessCodeService.setCustomEndpoint('GetAll');
		this.accessCodeService.fromEntity('TAccessCode')
							  .where('ItemId', '=', item.Id)
							  .take(1).page(0).executeQuery();

		this.accessCodeService.data.skip(1).first().subscribe(accessCodes => {
			if (accessCodes && accessCodes.length) {
				const accessCode = accessCodes[0];
				let crmMemberId;
				let component: ComponentRef<UserCardContextComponent> = this.resolver.resolveComponentFactory(UserCardContextComponent).create(this.injector);

				const ForwardedCrmMemberId = accessCode.ForwardedCrmMemberId;
				const ForwardedAnonymousUserId = accessCode.ForwardedAnonymousUserId;
				if (ForwardedCrmMemberId !== null && ForwardedAnonymousUserId === null) {
					this.crmMemberService.getMemberFromID(ForwardedCrmMemberId).subscribe(result => {
						if (result.EntityModel) {
							const {MemberId, Name, Surname, PhoneNumber} = result.EntityModel;
							component.instance.name = Name;
							component.instance.surname = Surname;
							component.instance.phone = PhoneNumber;
							component.instance.crmMemberId = MemberId;
							component.instance.isLoading = false;
							component.instance.isAnonymous = false;
						} else {
							component.instance.hasEntityModel = false;
							component.instance.isLoading = false;
						}
					})
				} else if (ForwardedAnonymousUserId !== null ) {
					this.crmAnonymMemberService.getById(ForwardedAnonymousUserId).first().subscribe(result => {
						const {PhoneNumber} = result;
						component.instance.phone = PhoneNumber;
						component.instance.isLoading = false;
						component.instance.isAnonymous = true;
					})
				} else {
					component.instance.hasEntityModel = false;
					component.instance.isLoading = false;
				}

				this.tetherDialog.context(component, {
					target: e.target,
					attachment: 'top left',
					targetAttachment: 'bottom left',
					targetOffset: "10px 0px",
				}).then(result => {
					console.log("Result",result);
				}).catch(reason => {
					console.log('user card dismiss reason', reason);
				});
			}
		}, error => {

		})
	}

	// Gets ticket data & sends to print func -- MT
	private getTicketDetailsAndPrint(barcodes?: string[]): void{

		// this.printService.setCustomEndpoint('GetPrintTicketInfo');
		// let save = this.printService.create({'BasketRefList':[`${this.basketRefId}`]});

		this.isLoading = true;

		this.printService.getPrintTicketInfo(this.basketRefId)
						 .subscribe(data => {
									 	if(barcodes){
											// Print selected tickets - MT
											let ticket;
											for (let d of data) {
												ticket = d as TicketDetails;
												if(barcodes.some(b => b === ticket.Barcode)){
													this.printTicket(ticket);
												}
											}
										}
										else{
											// Print all tickets - MT
											for (let d of data) {
												this.printTicket(d as TicketDetails);
											}
										}
									},
								    error => {
								    	if(error.Type == 2){
								    		this.notificationService.add({
												text: `${error.ErrorCode}: ${error.Message}`,
												type: 'danger'
											});
								    	}
					    });

			this.isLoading = false;
	}

	// Sends ticket data to OKC printer service -- MT
	private printTicket(ticketDetails: TicketDetails): void{

		console.log(`Printing Barcode: ${ticketDetails.Barcode}`);

		try{
			window['PrintManagerInstance'].printTicket(JSON.stringify(ticketDetails), false);
		}
		catch(e){
			if (e instanceof TypeError) {
				this.notificationService.add({
					text: 'İşlem Başarısız. Yazının bağlı olduğunu kontrol ediniz.',
					type: 'danger'
				});
			}
			else{
				console.log(e);
			}
		}
	}

	// Checks if an item is refunded or forwarded -- MT
	isItemDisabled(item): boolean{
		if((item.AccessCodeInfo && item.AccessCodeInfo.ForwardStatus == 1) || item.RefundStatus == 3)
			return true;
	}

	// Checks if all items are refunded or forwarded -- MT
	private areAllItemsDisabled(items: Array<any> = []): boolean{

		for(let i of items){
			if(!this.isItemDisabled(i))
				return false;
		}

		return true;
	}

	private areAllItemsRefunded(items: Array<any> = []): boolean {

		let areItemsRefunded = true;

		for (let i of items) {
			if (i.RefundStatus !== 3) {
				return false;
			}
		}

		return areItemsRefunded;

	}

	// Gets e-invoice PDF -- MT
	private getEInvoicePDF(itemIds: Array<any>, action: string): void{
		this.transactionServiceService.getEInvoicePdf(itemIds)
									  .subscribe(response => {
									  				let pdf64 = response.json().PdfData;
													  let url = 'data:application/pdf;base64,' + pdf64;
													  switch (action) {
														  	case 'displayEInvoice':
																this.openPdfModal(url);
															  	break;
															case 'downloadEInvoice':
																this.downloadPdf(url);
																break;
															case 'printEInvoice':
																this.printPDF(url);
																break;
														  	default:
																break;
													  }
									  			},
									  			error => {
									  			 	if(error.Type == 2){
									  			 		this.notificationService.add({
									  			 			text: `${error.ErrorCode}: ${error.Message}`,
									  			 			type: 'danger'
									  			 		});
									  			 	}
									  			});
	}

	private downloadPdf(url: string) {

		let filename = `${this.transaction.RefId}`;
		let a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a)
	}

	private printPDF(url: string) {
		let component: ComponentRef<PdfViewerComponent> = this.resolver.resolveComponentFactory(PdfViewerComponent).create(this.injector);
		component.instance.src = url;
		component.instance.isPrintDialog = true;

		this.tetherDialog.modal(component, {
			escapeKeyIsActive: true,
			dialog: {style: { maxWidth: '600px', width: '80vw', height: '50vh' }}
		}).then(result => {
			// 			
		}).catch(reason => {
			console.log('refund modal dismiss reason', reason);
		});
	}

	// Checks if the application has access to OKC printer service -- MT
	isPrinterAvailable(){
		if(window['PrintManagerInstance']){
			return true;
		}
		else{
			return false;
		}
	}

	// Cancels forwarded status of the ticket
	returnTicketPromoter(item): void {

		let phoneNumber: string;
		let AccessCodeUId: string;

		console.log(`returnTicketPromoter is called for ${item.AccessCodeInfo.UId}`);

		this.isLoading = true;

		try {
			phoneNumber = this.transaction.MemberInfo.PhoneNumber;
			AccessCodeUId = item.AccessCodeInfo.UId;

			this.ticketForwardingService.returnTicketPromoter(phoneNumber,AccessCodeUId)
										.subscribe(data => {
											item.AccessCodeInfo.ForwardStatus = 0;
											item.AccessCodeInfo.Code = data.Barcode;
											this.isLoading = false;
										},
										error => {
											if (error.Type === 2) {
												this.notificationService.add({
													text: `${error.ErrorCode}: ${error.Message}`,
													type: 'danger'
												});
											}
											this.isLoading = false;
										});
		} catch (e) {
			console.log(`Err: ${e}`);
			this.isLoading = false;
		}
	}

	// Refund -- MT

	private openRefundReasonModal(action) {

		let component: ComponentRef<TransactionRefundReasonBoxComponent>;
		component = this.resolver.resolveComponentFactory(TransactionRefundReasonBoxComponent)
			.create(this.injector);
		component.instance.action = action;
		component.instance.paymentType = this.refundPaymentType;
		component.instance.salesChannel = this.transaction.SalesChannel.Name;

		this.tetherDialog.modal(component, {
			escapeKeyIsActive: true,
			dialog: {
				style: {
					maxWidth: '600px',
					width: '80vw',
					height: '50vh'
				}
			}
		}).then(result => {
			this.refundReasonID = result.ReasonId;

			switch (this.transaction.SalesChannel.Name) {
				case 'Box Office':
				case 'BoxOffice':
			        if(this.refundPaymentType.includes('Nakit')){
						if(this.refundTransaction)
							this.refundAllTransaction();
						else
							this.refundSelectedItems();
					}
					else{
						this.refundOrVoidPayment(action);
					}
					break;
				case 'Web':
				case 'Mobile':
				case 'Backstage':
				if(this.refundTransaction)
					this.refundAllTransaction();
				else
					this.refundSelectedItems();
					break;
				default:
					break;
			}
		})
		.catch(reason =>
			console.log('Refund Reason Modal dismiss reason: ', reason)
		);
	}

	private openRefundSelectionBox() {
		let date = new RelativeDatePipe().transform(this.transaction.PaymentDate);
		this.tetherDialog.confirm({
			title: 'İşlemi iptal ya da iade edin',
			description: date + ' tarihli ödeme için yapılacak işlemi seçiniz:',
			confirmButton: { label: 'İADE ET', theme: 'danger' },
			dismissButton: { label: 'İPTAL ET', theme: 'primary', type: 'button' }
		}).then(result => {
			this.openRefundReasonModal('İade');
		}).catch(reason => {
			if (reason.target.innerText.includes('İPTAL ET')) {
				this.openRefundReasonModal('İptal');
			}
			else{
				console.log('Refund Reason Modal dismiss reason: ', reason);
			}
		});
	}

	private refundAllTransaction() {
		this.isLoading = true;
		let payLoad = {
			BasketRefId: this.basketRefId,
			ReasonId: this.refundReasonID,
			T_Items: ''
		}

		this.paymentService.save(payLoad)
						   .subscribe(
								response => {
									this.isLoading = false;
									this.notificationService.add({
										text: 'İşlem Başarılı',
										type: 'success'
										});
									this.refundableItems.forEach(i => i.RefundStatus = 3);
									this.transactionContextMenuData = this.transactionContextMenuData.filter(i => 
										{ if (i.action !== 'printTicket' && i.action !== 'refund') {return i; }}
									);
									this.transactionContextMenuData = this.transactionContextMenuData.filter(i => 
										{ if (i.action !== 'printTicket' && i.action !== 'refund' && i.action !== 'sendBarcodeSms') {return i; }}
									);
								},
								error => {
									this.isLoading = false;
									if (error.Type == 2) {
										this.notificationService.add({
											text: `${error.ErrorCode}: ${error.Message}`,
											type: 'danger'
										});
									}
								}
			);
	}

	private refundSelectedItems() {
		this.isLoading = true;
		let itemsWithTicketType = []

		this.refundableItems.forEach(
			item => {
				itemsWithTicketType.push(item);
				this.items.Ticket.forEach(
					ticket => {
						if (item.ItemNo == ticket.ItemNo)
							itemsWithTicketType.push(ticket)
					}
				);
			}
		);

		let payLoad = {
			BasketRefId: this.basketRefId,
			ReasonId: this.refundReasonID,
			T_Items: []
		}

		itemsWithTicketType.forEach(
			itemWithTicketType => {
				payLoad.T_Items.push({
					Id: itemWithTicketType.Id,
					ReasonId: this.refundReasonID
				});
			}
		)

		this.paymentService.save(payLoad)
						   .subscribe(
							   	response => {
									this.isLoading = false;
									   this.notificationService.add({
											text: 'İşlem Başarılı',
											type: 'success'
										});
										this.refundableItems.forEach(i => i.RefundStatus = 3);
										if (this.areAllItemsDisabled(this.items.Product)) {
											this.transactionContextMenuData = this.transactionContextMenuData.filter(
												i => { if (i.action !== 'printTicket' && i.action !== 'refund') {return i; }
											});
											this.transactionContextMenuData = this.transactionContextMenuData.filter(i => 
												{ if (i.action !== 'printTicket' && i.action !== 'refund' && i.action !== 'sendBarcodeSms') {return i; }}
											);
										}
								},
								error => {
									this.isLoading = false;
									if (error.Type == 2) {
										this.notificationService.add({
											text: `${error.ErrorCode}: ${error.Message}`,
											type: 'danger'
										});
									}
								}
			);
	}

	private refundPaymentOKC(paymentItem, amount) {

		let okcVariables = OkcVariables;

		let paymentRefundRequest = {
				AuthorizationCode: paymentItem.AuthorizationCode,
				BankBkmId : paymentItem.BankBkmId,
				MerchantId: paymentItem.MerchantId,
				NumberOfInstallments: paymentItem.Installment,
				PayAmount: amount,
				Rrn: paymentItem.Rrn,
				TerminalId: paymentItem.TerminalId,
				TransactionAmount: paymentItem.Amount,
				TransactionUtcDate: paymentItem.PaymentStartTime
			};

			var paymentRefundRequestJson = JSON.stringify(paymentRefundRequest);

			console.log(`PaymentRefundRequest: ${paymentRefundRequestJson}`);

			try{

				var paymentRefundResponse = window['DeviceIntegrationInstance'].refundPayment(paymentRefundRequestJson);

	        	if (paymentRefundResponse.result.isTransactionSuccess) {
	            	if (paymentRefundResponse.result.deviceResultValue ==  okcVariables.REFUD_SUCCESS) {
	                	this.refundSelectedItems();
	            	}
	            	else {
	                	this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
	            	}
	        	}
		        else {
		            this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
		        }
			}
			catch(e){
				this.notificationService.add({
					text: 'İşlem Başarısız. OKC cihazının bağlantısını kontrol ediniz.',
					type: 'danger'
				});
			}
	}

	private refundOrVoidPayment(action){

		let okcVariables = OkcVariables;

		let basketIds = [];

		this.refundableItems.forEach(i => {
			if(!basketIds.some(x => i.BasketId))
				basketIds.push(i.BasketId);
		});

		for(let id of basketIds){
			let paymentItem = this.paymentItems.filter(x => x.BasketId == id)[0];

			let itemsOfBasket = this.refundableItems.filter(x => x.BasketId == id);

			let amount = 0;
			let ticketAmount = 0;
			let serviceAmount = 0;
			let productAmount = 0;

			for(let i of this.refundableItems){
				ticketAmount = this.items.Ticket.find(t => t.ItemId == i.ItemId).PaidAmount;
				serviceAmount = this.items.Service.find(s => s.ItemId == s.ItemId).PaidAmount;
				productAmount = this.items.Product.find(p => p.ItemId == p.ItemId).PaidAmount;
				amount += ticketAmount;
				amount += serviceAmount;
				amount += productAmount;
			}

			let confirmBoxTitle = action + ' Edin';

			this.tetherDialog.confirm({
				title: confirmBoxTitle,
				description: 'Kartı Pos Cihazına Takınız',
				confirmButton: { label: 'TAMAM', theme: 'danger' }
			}).then(result => {
				if(action === 'İade'){
					this.refundPaymentOKC(paymentItem, amount);
				}
				else if(action === 'İptal'){
					this.voidPaymentOKC(paymentItem, amount);
				}
				else{
					this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
				}
			}).catch(reason => {
				console.log('Refund Reason Modal dismiss reason: ', reason);
			});
		}
	}

	private voidPaymentOKC(paymentItem, amount){

		let okcVariables = OkcVariables;

		var paymentVoidRequest = {
			Amount: amount,
			BankBkmId: paymentItem.BankBkmId,
			BatchNo: paymentItem.BatchNo,
			Stan: paymentItem.Stan,
			TerminalId: paymentItem.TerminalId
		};

		var paymentVoidRequestJson = JSON.stringify(paymentVoidRequest);

		console.log(`PaymentVoidRequest: ${paymentVoidRequestJson}`);

		try{
			var paymentVoidResponse = window['DeviceIntegrationInstance'].voidPayment(paymentVoidRequestJson);
        	if (paymentVoidResponse.result.isTransactionSuccess) {
            	if (paymentVoidResponse.result.deviceResultValue ==  okcVariables.VOID_PAYMENT_SUCCESS) {
                	this.refundSelectedItems();
            	}
            	else {
                	this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
            	}
	        }
	        else {
	            this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
	        }
		}
		catch(e){
			this.notificationService.add({
				text: 'İşlem Başarısız. OKC cihazının bağlantısını kontrol ediniz.',
				type: 'danger'
			});
		}
	}

	// Activates refund functions -- MT
	private areThereRefundableItems(items: Array<any> = []): boolean {

		for (let i of items) {
			if (this.isItemRefundable(i))
				return true;
		}

		return false;
	}

	private isItemRefundable(item) {
		if (item.RefundStatus === 1
			&& ((this.paymentItems && this.paymentItems.length && this.paymentEndDate >= this.paymentEndDateForRefundableItems) || (this.transaction.TransactionType === TransactionTypeNew.Invitation))
			&& (this.transaction.SalesChannelId === SalesChannelType.Web || this.transaction.SalesChannelId === SalesChannelType.BoxOffice || this.transaction.SalesChannelId === SalesChannelType.Mobile  || (this.transaction.SalesChannelId === SalesChannelType.Backstage && this.transaction.TransactionType === TransactionTypeNew.Invitation))
			) {
				return true;
			}
	}

	private filterRefundableItems(items: Array<any> = []): Array<any> {
		return items.filter(x => this.isItemRefundable(x));
	}

    isGroupSale(){
		return this.transaction.TransactionSubType === TransactionSubType.Group;
	}

	private setMenus() {
		if (this.areAllItemsDisabled(this.items.Product)) {
			this.transactionContextMenuData = this.transactionContextMenuData.filter(i => {
				if (i.action !== 'printTicket' && i.action !== 'refund') {
					return i;
				}
			});

			this.actionButtons = this.actionButtons.filter(i => {
				if (i.action !== 'printTicket' && i.action !== 'refund') {
					return i;
				}
			});
		} else {
			if (!this.isPrinterAvailable()) {
				this.transactionContextMenuData = this.transactionContextMenuData.filter(i => i.action !== 'printTicket');
				this.actionButtons = this.actionButtons.filter(i => i.action !== 'printTicket');
			}
			if (!this.areThereRefundableItems(this.items.Product)) {
				this.transactionContextMenuData = this.transactionContextMenuData.filter(i => i.action !== 'refund');
				this.actionButtons = this.actionButtons.filter(i => i.action !== 'refund');
			}
		}
	}

	isItemContextMenuDisabled(item) {
		return this.isSeatInfoLoading || (this.isItemDisabled(item) || (this.transaction.TransactionType === TransactionTypeNew.Refund)
																	|| !this.itemContextMenuData.some(i => this.authenticationService.roleHasAuthenticate(i['role'])));
	}

	private getItemContextMenuData(item) {
		let contextMenuData = this.itemContextMenuData;

		if (this.isItemDisabled(item)) {
			if (this.transaction.TransactionType !== TransactionTypeNew.Refund) contextMenuData = contextMenuData.filter(i => i.action === 'showHistory');
		} else {
			if (!this.isItemRefundable(item)) {
				contextMenuData = contextMenuData.filter(i => i.action !== 'refund');
			}

			if (!this.isPrinterAvailable()) {
				contextMenuData = contextMenuData.filter(i => i.action !== 'printTicket');
			}
		}

		return contextMenuData;
	}
}
