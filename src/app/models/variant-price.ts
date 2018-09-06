import { SalesChannel } from './sales-channel';
import {BaseModel} from '../classes/base-model';

export class VariantPrice extends BaseModel {
    Id: number;
    VariantId: number;
    SalesChannelId: number;
    BeginDate: Date;
    EndDate: Date;
    IsSeatSelectionEnabled: boolean;
    MaxProduct: number;
    Price: number;
    ServiceFeeAdjType: number;
    ServiceFee: number;
    TicketingFee: number;
    SalesChannel: SalesChannel;
}