import { VenueRow } from './venue-row';
import { BaseModel } from '../classes/base-model';

export class VenueBlock extends BaseModel{
    Id: number;
	PerformanceId: number;
    VenueSectionId: number;
    Name: string;
    RowCount: number;
    RowMaxSeat: number;
    Curve: number;
    Skew: number;
    RowNumberType: number;
    RowNumberStartType: number;
    SeatStartType: number;
    RowSeatType: number;
    StartsSeatNumber: number;
    Map: string;
    StartsRowNumber: string;
    Concavity: number;
    IsTable: boolean;
    Rotation: number;
    XCoordinate: number;
    YCoordinate: number;
    ProductIdList?: number[];
    Rows?: VenueRow[];
    IsStanding?:boolean;
}