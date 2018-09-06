import { VariantType } from './variant-type';
import { VariantPrice } from './variant-price';
import { BaseModel } from '../classes/base-model';
import { PriceAdjustmentType } from "./price-adjustment-type.enum";

export class Variant extends BaseModel {
    Id: number;
    ProductId: number;
    IsActive: boolean;
    ActualSalesTotal: number;
    AllowedSalesTotal: number;
    PriceListId: number;
    DefaultPrice: number;
    DefaultServiceFee: number;
    DefaultServiceFeeAdjType: PriceAdjustmentType;
    VariantTypeId: number;
    VariantType?: VariantType;
    Prices: VariantPrice[];
}