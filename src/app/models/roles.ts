export class Roles {
    static readonly ROLE_SUPER_ADMIN                        =   'SuperAdmin';
    static readonly ROLE_FIRM_ADMIN                         =   'FirmAdmin';
    static readonly ROLE_PROMOTER                           =   'Promoter';
    // Obsolete ?
    static readonly ROLE_CALL_CENTER                        =   'CallCenter';
    static readonly ROLE_CMS                                =   'CMS';
    // New Roles -- from 2018/05/07
    // Box Office
    static readonly ROLE_BOX_OFFICE                         =   'BoxOffice';
    // Customers
    static readonly CUSTOMER_LIST                           =   'Customer_List';
    // Transactions
    static readonly TRANSACTION_LIST                        =   'Transaction_List';
    static readonly TRANSACTION_BASKET_CONFIRMATION_EMAIL   =   'Transaction_Basket_ConfirmationEmail';
    static readonly TRANSACTION_BASKET_INVOICE_EMAIL        =   'Transaction_Basket_InvoiceEmail';
    static readonly TRANSACTION_BASKET_WALLET_SMS           =   'Transaction_Basket_WalletSMS';
    static readonly TRANSACTION_BASKET_TICKET               =   'Transaction_Basket_Ticket';
    static readonly TRANSACTION_BASKET_INVOICE              =   'Transaction_Basket_Invoice';
    static readonly TRANSACTION_BASKET_REFUND               =   'Transaction_Basket_Refund';
    static readonly TRANSACTION_BASKET_CONFIRMATION_SMS     =   'Transaction_Basket_ConfirmationSMS';
    static readonly TRANSACTION_BASKET_PRINT_TICKET         =   'Transaction_Basket_PrintTicket';
    static readonly TRANSACTION_BULK_TICKET_EMAIL           =   'Transaction_Bulk_TicketEmail';
    static readonly TRANSACTION_BULK_TICKET                 =   'Transaction_Bulk_Ticket';
    static readonly TRANSACTION_BULK_INVOICE                =   'Transaction_Bulk_Invoice';
    static readonly TRANSACTION_BULK_REFUND                 =   'Transaction_Bulk_Refund';
    static readonly TRANSACTION_BULK_PRINT_TICKET           =   'Transaction_Bulk_PrintTicket';
    static readonly TRANSACTION_ITEM_TICKET_EMAIL           =   'Transaction_Item_TicketEmail';
    static readonly TRANSACTION_ITEM_TICKET                 =   'Transaction_Item_Ticket';
    static readonly TRANSACTION_ITEM_INVOICE                =   'Transaction_Item_Invoice';
    static readonly TRANSACTION_ITEM_REFUND                 =   'Transaction_Item_Refund';
    static readonly TRANSACTION_ITEM_QR_HISTORY             =   'Transaction_Item_QRHistory';
    static readonly TRANSACTION_ITEM_REGENERATE_QR          =   'Transaction_Item_RegenerateQR';
    static readonly TRANSACTION_ITEM_PRINT_TICKET           =   'Transaction_Item_PrintTicket';
    static readonly TRANSACTION_ITEM_GET_TICKET_BACK        =   'Transaction_Item_GetTicketBack';
    // Events
    static readonly EVENT_GROUP_LIST                        =   'EventGroup_List';
    static readonly EVENT_GROUP_EVENTS                      =   'EventGroup_Events';
    static readonly EVENT_GROUP_DASHBOARD                   =   'EventGroup_Dashboard';
    static readonly EVENT_GROUP_CREATE                      =   'EventGroup_Create';
    static readonly EVENT_LIST                              =   'Event_List';
    static readonly EVENT_CREATE                            =   'Event_Create';
    static readonly EVENT_DASHBOARD                         =   'Event_Dashboard';
    static readonly EVENT_PERFORMANCES                      =   'Event_Performances';
    static readonly EVENT_PERFORMANCES_CREATE               =   'Event_Performances_Create';
    // Venues
    static readonly VENUE_LIST                              =   'Venue_List';
    // Artists
    static readonly ENTITY_LIST                             =   'Entity_List';
    // Users
    static readonly USER_LIST                               =   'User_List';
    // Role Groups
    static readonly ROLE_GROUP_LIST                         =   'RoleGroup_List';
    // Sales Channels
    static readonly SALES_CHANNELS_LIST                     =   'SalesChannel_list';
    static readonly TERMINAL_LIST                           =   'Terminal_List';
    // Firms
    static readonly FIRM_LIST                               =   'Firm_List';
    // CMS
    static readonly CONTENT_LIST                            =   'Content_List';
    static readonly LOV_LIST                                =   'LOV_List';
    static readonly CONTENT_TYPE_LIST                       =   'ContentType_List';
    static readonly COMPONENT_CONTAINER_LIST                =   'ComponentContainer_List';
    // Performances
    static readonly PERFORMANCE_DASHBOARD                   =   'Performance_Dashboard';
    static readonly PERFORMANCE_TICKETS                     =   'Performance_Tickets';
    static readonly PERFORMANCE_SEATS                       =   'Performance_Seats';
    static readonly PERFORMANCE_COMP                        =   'Performance_Comp';
    static readonly PERFORMANCE_POOL_COMP                   =   'Performance_PoolComp';
    static readonly PERFORMANCE_RESERVATIONS                =   'Performance_Reservations';
    static readonly PERFORMANCE_GROUP_SALES                 =   'Performance_GroupSales';
    static readonly PERFORMANCE_RELOCATION                  =   'Performance_Relocation';
    static readonly PERFORMANCE_BULK_REFUND                 =   'Performance_BulkRefund';
    static readonly PERFORMANCE_RESET_BARCODE               =   'Performance_ResetBarcode';
}
