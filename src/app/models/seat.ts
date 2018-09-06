import { BaseModel } from '../classes/base-model';
import { SeatStatus } from './seat-status.enum';

export class Seat extends BaseModel{
    Id: number;
	RowId: number;
    GateId: number;
    SeatNo: number;
    Status: SeatStatus;
    Type: number;
    SeatPriority: number;
    IsStanding: boolean;
    Name: string;
    OrderNo: number;
}