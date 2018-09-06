import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { PaymentRefundReason } from './../../../../models/payment-refund-reason.enum';
import { TetherDialog } from "../../../common-module/modules/tether-dialog/tether-dialog";


@Component({
  selector: 'app-transaction-refund-reason-box',
  templateUrl: './transaction-refund-reason-box.component.html',
  styleUrls: ['./transaction-refund-reason-box.component.scss']
})
export class TransactionRefundReasonBoxComponent implements OnInit {
  @HostBinding('class.oc-transaction-refund-box') true;

  @Input() action;
  @Input() paymentType;
  @Input() salesChannel;
  @Input() isTransaction: boolean;
  reasonId;

  public refundReasonOptions = [
		{text: "NotSet", value: PaymentRefundReason['NotSet']},
		{text: "Etkinlik İptali", value: PaymentRefundReason['EventCancellation']},
		{text: "Etkinlik Ertelenmesi", value: PaymentRefundReason['EventPostponement']},
		{text: "Müşteri Memnuniyetsizliği", value: PaymentRefundReason['CustomerDissatisfaction']},
		{text: "OperationalError", value: PaymentRefundReason['OperationalError']},
		{text: "Diğer", value: PaymentRefundReason['Other']},
  ]

  constructor(
    public tetherDialog: TetherDialog
  ) { }

  ngOnInit() {
    if(!this.action)
      this.action = "İade";

    this.reasonId = this.refundReasonOptions[0].value;
  }

  public onInputChange(e){
    this.reasonId = e;
  }

  public submitClickHandler(e){
    this.tetherDialog.close({
      ReasonId: this.reasonId
    })
  }

}
