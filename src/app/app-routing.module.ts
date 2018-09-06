import { MembersComponent } from './routes/members/members.component';
import { FirmsEditComponent } from './routes/firms/firms-edit/firms-edit.component';


import { CmsLovCreateComponent } from './routes/cms/cms-lov/cms-lov-create/cms-lov-create.component';
import { CmsLovsComponent } from './routes/cms/cms-lovs/cms-lovs.component';
import { CmsDatasourceCreateComponent } from './routes/cms/cms-datasource/cms-datasource-create/cms-datasource-create.component';
import { CmsDatasourcesComponent } from './routes/cms/cms-datasources/cms-datasources.component';
import { CmsContentTypeCreateComponent } from './routes/cms/cms-content-type/cms-content-type-create/cms-content-type-create.component';
import { CmsContentTypesComponent } from './routes/cms/cms-content-types/cms-content-types.component';
import { CmsComponentContainerCreateComponent } from './routes/cms/cms-component-container/cms-component-container-create/cms-component-container-create.component';
import { CmsComponentContainersComponent } from './routes/cms/cms-component-containers/cms-component-containers.component';
import { PerformanceRelocationComponent } from './routes/performance/performance-relocation/performance-relocation.component';
import { CmsContentsComponent } from './routes/cms/cms-contents/cms-contents.component';
import { CmsContentCreateComponent } from './routes/cms/cms-content/cms-content-create/cms-content-create.component';
import { CmsComponent } from './routes/cms/cms.component';
import { PerformanceGroupSaleComponent } from './routes/performance/performance-group-sale/performance-group-sale.component';
import { PerformanceCancelBlockComponent } from './routes/performance/performance-cancel-block/performance-cancel-block.component';
import { ProductCreateComponent } from './routes/product/product-create/product-create.component';
import { NgModule } from '@angular/core';
import { HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';
import { OtpValidationGuard } from './services/otp-validation-guard.service';
import { AuthenticationService } from './services/authentication.service';

import { AppComponent } from './app.component';
import { MainComponent } from './routes/main/main.component';
import { IndexComponent } from './routes/index/index.component';
import { LoginComponent } from './routes/login/login.component';
import { PasswordRecoveryComponent } from './routes/login/password-recovery/password-recovery.component';
import { LockComponent } from './routes/login/lock/lock.component';
import { EventsComponent } from './routes/events/events.component';
import { EventComponent } from './routes/event/event.component';
import { EventPerformancesComponent } from './routes/event/event-performances/event-performances.component';
import { EventEventsComponent } from './routes/event/event-events/event-events.component';
import { EventProductsComponent } from './routes/event/event-products/event-products.component';
import { EventSponsorsComponent } from './routes/event/event-sponsors/event-sponsors.component';
import { EventTicketStatisticComponent } from './routes/event/event-ticket-statistic/event-ticket-statistic.component';
import { EventVisitDataComponent } from './routes/event/event-visit-data/event-visit-data.component';

import { BulkSmsComponent } from './routes/bulk-sms/bulk-sms.component';

import { EventEditComponent } from './routes/event/event-edit/event-edit.component';

import { VenuesComponent } from './routes/venues/venues.component';
import { VenueComponent } from './routes/venue/venue.component';

import { VenueEditComponent } from './routes/venue/venue-edit/venue-edit.component';
import { VenueEventsComponent } from './routes/venue/venue-events/venue-events.component';

import { VenueLayoutsComponent } from './routes/venue/venue-layouts/venue-layouts.component';

import { PerformersComponent } from './routes/performers/performers.component';

import { ProductsComponent } from './routes/products/products.component';

import { SalesChannelsComponent } from './routes/sales-channels/sales-channels.component';
import { SalesSubChannelTerminalComponent } from './routes/sales-channels/sales-sub-channel-terminal/sales-sub-channel-terminal.component';

import { PerformanceComponent } from './routes/performance/performance.component';
import { PerformanceCreateComponent } from './routes/performance-create/performance-create.component';
import { PerformancePerformersComponent } from './routes/performance/performance-performers/performance-performers.component';
import { PerformanceProductsComponent } from './routes/performance/performance-products/performance-products.component';
import { PerformanceProductStatisticsComponent } from './routes/performance/performance-product-statistics/performance-product-statistics.component';
import { PerformanceSponsorsComponent } from './routes/performance/performance-sponsors/performance-sponsors.component';
import { PerformanceReservationsComponent } from './routes/performance/performance-reservations/performance-reservations.component';
import { PerformanceInvitationsComponent } from './routes/performance/performance-invitations/performance-invitations.component';
import { PerformanceReportsComponent } from './routes/performance/performance-reports/performance-reports.component';
import { PerformanceReportsTicketStatisticsComponent } from './routes/performance/performance-reports/performance-reports-ticket-statistics/performance-reports-ticket-statistics.component';
import { PerformanceReportsVisitDataComponent } from './routes/performance/performance-reports/performance-reports-visit-data/performance-reports-visit-data.component';

import { ProductsBundlesComponent } from './routes/products/products-bundles/products-bundles.component';
import { ProductsPerformancesComponent } from './routes/products/products-performances/products-performances.component';

import { BoxofficeComponent } from './routes/boxoffice/boxoffice.component';
import { BoxofficeProductsComponent } from './routes/boxoffice/boxoffice-products/boxoffice-products.component';
import { BoxofficeEventsComponent } from './routes/boxoffice/boxoffice-events/boxoffice-events.component';
import { BoxofficeContentsComponent } from './routes/boxoffice/boxoffice-contents/boxoffice-contents.component';
import { BoxofficePurchaseComponent } from './routes/boxoffice/boxoffice-purchase/boxoffice-purchase.component';
import { BoxofficeBasketComponent } from './routes/boxoffice/boxoffice-basket/boxoffice-basket.component';
import { BoxofficePosStatusComponent } from './routes/boxoffice/boxoffice-pos-status/boxoffice-pos-status.component';
import { BoxofficeEventsSubeventsComponent } from './routes/boxoffice/boxoffice-events-subevents/boxoffice-events-subevents.component';
import { BoxofficeCollectDataComponent } from './routes/boxoffice/boxoffice-collect-data/boxoffice-collect-data.component';

import { TransactionsComponent } from './routes/transactions/transactions.component';

import { TerminalsComponent } from './routes/terminals/terminals.component';
import { TerminalComponent } from './routes/terminal/terminal.component';
import { TerminalEditComponent } from './routes/terminal/terminal-edit/terminal-edit.component';
import { TerminalUsersComponent } from './routes/terminal/terminal-users/terminal-users.component';

import { EventsMultiplePerformanceComponent } from './routes/events/events-multiple-performance/events-multiple-performance.component';
import { EventsSinglePerformanceComponent } from './routes/events/events-single-performance/events-single-performance.component';
import { EventsMasterComponent } from './routes/events/events-master/events-master.component';

import { PerformancesComponent } from './routes/performances/performances.component';
import { PerformersIndexComponent } from './routes/performers/performers-index/performers-index.component';
import { EventsIndexComponent } from './routes/events/events-index/events-index.component';
import { PerformancesIndexComponent } from './routes/performances/performances-index/performances-index.component';

import { VenueTemplateCreateComponent } from './routes/venue/venue-template-create/venue-template-create.component';
import { BoxofficeSelectSeatComponent } from './routes/boxoffice/boxoffice-select-seat/boxoffice-select-seat.component';
import { EventReportsComponent } from './routes/event/event-reports/event-reports.component';
import { FirmsComponent } from './routes/firms/firms.component';
import { FirmsIndexComponent } from './routes/firms/firms-index/firms-index.component';
import { MemberComponent } from './routes/member/member.component';
import { MemberEditComponent } from './routes/member/member-edit/member-edit.component';
import { TransactionViewComponent } from './routes/transaction-view/transaction-view.component';
import { PerformanceGroupRefundComponent } from './routes/performance/performance-group-refund/performance-group-refund.component';
import { UsersComponent } from './routes/users/users.component';
import { Roles } from './models/roles';
const appRoutes: Routes = [
    {
        path: '',
        component: MainComponent,
        canActivate: [AuthGuardService],
        canActivateChild: [AuthGuardService],

        children: [
            // Box Office
            {   path: 'boxoffice',
                component: BoxofficeComponent,
                data: { userRoles: [Roles.ROLE_BOX_OFFICE] },
                children: [
                    {   path: 'events',
                        component: BoxofficeEventsComponent
                    },
                    {   path: 'events/:mainEventId/events',
                        component: BoxofficeEventsSubeventsComponent,
                        data: { type: 'main-events', }
                    },
                    {   path: ':id/products',
                        component: BoxofficeProductsComponent,
                    },
                    {   path: '',
                        redirectTo: 'events',
                        pathMatch: 'full',
                    },
                    {   path: 'contents',
                        component: BoxofficeContentsComponent,
                    },
                    {   path: 'select-seat',
                        component: BoxofficeSelectSeatComponent,
                    },
                ]
            },
            {   path: 'boxoffice/purchase',
                component: BoxofficePurchaseComponent,
                data: { userRoles: [Roles.ROLE_BOX_OFFICE] }
            },
            {   path: 'boxoffice/basket',
                component: BoxofficeBasketComponent,
                data: { userRoles: [Roles.ROLE_BOX_OFFICE] }
            },
            {   path: 'boxoffice/pos-status',
                component: BoxofficePosStatusComponent,
                data: { userRoles: [Roles.ROLE_BOX_OFFICE] }
            },
            {   path: 'boxoffice/collect-data',
                component: BoxofficeCollectDataComponent,
                data: { userRoles: [Roles.ROLE_BOX_OFFICE] }
            },
            // Events
            {   path: 'events',
                component: EventsIndexComponent,
                data: { userRoles: [Roles.EVENT_LIST] }
            },
            {   path: 'event-groups',
                component: EventsMasterComponent,
                data: { userRoles: [Roles.EVENT_GROUP_LIST] }
            },
            {   path: 'event/create',
                component: EventEditComponent,
                data: { role: 'create', isMainEvent: false, userRoles: [Roles.EVENT_CREATE] },
            },
            {   path: 'event-group/create',
                component: EventEditComponent,
                data: { role: 'create', isMainEvent: true, userRoles: [Roles.EVENT_GROUP_CREATE] }
            },
            {   path: 'event/:id/edit',
                component: EventEditComponent,
                data: { role: 'edit', isMainEvent: false, userRoles: [Roles.EVENT_CREATE] }
            },
            {   path: 'event-group/:id/edit',
                component: EventEditComponent,
                data: { role: 'edit', isMainEvent: true, userRoles: [Roles.EVENT_GROUP_CREATE] }
            },
            {   path: 'event/:id',
                component: EventComponent,
                children: [
                    {   path: 'performances',
                        component: EventPerformancesComponent,
                        data: { userRoles: [Roles.EVENT_PERFORMANCES] }
                    },
                    {   path: 'events',
                        component: EventEventsComponent,
                        data: { userRoles: [Roles.EVENT_GROUP_EVENTS] }
                    },
                    // To Be Deleted
                    {   path: 'products',
                        component: EventProductsComponent,
                        data: {
                            userRoles: [AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN, AuthenticationService.ROLE_PROMOTER]
                        }
                    },
                    {   path: 'reports',
                        component: EventReportsComponent,
                        data: { userRoles: [Roles.EVENT_DASHBOARD, Roles.EVENT_GROUP_DASHBOARD] },
                        children: [
                            {   path: 'statistics',
                                component: EventTicketStatisticComponent,
                            },
                            {   path: 'visitdata',
                                component: EventVisitDataComponent,
                            },
                            {   path: '',
                                redirectTo: 'statistics',
                                pathMatch: 'full',
                            },
                        ],
                    },
                ]
            },

            // Venues
            {   path: 'venues',
                component: VenuesComponent,
                data: { userRoles: [Roles.VENUE_LIST] }
            },
            {   path: 'venue/create',
                component: VenueEditComponent,
                data: { role: 'create', userRoles: [Roles.VENUE_LIST] }
            },
            {   path: 'venue/:id/edit',
                component: VenueEditComponent,
                data: { role: 'edit', userRoles: [Roles.VENUE_LIST] }
            },
            {   path: 'venue/:id',
                component: VenueComponent,
                data: { userRoles: [Roles.VENUE_LIST] },
                children: [
                    {   path: 'events',
                        component: VenueEventsComponent,
                    },
                    {   path: 'halls',
                        loadChildren: './modules/halls-module/halls.module#HallsModule',
                        data: {userRoles: [Roles.VENUE_LIST]}
                    },
                    {   path: 'layouts',
                        component: VenueLayoutsComponent,
                    },
                    {   path: '',
                        redirectTo: 'events',
                        pathMatch: 'full',
                    },
                ]
            },
            {   path: 'venue/:id/template/create',
                component: VenueTemplateCreateComponent,
                data: { role: 'create', userRoles: [Roles.VENUE_LIST] }
            },

            // Products
            // To Be Deletec
            {   path: 'products',
                component: ProductsComponent,
                data: {
                    userRoles: [AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN, AuthenticationService.ROLE_PROMOTER]
                },
                children: [
                    {   path: 'performances',
                        component: ProductsPerformancesComponent,
                        data: {
                            userRoles: [AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN]
                        }
                    },
                    {   path: 'bundles',
                        component: ProductsBundlesComponent,
                        data: {
                            userRoles: [AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN]
                        }
                    },
                    {   path: '',
                        redirectTo: 'performances',
                        pathMatch: 'full',
                        data: {
                            userRoles: [AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN]
                        }
                    },
                ]
            },
            // To Be Deleted
            {   path: 'product/create',
                component: ProductCreateComponent,
                data: {
                    role: 'create',
                    userRoles: [AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN]
                }
            },
            {   path: 'product/:id/edit',
                component: ProductCreateComponent,
                data: { role: 'edit', userRoles: [Roles.PERFORMANCE_TICKETS] }
            },

            // Performances
            // To Be Deleted
            {   path: 'performances',
                component: PerformancesComponent,
                data: {
                    userRoles: [AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN, AuthenticationService.ROLE_PROMOTER]
                },
                children: [
                    {   path: '',
                        component: PerformancesIndexComponent,
                    },
                ]
            },
            // To Be Deleted
            {   path: 'performance/create',
                component: PerformanceCreateComponent,
                data: {
                    role: 'create',
                    userRoles: [AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN]
                }
            },
            {   path: 'performance/:id/edit',
                component: PerformanceCreateComponent,
                data: { role: 'edit', userRoles: [Roles.EVENT_PERFORMANCES] }
            },
            {   path: 'performance/:id', component: PerformanceComponent,
                children: [
                    // To Be Deleted
                    {   path: 'performers',
                        component: PerformancePerformersComponent,
                        data: {
                            userRoles: [AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN, AuthenticationService.ROLE_PROMOTER]
                        }
                    },
                    {   path: 'products',
                        component: PerformanceProductsComponent,
                        data: { userRoles: [Roles.PERFORMANCE_TICKETS] }
                    },
                    {   path: 'reservations',
                        loadChildren: './modules/reservation-module/reservation.module#ReservationModule',
                        data: { userRoles: [Roles.PERFORMANCE_RESERVATIONS] }
                    },
                    {   path: 'invitations',
                        loadChildren: './modules/reservation-module/invitation.module#InvitationModule',
                        data: { userRoles: [Roles.PERFORMANCE_COMP] }
                    },
                    {   path: 'pool-invitations',
                        loadChildren: './modules/reservation-module/pool-invitation.module#PoolInvitationModule',
                        data: { userRoles: [Roles.PERFORMANCE_POOL_COMP] }
                    },
                    {   path: 'group-sale',
                        loadChildren: './modules/group-sale-module/group-sale.module#GroupSaleModule',
                        data: { userRoles: [Roles.PERFORMANCE_GROUP_SALES] }
                    },
                    {   path: 'group-refund',
                        component: PerformanceGroupRefundComponent,
                        data: { userRoles: [Roles.PERFORMANCE_BULK_REFUND] }
                    },
                    {   path: 'relocation',
                        component: PerformanceRelocationComponent,
                        data: { userRoles: [Roles.PERFORMANCE_RELOCATION] }
                    },
                    {   path: 'cancel-block',
                        component: PerformanceCancelBlockComponent,
                        data: { userRoles: [Roles.PERFORMANCE_SEATS] }
                    },
                    // {   path: '',
                    //     redirectTo: 'products',
                    //     pathMatch: 'full',
                    // },
                    {   path: 'reports',
                        component: PerformanceReportsComponent,
                        data: {  userRoles: [Roles.PERFORMANCE_DASHBOARD] },
                        children: [
                            {   path: 'statistics',
                                component: PerformanceReportsTicketStatisticsComponent
                            },
                            {   path: 'visitdata',
                                component: PerformanceReportsVisitDataComponent
                            },
                            {   path: '',
                                redirectTo: 'statistics',
                                pathMatch: 'full'
                            }
                        ]
                    },
                ]
            },
            {   path: 'multiple-performance',
                loadChildren: './modules/multiple-performance/multiple-performance.module#MultiplePerformanceModule',
                data: { userRoles: [Roles.EVENT_PERFORMANCES_CREATE] }
            },

            // Performers
            {   path: 'performers',
                component: PerformersComponent,
                data: { userRoles: [Roles.ENTITY_LIST] },
                children: [
                    {   path: '',
                        component: PerformersIndexComponent,
                    },
                ]
            },

            // CMS
            {   path: 'cms',
                component: CmsComponent,
                children: [
                    {   path: 'contents',
                        component: CmsContentsComponent,
                        data: { userRoles: [Roles.CONTENT_LIST] }
                    },
                    {   path: 'contents/:id',
                        component: CmsContentsComponent,
                        data: { userRoles: [Roles.CONTENT_LIST] }
                    },
                    {   path: 'content/create',
                        component: CmsContentCreateComponent,
                        data: { role: 'create', userRoles: [Roles.CONTENT_LIST] }
                    },
                    {   path: 'content/:id/edit',
                        component: CmsContentCreateComponent,
                        data: { role: 'edit', userRoles: [Roles.CONTENT_LIST] }
                    },
                    {   path: 'component-containers',
                        component: CmsComponentContainersComponent,
                        data: { userRoles: [Roles.COMPONENT_CONTAINER_LIST] }
                    },
                    {   path: 'component-container/create',
                        component: CmsComponentContainerCreateComponent,
                        data: { role: 'create', userRoles: [Roles.COMPONENT_CONTAINER_LIST] }
                    },
                    {   path: 'component-container/:id/edit',
                        component: CmsComponentContainerCreateComponent,
                        data: { role: 'edit', userRoles: [Roles.COMPONENT_CONTAINER_LIST] }
                    },
                    {   path: 'content-types',
                        component: CmsContentTypesComponent,
                        data: { userRoles: [Roles.CONTENT_TYPE_LIST] }
                    },
                    {   path: 'content-type/create',
                        component: CmsContentTypeCreateComponent,
                        data: { role: 'create',  userRoles: [Roles.CONTENT_TYPE_LIST] }
                    },
                    {   path: 'content-type/:id/edit',
                        component: CmsContentTypeCreateComponent,
                        data: { role: 'edit', userRoles: [Roles.CONTENT_TYPE_LIST] }
                    },
                    {   path: 'datasources',
                        component: CmsDatasourcesComponent,
                    },
                    {   path: 'datasource/create',
                        component: CmsDatasourceCreateComponent,
                        data: { role: 'create' }
                    },
                    {   path: 'datasource/:id/edit',
                        component: CmsDatasourceCreateComponent,
                        data: { role: 'edit' }
                    },
                    {   path: 'lovs',
                        component: CmsLovsComponent,
                        data: { userRoles: [Roles.LOV_LIST] }
                    },
                    {   path: 'lov/create',
                        component: CmsLovCreateComponent,
                        data: { role: 'create', userRoles: [Roles.LOV_LIST] }
                    },
                    {   path: 'lov/:id/edit',
                        component: CmsLovCreateComponent,
                        data: { role: 'edit', userRoles: [Roles.LOV_LIST] }
                    },
            ]},

            // Terminals
            {   path: 'terminals',
                component: TerminalsComponent,
                data: { userRoles: [Roles.TERMINAL_LIST] }
            },
            {   path: 'terminal/create',
                component: TerminalEditComponent,
                data: { role: 'create', userRoles: [Roles.TERMINAL_LIST] }
            },
            {   path: 'terminal/:id/edit',
                component: TerminalEditComponent,
                data: { role: 'edit', userRoles: [Roles.TERMINAL_LIST] }
            },
            {   path: 'terminal',
                component: TerminalComponent,
                data: { userRoles: [Roles.TERMINAL_LIST] },
                children: [
                    {
                        path: ':id/users',
                        component: TerminalUsersComponent,
                        data: { role: 'edit' }
                    },
                ]
            },

            // Bulk SMS
            {   path: 'bulk-sms',
                component: BulkSmsComponent
            },

            // Sales Channels
            {   path: 'sales-channels',
                component: SalesChannelsComponent,
                data: { userRoles: [Roles.SALES_CHANNELS_LIST] },
            },
            {   path: 'sales-channels/sub-channel/:id/terminals',
                component: SalesSubChannelTerminalComponent,
                data: { userRoles: [Roles.SALES_CHANNELS_LIST] },
            },

            // Users
            {   path: 'users',
                component: UsersComponent,
                data: { userRoles: [Roles.USER_LIST] }
            },

            // Firms
            {   path: 'firms',
                component: FirmsComponent,
                data: { userRoles: [Roles.FIRM_LIST] },
                children: [
                    {
                        path: '',
                        component: FirmsIndexComponent
                    }
                ]
            },
            {   path: 'firm/create',
                component: FirmsEditComponent,
                data: { role: 'create', userRoles: [Roles.FIRM_LIST] }
            },
            {   path: 'firm/:id/edit',
                component: FirmsEditComponent,
                data: { role: 'edit', userRoles: [Roles.FIRM_LIST] }
            },

            // Customers
            {   path: 'members',
                component: MembersComponent,
                data: { userRoles: [Roles.CUSTOMER_LIST] }
            },
            {   path: 'member/:id',
                component: MemberComponent,
                data: { userRoles: [Roles.CUSTOMER_LIST] }
            },
            {   path: 'member/:id/edit',
                component: MemberEditComponent,
                data: { userRoles: [Roles.CUSTOMER_LIST]}, canActivate: [OtpValidationGuard] },
            {   path: '',
                component: IndexComponent
            },

            // Transactions
            {   path: 'transactions',
                component: TransactionsComponent,
                data: { userRoles: [Roles.TRANSACTION_LIST] }
            },
            {   path: 'transaction/:id',
                component: TransactionViewComponent,
                data: { userRoles: [Roles.TRANSACTION_LIST] }
            },

            // Roles
            {   path: 'role',
                loadChildren: './modules/role-module/role.module#RoleModule',
                data: { userRoles: [Roles.ROLE_GROUP_LIST] }
            }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [
        RouterModule
    ],
    providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule { }
