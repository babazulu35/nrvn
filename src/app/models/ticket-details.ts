import { BaseModel } from '../classes/base-model';

export class TicketDetails extends BaseModel{
    EventName: string;
    EventCode: string;
    VenueName: string;
    EventDate: string;
    EventFormattedDate: string;
    RefCode: string;
    CategoryName: string;
    SeatInfo: string;
    SeatAllocationType: string;
    SeatAllocationType_Desc: string;
    Barcode: string;
    TicketBottomDescription: string;
    GateCode: string;
    GateName: string;
    BlockName: string;
    RowNumber;
    SeatName: string;
    VariantTypeName: string;
}
