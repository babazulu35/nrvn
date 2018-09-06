import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { NotificationService } from './../../../../services/notification.service';
import { PaymentService } from './../../../../services/payment.service';
import { PaymentRefundReason } from './../../../../models/payment-refund-reason.enum';
import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';


@Component({
	selector: 'app-transaction-refund-box',
	templateUrl: './transaction-refund-box.component.html',
	styleUrls: ['./transaction-refund-box.component.scss'],
	providers: [PaymentService],
})
export class TransactionRefundBoxComponent implements OnInit {
	@HostBinding('class.oc-transaction-refund-box') true;

	@Input() title: string;
	@Input() basketRefId: string;
	@Input() items = [];

	@Output() isLoadingChanged: EventEmitter<any> = new EventEmitter();

	public refundReasonOptions = [
		{text: "NotSet", value: PaymentRefundReason['NotSet']},
		{text: "Etkinlik İptali", value: PaymentRefundReason['EventCancellation']},
		{text: "Etkinlik Ertelenmesi", value: PaymentRefundReason['EventPostponement']},
		{text: "Müşteri Memnuniyetsizliği", value: PaymentRefundReason['CustomerDissatisfaction']},
		{text: "OperationalError", value: PaymentRefundReason['OperationalError']},
		{text: "Diğer", value: PaymentRefundReason['Other']},
	]

	public payload: {
		BasketRefId: string,
		ReasonId: number,
		T_Items: any
	}

	public isLoading: boolean = false;

	refundAllTransaction: boolean;

	get isValid() {
		// if (!this.payload.ReasonId) return false;

		// for (var i = 0; i < this.payload.T_Items.length; i++) {
		// 	let tItem = this.payload.T_Items[i];
		// 	if (!tItem.ReasonId) return false;
		// }

		return true;
	}

	constructor(
		public tetherDialog: TetherDialog,
		public paymentService: PaymentService,
		public notificationService : NotificationService,
	) {
		this.paymentService.setCustomApi('boxoffice');
		this.paymentService.setCustomEndpoint('RefundTransaction', true);
	}

	ngOnInit() {
		if(!this.title) this.title = "İptal Edin";

		this.refundAllTransaction = this.items.length < 1 ? true : false;
		
		this.payload = {
			BasketRefId: this.basketRefId,
			ReasonId: this.refundReasonOptions[0].value,
			T_Items: []		
		}

		if(!this.refundAllTransaction){
			this.items.forEach(item=>{
				this.payload.T_Items.push({
					Id: item.Id,
					ReasonId: this.refundReasonOptions[0].value,
				});
			});
		}
		else{
			this.payload.T_Items = '';
		}
	}

	public changeIsLoading(isLoading: boolean) {
		this.isLoading = isLoading;
		this.isLoadingChanged.emit(this.isLoading);
	}

	public submitClickHandler(event: any) {
		if (!this.isValid) return;
		this.changeIsLoading(true);

		this.paymentService.save(this.payload).subscribe(resp=>{

			console.log("-----resp----", resp);

			this.notificationService.add({type: 'success', text: "İşlem Başarılı."});
			this.changeIsLoading(false);
			this.tetherDialog.close({
				status: 'success'
			});
		}, error => {
			this.notificationService.add({type: 'danger', text: error['Message']});
			this.changeIsLoading(false);
		});
	}

	public onInputChange(e, item=null) {
		if (item) {
			let tItem = this.payload.T_Items.filter(obj=>{
				return obj.Id == item.Id
			})[0];
			tItem.ReasonId = e;
		} else {			
			this.payload.ReasonId = e;	
		}
	}
}
