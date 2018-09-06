

import { BaseComponentsModule } from './../base-module/base-components.module';
import { CommonComponentsModule } from './../common-module/common-components.module';
import { WideColBasketItemComponent } from './components/wide-col-basket-item/wide-col-basket-item.component';
import { NarrowColTimerComponent } from './components/narrow-col-timer/narrow-col-timer.component';
import { NarrowColBasketItemComponent } from './components/narrow-col-basket-item/narrow-col-basket-item.component';
import { MultiplePaymentBlockComponent } from './components/multiple-payment-block/multiple-payment-block.component';
import { BasketDetailComponent } from './components/basket-detail/basket-detail.component';
import { ProductItemLineBoxofficeComponent } from './components/product-item-line-boxoffice/product-item-line-boxoffice.component';
import { TransactionRefundBoxComponent } from './common/transaction-refund-box/transaction-refund-box.component';
import { AddToBasketWithCodeComponent } from './common/add-to-basket-with-code/add-to-basket-with-code.component';
import { CampaignMonitorComponent } from './components/campaign-monitor/campaign-monitor.component';
import { ClaimModalComponent } from './common/claim-modal/claim-modal.component';
import { PipesModule } from './../pipes.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SeatViewerComponent } from './components/seat-viewer/seat-viewer.component';
import { SeatListModalComponent } from './common/seat-list-modal/seat-list-modal.component';
import { QRCodeModule } from 'angular2-qrcode';
import { MessageModalComponent } from './common/message-modal/message-modal.component';
import { TransactionRefundReasonBoxComponent } from './common/transaction-refund-reason-box/transaction-refund-reason-box.component';
import { OtpValidationBoxComponent } from './common/otp-validation-box/otp-validation-box.component';
import { CollectDataComponent } from './components/collect-data/collect-data.component';
import { ProductPillGroupComponent } from './components/product-pill-group/product-pill-group.component';
import { BasketInfoBarComponent } from './components/basket-info-bar/basket-info-bar.component';
import { AccessCodeHistoryModalComponent } from './common/access-code-history-modal/access-code-history-modal.component';
import { PromoterSelectionBoxComponent } from './common/promoter-selection-box/promoter-selection-box.component';
import { RoleGroupSelectionBoxComponent } from './common/role-group-selection-box/role-group-selection-box.component';
import { InstallmentOptionsComponent } from './components/installment-options/installment-options.component';
import { CancelBlockSelectProductBoxComponent } from './common/cancel-block-select-product-box/cancel-block-select-product-box.component';
import { InvoiceCustomerCheckComponent } from './components/invoice-customer-check/invoice-customer-check.component';
import { InvoiceCustomerInfoBoxComponent } from './components/invoice-customer-info-box/invoice-customer-info-box.component';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    PipesModule,
    BaseComponentsModule,
    CommonComponentsModule,
    QRCodeModule
  ],
  declarations: [
    AddToBasketWithCodeComponent,
    TransactionRefundBoxComponent,
    BasketDetailComponent,
    MultiplePaymentBlockComponent,
    NarrowColBasketItemComponent,
    NarrowColTimerComponent,
    WideColBasketItemComponent,
    ProductItemLineBoxofficeComponent,
    CampaignMonitorComponent,
    ClaimModalComponent,
    SeatViewerComponent,
    SeatListModalComponent,
    MessageModalComponent,
    TransactionRefundReasonBoxComponent,
    OtpValidationBoxComponent,
    CollectDataComponent,
    ProductPillGroupComponent,
    BasketInfoBarComponent,
    AccessCodeHistoryModalComponent,
    PromoterSelectionBoxComponent,
    RoleGroupSelectionBoxComponent,
    InstallmentOptionsComponent,
    CancelBlockSelectProductBoxComponent,
    InvoiceCustomerCheckComponent,
    InvoiceCustomerInfoBoxComponent,
  ],
  exports: [
    AddToBasketWithCodeComponent,
    TransactionRefundBoxComponent,
    BasketDetailComponent,
    MultiplePaymentBlockComponent,
    NarrowColBasketItemComponent,
    NarrowColTimerComponent,
    WideColBasketItemComponent,
    ProductItemLineBoxofficeComponent,
    CampaignMonitorComponent,
    ClaimModalComponent,
    TransactionRefundReasonBoxComponent,
    CollectDataComponent,
    ProductPillGroupComponent,
    BasketInfoBarComponent,
    AccessCodeHistoryModalComponent
  ]
})
export class BoxofficeComponentsModule { }