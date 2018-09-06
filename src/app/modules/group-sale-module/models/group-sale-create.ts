import { GroupSaleSeat } from './group-sale-seat';
import { CrmAnonymousUser } from "../../../models/crm-anonymous-user";

export class GroupSaleCreate {
    ReservationCode?: string;
    PerformanceId?: number;
    Description?: string;
    Seats?: GroupSaleSeat[];
    Customer?: CrmAnonymousUser;
    TotalAmount?: number;
    TotalServiceFee?: number;
    TotalTicketingFee?: number;
    InvoiceNo?: string
}