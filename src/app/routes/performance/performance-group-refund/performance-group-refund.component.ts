import { Component, OnInit, OnDestroy, Inject, ComponentRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { EntityService } from '../../../services/entity.service';
import { TetherDialog } from '../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { AuthenticationService } from '../../../services/authentication.service';
import { ActivatedRoute } from '@angular/router';
import { TransactionRefundReasonBoxComponent } from '../../../modules/boxoffice-module/common/transaction-refund-reason-box/transaction-refund-reason-box.component';
import { PaymentService } from '../../../services/payment.service';
import { RelativeDatePipe } from '../../../pipes/relative-date.pipe';
import { OkcVariables } from '../../../classes/okc-variables';
import { NotificationService } from '../../../services/notification.service';
import { Promise } from 'q';
import { AppSettingsService } from '../../../services/app-settings.service';
import { TransactionTypeNew } from '../../../models/transaction-type-new.enum';
import { Roles } from '../../../models/roles';

@Component({
  selector: 'app-performance-group-refund',
  templateUrl: './performance-group-refund.component.html',
  styleUrls: ['./performance-group-refund.component.scss'],
  entryComponents: [TransactionRefundReasonBoxComponent],
  providers: [EntityService, AuthenticationService, PaymentService, {provide: 'entityServiceInstance1', useClass: EntityService }],
})
export class PerformanceGroupRefundComponent implements OnInit, OnDestroy {

  // Template
  isLoading = false;
  isPromising = false;
  noDataInContent = false;
  allRefunded = false;

  pills: Array<any> = [
    { text: 'GİŞE', filter: "(SalesChannel/Name eq 'Box Office' or SalesChannel/Name eq 'BoxOffice') and TransactionType eq cast('1', Nirvana.Shared.Enums.TransactionTypeNew)", isActive: true },
    { text: 'ÇEVRİMİÇİ', filter: "(SalesChannel/Name eq 'Web' or SalesChannel/Name eq 'Mobile') and TransactionType eq cast('1', Nirvana.Shared.Enums.TransactionTypeNew)", isActive: false },
    { text: 'DAVETİYE', filter: "TransactionType eq cast('2', Nirvana.Shared.Enums.TransactionTypeNew)", isActive: false },
  ];

  searchOptions = {
		options: [
			{value: 'refId', text: 'İşlem ID\'ye Göre' },
			{value: 'phone', text: 'GSM No\'ya göre' },
		],
		placeholders: {
			refId: 'İşlem ID\'ye göre arama yapın',
			phone: 'GSM No\'ya göre arama yapın',
		}
  }

  actionButtons = [{
    label: 'Biletleri İade Et',
    icon: 'replay',
    action: 'refund',
    isActive: true,
    role: Roles.PERFORMANCE_BULK_REFUND
  }];

  // Service
  subscription: any;
  paymentItemServiceSubscription: any;
  paramsub: any;
  transactions: any[];
  performanceId: number;
  refundReasonId: number;
  salesChannel: string;
  refundPaymentType = '';
  paymentItem: any;
  paymentEndDateForRefundableItems;
  paymentEndDate;

  // Pagination
  currentPage: 1;
  pageSize: 10;
  count: number;
  showPagination = true;
  pageSizes = [{text: '10', value: 10}, {text: '20', value: 20}];

  // Multiselection Bar
  selectedItems = [];
  isAllSelected = false;

  constructor(
    private entityService: EntityService,
    private tetherDialog: TetherDialog,
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private appSettingsService: AppSettingsService,
    @Inject('entityServiceInstance1') private paymentItemService: EntityService,
  ) {
    this.entityService.setOrder({ sortBy: 'PaymentDate', type: 'desc' });
  }

  ngOnInit() {
    this.paramsub = this.route.parent.params.subscribe(params => {
      this.performanceId = +params['id'];
    });

    this.paymentEndDateForRefundableItems = this.appSettingsService.getLocalSettings('paymentEndDateForRefundableItems');

    if (this.pills && this.pills.length) this.pillFilter(this.pills[0]);

    this.entityService.setCustomEndpoint('GetAll');
    this.subscription = this.entityService.queryParamSubject.subscribe(params => {
      this.isLoading = true;
      this.updateLocalParams(params);
      let query = this.entityService.fromEntity('TBasket')
                                    .expand(['Terminal'])
                                    .expand(['Currency'])
                                    .expand(['SalesChannel'])
                                    .expand(['SalesSubChannel'])
                                    .expand(['MemberInfo'])
                                    .expand(['User'])
                                    .expand(['Items', 'AccessCodes'])
                                    .whereRaw(`Items/any(i:i/AccessCodes/any(a:a/PerformanceId eq ${this.performanceId}))`)
                                    .take(params['pageSize'])
                                    .page(params['page']);

      let sort = this.parseOrReturn(params['sort']);
      if (sort && sort[0]) query.orderBy(sort[0]['sortBy'], sort[0]['type']);
      if (params['search']) query.search(params['search']['key'], params['search']['value']);
      if (params['filter'] && params['filter'][0] && params['filter'][0]['filter']) query.andRaw(params['filter'][0].filter);
      query.executeQuery();
    }, error => {
      this.isLoading = false;
      console.log('Error getting query parameters: ' + error);
    });

    this.entityService.data.subscribe(entities => {
      this.selectedItems = [];
      if (entities) {
        this.transactions = entities;
        this.noDataInContent = this.transactions.length === 0;
        if (!this.noDataInContent) {
          this.allRefunded = true;
          this.transactions.forEach(t => {
            t.Type = TransactionTypeNew[t.TransactionType];
            let productItems = t.Items.filter(i => ((i.Type === 3) && (i.AccessCodes && i.AccessCodes[0].PerformanceId === this.performanceId)));
            t.isRefunded = productItems.every(p => p.RefundStatus === 3);
            t.isNotRefundable = productItems.every(p => p.RefundStatus === 2);
            if (!t.isRefunded && !t.isNotRefundable) this.allRefunded = false;
          });
        }
        this.isLoading = false;
        this.isPromising = false;
      }
    }, error => {
      this.isLoading = false;
      this.isPromising = false;
      if (error && error.Type === 2) {
        this.notificationService.add({
          type: 'danger',
          text: `${error['ErrorCode']}: ${error['Message']}`
        });
      } else {
        this.notificationService.add({
          type: 'danger',
          text: `Performansa ait işlemler getirilirken bir sorun oluştu.`
        });
      }
    });

    this.entityService.getCount().subscribe(count =>
      this.count = count, error => console.log('Error on getting the count of transactions: ' + error)
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.paymentItemServiceSubscription) this.paymentItemServiceSubscription.unsubscribe();
  }

  updateLocalParams(params: Object = {}) {
    this.currentPage = params['page'] || 1;
    this.pageSize = params['pageSize'] || 10;
  }

  onTypeChange(e) {
    this.entityService.setSearch({ key: 'RefId', value: ''});
  }

  onInputChange(e) {
    if (e) {
      this.isPromising = true;
      switch (e.searchType) {
        case 'refId':
          this.entityService.setSearch({ key: 'RefId', value: e.searchValue});
          break;
        case 'phone':
          this.entityService.setSearch({ key: 'MemberInfo/PhoneNumber', value: e.searchValue});
          break;
        default:
          break;
      }
    }
  }

  toggleSortTitle(sort) {
		if (sort) {
			this.entityService.setOrder(sort, true);
		} else {
			this.entityService.flushOrder();
		}
	}

	pillFilter(pill) {
    this.pills.forEach(p => {
      p.isActive = p.text === pill.text;
    });
		this.entityService.setFilter(pill);
	}

	transistPage(page) {
		this.entityService.setPage(page);
	}

	changePageSize(pageSize) {
		this.entityService.setPageSize(pageSize);
	}

	selectAllItems(selectAll: boolean): void {
		if (selectAll && this.selectedItems.length < this.transactions.length) {
			this.selectedItems = [];
			this.transactions.forEach(item => {
        if (!item.isRefunded && !item.isNotRefundable) {
          this.selectedItems.push(item);
        }
			});
			this.isAllSelected = true;
		}
		if (!selectAll) {
			this.isAllSelected = false;
			this.selectedItems = [];
		}
	}

	selectItem(isSelected: boolean, transaction: any): void {
		if (isSelected) {
			this.selectedItems.push(transaction);
		} else {
			let selectedVenue = this.selectedItems.filter(item => {
				return (transaction === item);
			})[0];
			this.selectedItems.splice(this.selectedItems.indexOf(selectedVenue), 1);
		}
  }

  callAction(action) {
    console.log(action);
    console.log(this.selectedItems);
    if (action) {
      switch (action) {
        case 'refund':
          this.salesChannel = this.pills.find(p => p.isActive).text;
          this.openRefundReasonModal(this.selectedItems, 'İade');
          break;
      }
    }
  }

  openContextMenu(e, transaction) {
		let content = {
			title: 'İŞLEMLER',
			data: [
				{ label: 'İade Et', icon: 'replay', action: 'refund'},
			]
		}

		this.tetherDialog.context(content, {
			target: e.target,
			attachment: 'top right',
			targetAttachment: 'top right',
			targetOffset: '-13px 0px'
		}).then(result => {
			if (result) {
        // this.salesChannel = transaction.SalesChannel.Name;
        this.salesChannel = this.pills.find(p => p.isActive).text;
				switch (result['action']) {
          case 'refund':
            switch (this.salesChannel) {
              case 'ÇEVRİMİÇİ':
              case 'DAVETİYE':
                this.openRefundReasonModal([transaction], 'İade');
                break;
              case 'GİŞE':
                this.refundBoxOfficeTransaction(transaction);
                break;
              default:
                this.notificationService.add({ text: 'Seçtiğiniz işlem iade edilebilir değildir.', type: 'info'});
                break;
            }
				}
			}
		}).catch(reason => console.log('dismiss reason : ', reason));
  }

  private openRefundReasonModal(transactions: any[], action: string) {
		let component: ComponentRef<TransactionRefundReasonBoxComponent>;
		component = this.resolver.resolveComponentFactory(TransactionRefundReasonBoxComponent).create(this.injector);
		component.instance.action = action;
		component.instance.paymentType = this.refundPaymentType;
    component.instance.salesChannel = this.salesChannel === 'GİŞE' ? 'BoxOffice' : '';
    component.instance.isTransaction = true;

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
      if (result && result.ReasonId > 0) {
        this.refundReasonId = result.ReasonId;
        switch (this.salesChannel) {
          case 'GİŞE':
            if (this.refundPaymentType.includes('Nakit')) {
                this.refundTransactions(transactions);
            } else {
                this.refundOrVoidPayment(transactions, action);
            }
            break;
          case 'ÇEVRİMİÇİ':
          case 'DAVETİYE':
            this.refundTransactions(transactions);
            break;
          default:
            break;
        }
      } else {
        this.isLoading = false;
        this.notificationService.add({type: 'warning', text: 'Tüm işlem bazında yapılan iadelerde iade nedeni seçimi zorunludur.'});
      }
		})
    .catch(reason => {
      this.isLoading = false;
      console.log('Refund Reason Modal dismiss reason: ', reason)
    });
  }

  private refundTransactions(transactions) {
    this.paymentService.setCustomApi('boxoffice');
    let payLoad: any;
    let payLoadItem: any;
    this.isLoading = true;
    if (transactions.length > 1) {
      this.paymentService.setCustomEndpoint('RefundTransactionList', true);
      payLoad = [];
      transactions.forEach(transaction => {
        payLoadItem = this.preparePayLoad(transaction);
        if (payLoad) {
          payLoad.push(payLoadItem);
        }
      });
    } else {
      this.paymentService.setCustomEndpoint('RefundTransaction', true);
      payLoad = this.preparePayLoad(transactions[0]);
    }

    if (payLoad && payLoad.length && payLoad.length > 0 || payLoad && payLoad.T_Items && payLoad.T_Items.length && payLoad.T_Items.length > 0) {
      this.paymentService.save(payLoad)
						   .subscribe(
								response => {
                  if (transactions.length > 1) {
                    transactions.forEach(t => {
                      this.transactions.find(tt => tt.RefId === t.RefId).isRefunded = true;
                    });
                  } else {
                    this.transactions.find(tt => tt.RefId === transactions[0].RefId).isRefunded = true;
                  }
                  this.selectedItems = [];
                  this.isLoading = false;
									this.notificationService.add({
										text: 'İşlem iade edildi.',
										type: 'success'
										});
								},
								error => {
                  if (error && error.Type === 2) {
                    this.notificationService.add({
                      type: 'danger',
                      text: `${error['ErrorCode']}: ${error['Message']}`
                    });
                  } else {
                    this.notificationService.add({
                      type: 'danger',
                      text: `İşlem iade edilirken bir sorun oluştu.`
                    });
                  }
                  this.isLoading = false;
								}
			);
    } else {
      this.isLoading = false;
      this.notificationService.add({text: 'İşlem içerisinde performansa ait iade edilebilir bilet bulunmamaktadır.', type: 'warning'});
    }
  }

  // Box Office Refund Process -- MT

  private refundBoxOfficeTransaction(transaction: any): any {
    this.isLoading = true;
    let paymentItem: any;
    this.paymentItemService.setCustomEndpoint('GetAll');
    this.paymentItemService.fromEntity('TPaymentItem')
                           .where('BasketId', '=', transaction.Id)
                           .executeQuery();
    this.paymentItemServiceSubscription = this.paymentItemService.data.skip(1).first().subscribe(response => {
      if (response && response.length > 0) {
        if (response[0]) {
          transaction.PaymentItem = response[0];
          this.refundPaymentType = transaction.PaymentItem.Type_Desc;
          this.paymentEndDate = new Date(transaction.PaymentItem.PaymentEndTime);
          if (this.refundPaymentType.includes('Nakit')) {
            this.openRefundReasonModal([transaction], 'İade');
          } else {
            this.openRefundSelectionBox(transaction);
            // this.notificationService.add({ text: 'Not Implemented', type: 'info'});
          }
        }
      }
    }, error => {
      this.isLoading = false;
      if (error && error.Type === 2) {
        this.notificationService.add({
          type: 'danger',
          text: `${error['ErrorCode']}: ${error['Message']}`
        });
      } else {
        this.notificationService.add({
          type: 'danger',
          text: `İşlem iade edilirken bir sorun oluştu.`
        });
      }
    });
  }

  private openRefundSelectionBox(transaction: any) {
    let date = new RelativeDatePipe().transform(transaction.PaymentDate);

		this.tetherDialog.confirm({
			title: 'İşlemi iptal ya da iade edin',
			description: date + ' tarihli ödeme için yapılacak işlemi seçiniz:',
			confirmButton: { label: 'İADE ET', theme: 'danger' },
			dismissButton: { label: 'İPTAL ET', theme: 'primary', type: 'button' }
		}).then(result => {
			this.openRefundReasonModal([transaction], 'İade');
		}).catch(reason => {
			if (reason.target.innerText.includes('İPTAL ET')) {
				this.openRefundReasonModal([transaction], 'İptal');
			} else {
				console.log('Refund Reason Modal dismiss reason: ', reason);
			}
		});
	}

  private refundOrVoidPayment(transactions, action) {

		let okcVariables = OkcVariables;
    let transaction = transactions[0];
    let confirmBoxTitle = action + ' Edin';

    this.tetherDialog.confirm({
      title: confirmBoxTitle,
      description: 'Kartı Pos Cihazına Takınız',
      confirmButton: { label: 'TAMAM', theme: 'danger' }
    }).then(result => {
      if (action === 'İade') {
        this.refundPaymentOKC(transaction);
      } else if (action === 'İptal') {
        this.voidPaymentOKC(transaction);
      } else {
        this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
      }
    }).catch(reason => {
      this.isLoading = false;
      console.log('Refund Reason Modal dismiss reason: ', reason);
    });
  }

  private calculateAmount(transaction): number {
    let itemsToRefund = this.getItemsToRefund(transaction);
    let amount = 0;
    itemsToRefund.forEach(i => {
      amount += i.PaidAmount;
    });
    return amount;
  }

  private refundPaymentOKC(transaction) {

    let okcVariables = OkcVariables;

    if (transaction && transaction.Items && transaction.Items.length > 0 && transaction.PaymentItem) {
      let amount = this.calculateAmount(transaction);
      let paymentItem = transaction.PaymentItem;
      if (amount > 0) {
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

        const paymentRefundRequestJson = JSON.stringify(paymentRefundRequest);

        console.log(`PaymentRefundRequest: ${paymentRefundRequestJson}`);

        try {
          const paymentRefundResponse = window['DeviceIntegrationInstance'].refundPayment(paymentRefundRequestJson);
          if (paymentRefundResponse.result.isTransactionSuccess) {
              if (paymentRefundResponse.result.deviceResultValue ==  okcVariables.REFUD_SUCCESS) {
                this.refundTransactions([transaction]);
              } else {
                this.isLoading = false;
                this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
              }
          } else {
              this.isLoading = false;
              this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
          }
        } catch (e) {
          this.isLoading = false;
          this.notificationService.add({
            text: 'İşlem Başarısız. OKC cihazının bağlantısını kontrol ediniz.',
            type: 'danger'
          });
        }
      }
    } else {
      this.isLoading = false;
      this.notificationService.add({text: 'Seçtiğiniz işlem iade edilebilir değildir.', type: 'danger'});
    }
	}

	private voidPaymentOKC(transaction) {

    let okcVariables = OkcVariables;
    if (transaction && transaction.Items && transaction.Items.length > 0 && transaction.PaymentItem) {
      const paymentItem = transaction.PaymentItem;
      const amount = this.calculateAmount(transaction);
      if (amount > 0) {
        const paymentVoidRequest = {
          Amount: amount,
          BankBkmId: paymentItem.BankBkmId,
          BatchNo: paymentItem.BatchNo,
          Stan: paymentItem.Stan,
          TerminalId: paymentItem.TerminalId
        };

        const paymentVoidRequestJson = JSON.stringify(paymentVoidRequest);

        console.log(`PaymentVoidRequest: ${paymentVoidRequestJson}`);

        try {
          const paymentVoidResponse = window['DeviceIntegrationInstance'].voidPayment(paymentVoidRequestJson);
          if (paymentVoidResponse.result.isTransactionSuccess) {
              if (paymentVoidResponse.result.deviceResultValue ==  okcVariables.VOID_PAYMENT_SUCCESS) {
                  this.refundTransactions([transaction]);
              } else {
                  this.isLoading = false;
                  this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
              }
          } else {
              this.isLoading = false;
              this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
          }
        } catch (e) {
          this.isLoading = false;
          this.notificationService.add({
            text: 'İşlem Başarısız. OKC cihazının bağlantısını kontrol ediniz.',
            type: 'danger'
          });
        }
      }
    } else {
      this.isLoading = false;
      this.notificationService.add({text: 'Seçtiğiniz işlem iptal edilebilir değildir.', type: 'danger'});
    }
  }

  // Helpers
  private parseOrReturn(arg: any) {
    if (!arg) return null;
    if (typeof arg === 'string') {
      return JSON.parse(arg);
    } else {
      return arg;
    }
  }

  private getItemsToRefund(transaction) {
    let itemsToRefund = [];
    // Reservations are all refundable
    if (this.salesChannel === 'DAVETİYE') {
      for (let item of transaction.Items) {
        if (item.AccessCodes && item.AccessCodes.some(a => a.PerformanceId === this.performanceId) && item.RefundStatus === 1) {
          itemsToRefund.push(item);
        }
      }
    } else {
      // Find the numbers of the items which belong to this performance and refundable -- MT
      let itemNos = [];
      for (let item of transaction.Items) {
        if (item.RefundStatus === 1 && item.AccessCodes 
                                    && item.AccessCodes.some(a => a.PerformanceId === this.performanceId)) {
          if (this.salesChannel === 'GİŞE' && this.paymentEndDate >= this.paymentEndDateForRefundableItems) {
            itemNos.push(item.ItemNo);
          } else {
            itemNos.push(item.ItemNo);
          }
        }
      }

      // Find the Ticket and Product Fee -- MT
      for (let item of transaction.Items) {
        if (itemNos.includes(item.ItemNo) && (item.Type === 1 || item.Type === 3)) {
          itemsToRefund.push(item);
        }
      }
    }
    return itemsToRefund;
  }

  private preparePayLoad(transaction) {
    let itemsToRefund = this.getItemsToRefund(transaction);
    let itemIdsToRefund = itemsToRefund.map(i => i.Id);
    let payLoad: any;
    if (itemsToRefund && itemsToRefund.length > 0) {
      payLoad = {
        BasketRefId: transaction.RefId,
        ReasonId: this.refundReasonId,
        T_Items: []
      };
      itemsToRefund.forEach(i => payLoad.T_Items.push({ Id: i.Id, ReasonId: this.refundReasonId }));
    }
    return payLoad;
  }
}
