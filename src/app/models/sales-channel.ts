import {BaseModel} from '../classes/base-model';

export class SalesChannel extends BaseModel {
    Id: number;
    Name: string;
    IsActive: boolean;
    PurchaseTimeSeconds: number;
    IsSeatSelectionEnabled: boolean;
    ParentId: number
}