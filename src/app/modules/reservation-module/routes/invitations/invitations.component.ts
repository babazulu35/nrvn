import { TetherDialog } from '../../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit, HostBinding, OnDestroy, ComponentRef, ComponentFactoryResolver, Injector, Inject } from '@angular/core';
import { EntityService } from '../../../../services/entity.service';
import * as moment from 'moment';
import { TransactionRefundReasonBoxComponent } from '../../../boxoffice-module/common/transaction-refund-reason-box/transaction-refund-reason-box.component';
import { PaymentService } from '../../../../services/payment.service';
import { NotificationService } from '../../../../services/notification.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PerformanceStatus } from '../../../../models/performance-status.enum';

@Component({
	selector: 'app-invitations',
	templateUrl: './invitations.component.html',
  	styleUrls: ['./invitations.component.scss'],
  	entryComponents: [TransactionRefundReasonBoxComponent],
	providers: [
		EntityService,
		PaymentService,
		{ provide: 'performanceEntityService', useClass: EntityService },
		{provide: 'accessCodeService', useClass: EntityService },
	],
})
export class InvitationsComponent implements OnInit, OnDestroy {

	PerformanceStatus = PerformanceStatus;

	subscription;
	transactions = [];
	count: number;
	noDataInContent = false;
	isLoading = false;
	isPromising = false;

	isAllSelected = false;

	showPagination = true;
	pageSizes: Array<Object> = [{text: '10', value: 10}, {text: '20', value: 20}];
	pageSize = 10;
	currentPage = 1;
	userId;
	isBoxofficeUser = false;

	performance: any;

	get isSuitableForNew(): boolean {
		if (this.performance) {
		  return this.performance && this.performance.ReservationAvailable
								  && this.performance.Status === PerformanceStatus.OnSale || this.performance.Status === PerformanceStatus.SoldOut;
		}
	  }

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

	pills: Array<any> = [
		{text: 'TÜMÜ', filter: '', isActive: false},
		{text: 'BUGÜN', filter: this.getDateRangeFilter('today', 'PaymentDate'), isActive: false},
		{text: 'DÜN', filter: this.getDateRangeFilter('yesterday', 'PaymentDate'), isActive: false},
		{text: 'SON HAFTA', filter: this.getDateRangeFilter('lastweek', 'PaymentDate'), isActive: false},
		{text: 'SON AY', filter: this.getDateRangeFilter('lastmonth', 'PaymentDate'), isActive: false},
		{text: 'RSVP', filter: "TransactionSubType  eq cast('20', Nirvana.Shared.Enums.TransactionSubType )", isActive: false},
		{text: 'NO RSVP', filter: "TransactionSubType  eq cast('21', Nirvana.Shared.Enums.TransactionSubType )", isActive: false},
		{text: 'RSVP POOL', filter: "TransactionSubType  eq cast('22', Nirvana.Shared.Enums.TransactionSubType )", isActive: false},
	];

	constructor(
		private entityService: EntityService,
		public tetherDialog: TetherDialog,
		private paymentService: PaymentService,
		private resolver: ComponentFactoryResolver,
		private injector: Injector,
		private notificationService: NotificationService,
		private router: Router,
		private route: ActivatedRoute,
		@Inject('performanceEntityService') private performanceEntityService: EntityService,
		@Inject('accessCodeService') private accessCodeService: EntityService,
	) {
		this.entityService.setOrder({ sortBy: 'PaymentDate', type: 'desc' });
	}

	ngOnInit() {
		this.isLoading = true;

		let performanceId;
		let url = this.router.url;
		if (url) {
			let parts = url.split('/');
			if (parts && parts.length >= 2) {
				performanceId = +parts[2];
			}
		}

		this.performanceEntityService.data.subscribe( entities => {
			if (entities && entities[0]) this.performance = entities[0];
			console.log(this.performance);
		});
		this.performanceEntityService.setCustomEndpoint('GetAll');
		this.performanceEntityService
			.fromEntity('EPerformance')
			.where('Id', '=',  performanceId)
			.take(1)
			.page(0)
			.executeQuery();

		this.entityService.setCustomEndpoint('GetAll');

		this.subscription = this.entityService.queryParamSubject.subscribe(
			params => {
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
				.whereRaw("TransactionType eq cast('2', Nirvana.Shared.Enums.TransactionTypeNew)")
				.take(params['pageSize'])
				.page(params['page']);

				if (performanceId && performanceId > 0) {
					query.andRaw(`Items/any(i:i/AccessCodes/any(a:a/PerformanceId eq ${performanceId}))`)
				}

				let sort = params['sort'] ? (typeof params['sort'] == 'string'  ? JSON.parse(params['sort']) : params['sort']) : null;
				if (sort && sort[0]) {
					query.orderBy(sort[0]['sortBy'], sort[0]['type'])
				}
				if (params['search']) {
					query.search(params['search']['key'], params['search']['value']);
				}

				if (params['filter'] && params['filter'].length > 0 && params['filter'][0].filter) {
				query.andRaw(params['filter'][0].filter);
				}

				query.executeQuery();
			},
			error => this.handleError(error)

		);

		this.entityService.data.skip(1).subscribe(
			entities => {
				this.transactions = entities;
				this.noDataInContent = this.transactions.length === 0;

				if (this.transactions && this.transactions.length) {
					this.transactions.forEach(t => {
						t.isCancelled = t.Items.every(p => p.RefundStatus === 3);
					});
				}

				this.isLoading = false;
				this.isPromising = false;
			},
			error => this.handleError(error)
		);

		this.entityService.getCount().subscribe(
			count => this.count = count,
			error => this.handleError(error)
		);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	updateLocalParams(params: Object = {}) {
		this.currentPage = params['page'] ? params['page'] : 1
		this.pageSize = params['pageSize'] ? params['pageSize'] : 10
	}

	getDateRangeFilter(filter: string, key: string) {
		let startDate = null;
		let endDate = moment().endOf('day');

		switch (filter) {
			case 'today':
				startDate = moment().startOf('day');
				break;
			case 'yesterday':
				startDate = moment().startOf('day').subtract(1, 'days');
				endDate = endDate.subtract(1, 'days');
				break;
			case 'lastweek':
				startDate = moment().startOf('week');
				break;
			case 'lastmonth':
				startDate = moment().startOf('month');
				break;
		}

		if (startDate && endDate) {
			return  `${key} gt ${startDate.toISOString()} and ${key} lt ${endDate.toISOString()}`
		}
		return ''
	}

	onInputChange(event) {
		this.isPromising = true;
		switch (event.searchType) {
			case 'refId':
				this.entityService.setSearch({ key: 'RefId', value: event.searchValue });
				break;
			case 'phone':
				this.entityService.setSearch({ key: 'MemberInfo/PhoneNumber', value: event.searchValue });
				break;
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
		this.entityService.setFilter(pill);
	}

	transistPage(page) {
		this.entityService.setPage(page);
	}

	changePageSize(pageSize) {
		this.entityService.setPageSize(pageSize);
	}

	openContextMenu(e, transaction) {
		let content = {
			title: 'İŞLEMLER',
			data: [
				{ label: 'Koltukları Dışa Aktar', icon: 'file_download', action: 'exportCsv' },
				{ label: 'İade Et', icon: 'replay', action: 'cancel'},
			]
		}

		this.tetherDialog.context(content, {
			target: e.target,
			attachment: 'top right',
			targetAttachment: 'top right',
			targetOffset: '-13px 0px'
		}).then(result => {
			if (result) {
				switch (result['action']) {
          			case 'cancel':
            			this.openRefundReasonModal(transaction, 'İade');
						break;
					case 'exportCsv':
						this.exportCsv(transaction);
						break;
				}
			}
		}).catch(reason => console.log('dismiss reason : ', reason));
	  }

	private exportCsv(transaction) {
		if (!transaction) return;

		this.isLoading = true;
		this.accessCodeService.setCustomEndpoint('GetAll');
		this.accessCodeService.fromEntity('TAccessCode')
							.expand(['Item'])
							.expand(['VenueSeat', 'VenueRow', 'VenueBlock', 'Section'])
							.where('Item/BasketId', '=', transaction.Id)
							.take(10000)
							.page(0)
							.executeQuery();

		this.accessCodeService.data.skip(1).first().subscribe(
			seats => {
				if (seats && seats.length && seats.length > 0) {

					let model: {
						name: string;
						lastName: string;
						phoneNumber: string;
						email: string;
						venueSeatId: string;
						section: string;
						block: string;
						row: string;
						seat: string;
					}[] = [];


					seats.forEach(seat => {
						let modelSeat = {
							name: '',
							lastName: '',
							phoneNumber: '',
							email: '',
							venueSeatId: '',
							section: '',
							block: '',
							row: '',
							seat: '',
						}

						if (transaction.MemberInfo) {
							modelSeat.name = transaction.MemberInfo.FirstName || '';
							modelSeat.lastName = transaction.MemberInfo.FamilyName || '';
							modelSeat.phoneNumber = transaction.MemberInfo.PhoneNumber || '';
							modelSeat.email = transaction.MemberInfo.Email || '';
						}

						if (seat.VenueSeat) {
							modelSeat.venueSeatId = seat.VenueSeat.VSeatId;
							if (seat.VenueSeat.VenueRow) {
							if (seat.VenueSeat.VenueRow.VenueBlock) {
								if (seat.VenueSeat.VenueRow.VenueBlock.Section) {
								modelSeat.section = seat.VenueSeat.VenueRow.VenueBlock.Section.Name || '';
								}
								modelSeat.block = seat.VenueSeat.VenueRow.VenueBlock.Name || '';
							}
							modelSeat.row = seat.VenueSeat.VenueRow.Name || seat.VenueSeat.VenueRow.RowNumber || '';
							}
							modelSeat.seat = seat.VenueSeat.Name || seat.VenueSeat.SeatNo || '';
						}
						model.push(modelSeat);
					});

					let csv = this.convertArrayOfObjectsToCSV({data: model});
					if (csv == null) return;
					let filename = 'export.csv';
					if (!csv.match(/^data:text\/csv/i)) {
						csv = 'data:text/csv;charset=utf-8,' + csv;
					}
					let data = encodeURI(csv);
					let link = document.createElement('a');
					link.setAttribute('href', data);
					link.setAttribute('download', filename);
					link.click();
				}

				this.isLoading = false;
			},
			error => this.handleError(error)
		);
	  }

	// Helper Methods
	private convertArrayOfObjectsToCSV(args) {
		let result, ctr, keys, columnDelimiter, lineDelimiter, data;

		data = args.data || null;
		if (data == null || !data.length) {
			return null;
		}

		columnDelimiter = args.columnDelimiter || ';';
		lineDelimiter = args.lineDelimiter || '\n';

		keys = Object.keys(data[0]);

		result = '';
		result += keys.join(columnDelimiter);
		result += lineDelimiter;

		data.forEach(function(item) {
			ctr = 0;
			keys.forEach(function(key) {
				if (ctr > 0) result += columnDelimiter;

				result += item[key];
				ctr++;
			});
			result += lineDelimiter;
		});

		return result;
	}

	private openRefundReasonModal(transaction: any, action: string) {
		let component: ComponentRef<TransactionRefundReasonBoxComponent>;
		component = this.resolver.resolveComponentFactory(TransactionRefundReasonBoxComponent).create(this.injector);
		component.instance.action = action;
		// component.instance.paymentType = this.refundPaymentType;
		component.instance.salesChannel = '';
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
				this.refundTransaction(transaction, result.ReasonId);
			} else {
				this.isLoading = false;
				this.notificationService.add({type: 'warning', text: 'Tüm işlem bazında yapılan iadelerde iade nedeni seçimi zorunludur.'});
			}
		}).catch(reason => {
			this.isLoading = false;
			console.log('Refund Reason Modal dismiss reason: ', reason)
		});
	}

	private refundTransaction(transaction, reasonId) {
		this.paymentService.setCustomApi('boxoffice');
		this.paymentService.setCustomEndpoint('RefundTransaction', true);
		this.isLoading = true;
		let payLoad = {
			BasketRefId: transaction.RefId,
			ReasonId: reasonId,
			T_Items: ''
		}

		this.paymentService.save(payLoad).subscribe(response => {
				this.isLoading = false;
				this.notificationService.add({
					text: 'İşlem Başarılı',
					type: 'success'
				});
				transaction.isCancelled = true;
			}, error => {
				this.isLoading = false;
				if (error.Type === 2) {
					this.notificationService.add({
						text: `${error.ErrorCode}: ${error.Message}`,
						type: 'danger'
					});
				} else {
					this.notificationService.add({text: 'Davetiye iptal edilirken bir problem oluştu.', type: 'danger'});
				}
			}
		);
	}

	handleError(error) {
		this.isLoading = false;
		if (error && error.Type === 2) {
		  this.notificationService.add({
			type: 'danger',
			text: `${error['ErrorCode']}: ${error['Message']}`
		});
		} else {
		  this.notificationService.add({
			type: 'danger',
			text: `İşlem yapılırken bir sorun oluştu.`
		  });
		}
	  }

	  goToCreate() {
		this.router.navigate(['create/invitation'], {relativeTo: this.route});;
	  }
}
