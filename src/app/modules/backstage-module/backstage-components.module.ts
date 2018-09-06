import { BaseComponentsModule } from './../base-module/base-components.module';
import { CommonComponentsModule } from './../common-module/common-components.module';
import { AttributesSelectAddComponent } from './common/attributes-select-add/attributes-select-add.component';
import { VenueSelectBarComponent } from './components/venue-select-bar/venue-select-bar.component';
import { SeatRelocateComponent } from './components/seat-relocate/seat-relocate.component';
import { ProductSelectionTypeListComponent } from './components/product-selection-type-list/product-selection-type-list.component';
import { ProductSearchSelectComponent } from './components/product-search-select/product-search-select.component';
import { ProductPriceBlockComponent } from './components/product-price-block/product-price-block.component';
import { PerformerSearchSelectComponent } from './components/performer-search-select/performer-search-select.component';
import { PerformanceSearchSelectComponent } from './components/performance-search-select/performance-search-select.component';
import { PerformanceCapacitySearchSelectComponent } from './components/performance-capacity-search-select/performance-capacity-search-select.component';
import { NarrowColEventCalendarComponent } from './components/narrow-col-event-calendar/narrow-col-event-calendar.component';
import { FirmSearchSelectComponent } from './components/firm-search-select/firm-search-select.component';
import { EventSearchSelectComponent } from './components/event-search-select/event-search-select.component';
import { VenueSearchSelectComponent } from './common/venue-search-select/venue-search-select.component';
import { SeatSelectComponent } from './common/seat-select/seat-select.component';
import { GroupSaleContactComponent } from './common/group-sale-contact/group-sale-contact.component';
import { AttributesSelectAddBarComponent } from './components/attributes-select-add-bar/attributes-select-add-bar.component';
import { AddVariantPriceBoxComponent } from './common/add-variant-price-box/add-variant-price-box.component';
import { AddVariantBoxComponent } from './common/add-variant-box/add-variant-box.component';
import { AddReservationComponent } from './common/add-reservation/add-reservation.component';
import { AddPerformanceComponent } from './common/add-performance/add-performance.component';
import { AddInvitationComponent } from './common/add-invitation/add-invitation.component';
import { SeatingArrangementCreateComponent } from './common/seating-arrangement-create/seating-arrangement-create.component';
import { PerformerCreateComponent } from './common/performer-create/performer-create.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { NarrowReportChartComponent } from './components/narrow-report-chart/narrow-report-chart.component';
import { ReportsDataTableComponent } from './components/reports-data-table/reports-data-table.component';
import { PipesModule } from './../pipes.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AddSalesChannelComponent } from './common/add-sales-channel/add-sales-channel.component';
import { AddSalesSubChannelComponent } from './common/add-sales-sub-channel/add-sales-sub-channel.component';
import { AddSalesSubChannelTerminalComponent } from './common/add-sales-sub-channel-terminal/add-sales-sub-channel-terminal.component';
import { UserCardComponent } from './components/user-card/user-card.component';
import { TerminalUserListComponent } from './components/terminal-user-list/terminal-user-list.component';
import { AddTerminalUserBoxComponent } from './common/add-terminal-user-box/add-terminal-user-box.component';
import { CustomerCardListComponent } from './components/customer-card-list/customer-card-list.component';
import { PerformanceProductSelectListComponent } from './components/performance-product-select-list/performance-product-select-list.component';
import { TemplateCreateWizardComponent } from './common/template-create-wizard/template-create-wizard.component';


@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    PipesModule,
    BaseComponentsModule,
    CommonComponentsModule
  ],
  declarations: [
    AddInvitationComponent,
    AddPerformanceComponent,
    AddReservationComponent,
    AddVariantBoxComponent,
    AddVariantPriceBoxComponent,
    AttributesSelectAddComponent,
    GroupSaleContactComponent,
    PerformerCreateComponent,
    SeatSelectComponent,
    SeatingArrangementCreateComponent,
    VenueSearchSelectComponent,
    LineChartComponent,
    NarrowReportChartComponent,
    ReportsDataTableComponent,
    AddTerminalUserBoxComponent,

    AttributesSelectAddBarComponent,
    EventSearchSelectComponent,
    FirmSearchSelectComponent,
    NarrowColEventCalendarComponent,
    NarrowColEventCalendarComponent,
    PerformanceCapacitySearchSelectComponent,
    PerformanceSearchSelectComponent,
    PerformerSearchSelectComponent,
    ProductPriceBlockComponent,
    ProductSearchSelectComponent,
    ProductSelectionTypeListComponent,
    SeatRelocateComponent,
    VenueSelectBarComponent,
    AddSalesChannelComponent,
    AddSalesSubChannelComponent,
    AddSalesSubChannelTerminalComponent,
    UserCardComponent,
    TerminalUserListComponent,
    CustomerCardListComponent,
    PerformanceProductSelectListComponent,
    TemplateCreateWizardComponent,
  ],
  exports: [
    AddInvitationComponent,
    AddPerformanceComponent,
    AddReservationComponent,
    AddVariantBoxComponent,
    AddVariantPriceBoxComponent,
    AttributesSelectAddComponent,
    GroupSaleContactComponent,
    PerformerCreateComponent,
    SeatSelectComponent,
    SeatingArrangementCreateComponent,
    VenueSearchSelectComponent,
    LineChartComponent,
    NarrowReportChartComponent,
    ReportsDataTableComponent,
    AddTerminalUserBoxComponent,

    AttributesSelectAddBarComponent,
    EventSearchSelectComponent,
    FirmSearchSelectComponent,
    NarrowColEventCalendarComponent,
    NarrowColEventCalendarComponent,
    PerformanceCapacitySearchSelectComponent,
    PerformanceSearchSelectComponent,
    PerformerSearchSelectComponent,
    ProductPriceBlockComponent,
    ProductSearchSelectComponent,
    ProductSelectionTypeListComponent,
    SeatRelocateComponent,
    VenueSelectBarComponent,
    AddSalesChannelComponent,
    AddSalesSubChannelComponent,
    AddSalesSubChannelTerminalComponent,
    UserCardComponent,
    TerminalUserListComponent,
    CustomerCardListComponent,
    PerformanceProductSelectListComponent
  ]
})
export class BackstageComponentsModule { }
