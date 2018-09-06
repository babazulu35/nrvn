

import { BoxofficeService } from './services/boxoffice.service';
import { PrintDataService } from './services/print-data.service';
import { MainLoaderService } from './services/main-loader.service';
import { AppSettingsService } from './services/app-settings.service';
import { HeaderTitleService } from './services/header-title.service';
import { BoxofficeComponentsModule } from './modules/boxoffice-module/boxoffice-components.module';
import { BrowserModule } from '@angular/platform-browser';
import { VenueEditComponent } from './routes/venue/venue-edit/venue-edit.component';
import { ProductsBundlesComponent } from './routes/products/products-bundles/products-bundles.component';
import { PerformanceComponent } from './routes/performance/performance.component';
import { EventPerformancesComponent } from './routes/event/event-performances/event-performances.component';
import { IndexComponent } from './routes/index/index.component';
import { HrefDirective } from './directives/href.directive';
import { VenuesComponent } from './routes/venues/venues.component';
import { AppComponent } from './app.component';
import { BaseComponentsModule } from './modules/base-module/base-components.module';
import { TetherDialogModule } from './modules/common-module/modules/tether-dialog/tether-dialog.module';
import { CmsComponentsModule } from './modules/cms-module/cms-components.module';
import { BackstageComponentsModule } from './modules/backstage-module/backstage-components.module';
import { CommonComponentsModule } from './modules/common-module/common-components.module';
import { PipesModule } from './modules/pipes.module';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';
import { LoginRoutingModule } from './login-routing.module';
import { LocalStorageModule } from 'angular-2-local-storage';
import { MainComponent } from './routes/main/main.component';
import { PerformersComponent } from './routes/performers/performers.component';
import { EventsComponent } from './routes/events/events.component';
import { VenueComponent } from './routes/venue/venue.component';
import { VenueEventsComponent } from './routes/venue/venue-events/venue-events.component';
import { VenueLayoutsComponent } from './routes/venue/venue-layouts/venue-layouts.component';
import { EventComponent } from './routes/event/event.component';
import { MockService } from './services/mock.service';
import { EventProductsComponent } from './routes/event/event-products/event-products.component';
import { EventStatisticsComponent } from './routes/event/event-statistics/event-statistics.component';
import { EventSponsorsComponent } from './routes/event/event-sponsors/event-sponsors.component';
import { ProductsComponent } from './routes/products/products.component';
import { StoreService } from './services/store.service';
import { PerformancesComponent } from './routes/performances/performances.component';

import { PerformancePerformersComponent } from './routes/performance/performance-performers/performance-performers.component';
import { PerformanceProductsComponent } from './routes/performance/performance-products/performance-products.component';
import { PerformanceProductStatisticsComponent } from './routes/performance/performance-product-statistics/performance-product-statistics.component';
import { PerformanceSponsorsComponent } from './routes/performance/performance-sponsors/performance-sponsors.component';
import { ProductsPerformancesComponent } from './routes/products/products-performances/products-performances.component';
import { BoxofficeComponent } from './routes/boxoffice/boxoffice.component';
import { BoxofficeProductsComponent } from './routes/boxoffice/boxoffice-products/boxoffice-products.component';
import { BoxofficeEventsComponent } from './routes/boxoffice/boxoffice-events/boxoffice-events.component';
import { EventsMasterComponent } from './routes/events/events-master/events-master.component';
import { EventsMultiplePerformanceComponent } from './routes/events/events-multiple-performance/events-multiple-performance.component';
import { EventsSinglePerformanceComponent } from './routes/events/events-single-performance/events-single-performance.component';
import { LoginComponent } from './routes/login/login.component';
import { PasswordRecoveryComponent } from './routes/login/password-recovery/password-recovery.component';
import { LockComponent } from './routes/login/lock/lock.component';
import { PerformersIndexComponent } from './routes/performers/performers-index/performers-index.component';
import { EventsIndexComponent } from './routes/events/events-index/events-index.component';
import { PerformancesIndexComponent } from './routes/performances/performances-index/performances-index.component';
import { ListItemDirective } from './directives/list-item.directive';
import { PerformanceCreateComponent } from './routes/performance-create/performance-create.component';
import { EventEditComponent } from './routes/event/event-edit/event-edit.component';
import { BoxofficeContentsComponent } from './routes/boxoffice/boxoffice-contents/boxoffice-contents.component';
import { TranslateService } from './services/translate.service';
import { VenueTemplateCreateComponent } from './routes/venue/venue-template-create/venue-template-create.component';
import { NotificationService } from './services/notification.service';
import { BoxofficePurchaseComponent } from './routes/boxoffice/boxoffice-purchase/boxoffice-purchase.component';
import { BoxofficeBasketComponent } from './routes/boxoffice/boxoffice-basket/boxoffice-basket.component';
import { ShoppingCartService } from './services/shopping-cart.service';
import { ProductCreateComponent } from './routes/product/product-create/product-create.component';
import { EventEventsComponent } from './routes/event/event-events/event-events.component';
import { PerformanceReservationsComponent } from './routes/performance/performance-reservations/performance-reservations.component';
import { PerformanceInvitationsComponent } from './routes/performance/performance-invitations/performance-invitations.component';
import { BoxofficePosStatusComponent } from './routes/boxoffice/boxoffice-pos-status/boxoffice-pos-status.component';
import { PerformanceCancelBlockComponent } from './routes/performance/performance-cancel-block/performance-cancel-block.component';
import { PerformanceGroupSaleComponent } from './routes/performance/performance-group-sale/performance-group-sale.component';
import { TransactionsComponent } from './routes/transactions/transactions.component';
import { BoxofficeEventsSubeventsComponent } from './routes/boxoffice/boxoffice-events-subevents/boxoffice-events-subevents.component';
import { MenuItemService } from './services/menu-item.service';
import { BoxofficeSelectSeatComponent } from './routes/boxoffice/boxoffice-select-seat/boxoffice-select-seat.component';
import { CmsComponent } from './routes/cms/cms.component';
import { EventReportsComponent } from './routes/event/event-reports/event-reports.component';
import { EventTicketStatisticComponent } from './routes/event/event-ticket-statistic/event-ticket-statistic.component';
import { EventVisitDataComponent } from './routes/event/event-visit-data/event-visit-data.component';
import { PerformanceReportsComponent } from './routes/performance/performance-reports/performance-reports.component';
import { PerformanceReportsVisitDataComponent } from './routes/performance/performance-reports/performance-reports-visit-data/performance-reports-visit-data.component';
import { PerformanceReportsTicketStatisticsComponent } from './routes/performance/performance-reports/performance-reports-ticket-statistics/performance-reports-ticket-statistics.component';
import { CmsContentCreateComponent } from './routes/cms/cms-content/cms-content-create/cms-content-create.component';
import { PerformanceRelocationComponent } from './routes/performance/performance-relocation/performance-relocation.component';

import { QRCodeModule } from 'angular2-qrcode';

import { CmsContentsComponent } from './routes/cms/cms-contents/cms-contents.component';
import { CmsComponentContainersComponent } from './routes/cms/cms-component-containers/cms-component-containers.component';
import { CmsComponentContainerCreateComponent } from './routes/cms/cms-component-container/cms-component-container-create/cms-component-container-create.component';
import { BulkSmsComponent } from './routes/bulk-sms/bulk-sms.component';
import { CmsContentTypeCreateComponent } from './routes/cms/cms-content-type/cms-content-type-create/cms-content-type-create.component';
import { CmsContentTypesComponent } from './routes/cms/cms-content-types/cms-content-types.component';

import { SalesChannelsComponent } from './routes/sales-channels/sales-channels.component';
import { SalesSubChannelTerminalComponent } from './routes/sales-channels/sales-sub-channel-terminal/sales-sub-channel-terminal.component';

import { TerminalsComponent } from './routes/terminals/terminals.component';
import { TerminalComponent } from './routes/terminal/terminal.component';
import { TerminalEditComponent } from './routes/terminal/terminal-edit/terminal-edit.component';
import { TerminalUsersComponent } from './routes/terminal/terminal-users/terminal-users.component';
import { CmsDatasourcesComponent } from './routes/cms/cms-datasources/cms-datasources.component';
import { CmsDatasourceCreateComponent } from './routes/cms/cms-datasource/cms-datasource-create/cms-datasource-create.component';
import { CmsLovsComponent } from './routes/cms/cms-lovs/cms-lovs.component';
import { CmsLovCreateComponent } from './routes/cms/cms-lov/cms-lov-create/cms-lov-create.component';
import { FirmsComponent } from './routes/firms/firms.component';
import { BoxofficeCollectDataComponent } from './routes/boxoffice/boxoffice-collect-data/boxoffice-collect-data.component';

import { RefreshStateService } from './services/refresh-state/refresh-state.service';
import { FirmsIndexComponent } from './routes/firms/firms-index/firms-index.component';
import { OtpValidationGuard } from './services/otp-validation-guard.service';
import { FirmsEditComponent } from './routes/firms/firms-edit/firms-edit.component';
import { MembersComponent } from './routes/members/members.component';
import { MemberComponent } from './routes/member/member.component';
import { MemberEditComponent } from './routes/member/member-edit/member-edit.component';
import { TransactionViewComponent } from './routes/transaction-view/transaction-view.component';
import { PerformanceGroupRefundComponent } from './routes/performance/performance-group-refund/performance-group-refund.component';
import { UsersComponent } from './routes/users/users.component';
import { UserListComponent } from './routes/users/user-list/user-list.component';
import { UserEditComponent } from './routes/users/user-edit/user-edit.component';
import { AuthRolePipe } from './pipes/auth-role.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    EventsComponent,
    VenueComponent,
    VenuesComponent,
    EventsComponent,
    PerformersComponent,
    EventsComponent,
    VenueComponent,
    VenueEventsComponent,
    VenueLayoutsComponent,
    EventComponent,
    HrefDirective,
    IndexComponent,
    EventPerformancesComponent,
    EventProductsComponent,
    EventStatisticsComponent,
    EventSponsorsComponent,
    EventReportsComponent,
    EventSponsorsComponent,
    EventReportsComponent,
    EventTicketStatisticComponent,
    EventVisitDataComponent,

    ProductsComponent,
    PerformancesComponent,
    PerformanceComponent,
    PerformancePerformersComponent,
    PerformanceProductsComponent,
    PerformanceProductStatisticsComponent,
    PerformanceSponsorsComponent,
    ProductsBundlesComponent,
    ProductsPerformancesComponent,
    BoxofficeComponent,
    BoxofficeProductsComponent,
    EventsMasterComponent,
    EventsMultiplePerformanceComponent,
    EventsSinglePerformanceComponent,
    BoxofficeComponent,
    BoxofficeProductsComponent,
    LoginComponent,
    PasswordRecoveryComponent,
    LockComponent,
    PerformersIndexComponent,
    BoxofficeEventsComponent,
    EventsIndexComponent,
    PerformancesIndexComponent,
    ListItemDirective,
    PerformanceCreateComponent,
    VenueEditComponent,
    EventEditComponent,
    BoxofficeContentsComponent,
    VenueTemplateCreateComponent,
    BoxofficePurchaseComponent,
    BoxofficeBasketComponent,
    ProductCreateComponent,
    EventEventsComponent,
    PerformanceReservationsComponent,
    PerformanceInvitationsComponent,
    BoxofficePosStatusComponent,
    PerformanceCancelBlockComponent,
    PerformanceGroupSaleComponent,
    TransactionsComponent,
    BoxofficeEventsSubeventsComponent,
    BoxofficeSelectSeatComponent,
    CmsComponent,
    EventTicketStatisticComponent,
    EventTicketStatisticComponent,
    PerformanceReportsComponent,
    PerformanceReportsVisitDataComponent,
    PerformanceReportsTicketStatisticsComponent,
    CmsContentCreateComponent,
    PerformanceRelocationComponent,
    CmsContentsComponent,
    CmsComponentContainersComponent,
    CmsComponentContainerCreateComponent,
    BulkSmsComponent,   
    CmsContentTypeCreateComponent,
    CmsContentTypesComponent,
    SalesChannelsComponent,
    SalesSubChannelTerminalComponent,
    TerminalsComponent,
    TerminalComponent,
    TerminalEditComponent,
    TerminalUsersComponent,
    CmsDatasourcesComponent,
    CmsDatasourceCreateComponent,
    CmsLovsComponent,
    CmsLovCreateComponent,
    FirmsComponent,
    BoxofficeCollectDataComponent,
    FirmsIndexComponent,
    FirmsEditComponent,
    MembersComponent,
    MemberComponent,
    MemberEditComponent,
    TransactionViewComponent,
    PerformanceGroupRefundComponent,
    UsersComponent,
    UserListComponent,
    UserEditComponent,
    AuthRolePipe,
 ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    LoginRoutingModule,
    PipesModule,
    TetherDialogModule.forRoot(),
    BaseComponentsModule,
    CommonComponentsModule,
    BackstageComponentsModule,
    BoxofficeComponentsModule,
    CmsComponentsModule,
    QRCodeModule,
    LocalStorageModule.withConfig({
      prefix: 'nirvana',
      storageType: 'localStorage'
    })
  ],
  providers: [
    HeaderTitleService,
    MockService,
    StoreService,
    AppSettingsService,
    TranslateService,
    NotificationService,
    ShoppingCartService,
    MenuItemService,
    OtpValidationGuard,
    MainLoaderService,
    PrintDataService,
    BoxofficeService,
    RefreshStateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
