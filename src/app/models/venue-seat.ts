import { BaseModel } from '../classes/base-model';
import { SeatStatus } from './seat-status.enum';

export class VenueSeat extends BaseModel{
    Id: number;
	InfoCustomer: string;
    VenueRowId: number;
    VenueGateId: number;
    RowItemNo: number;
    SeatNo: number;
    OriginalStatus: number;
    Status: SeatStatus;
    ProductId: number;
    SalesChannelId: number;
    SalesSubChannelId: number;
    InfoSalesChannelId: number;
    Type: number;
    SeatPriority: number;
    IsStanding: boolean;
    OwnerFirmId: number;
    SeatImage: string;
    RuleId: number;
    TerminalId: number;
    UserId: number;
    SeasonalSeatId: number;
    TicketType: number;
}