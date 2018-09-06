import { VenueSeat } from './venue-seat';
import { BaseModel } from "../classes/base-model";

export class VenueRow extends BaseModel {
    PerformanceId: number;
    VenueBlockId: number;
    SeatCount: number;
    StartsSeatNumber: number;
    RowNumber: string;
    StartXCoordinates: number;
    StartYCoordinates: number;
    DirectionType: number;
    Name: string;
    OrderNo: number;
    Id: 0;
    Seats?: VenueSeat[];
}