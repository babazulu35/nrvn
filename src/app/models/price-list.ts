import { Product } from './product';
import { Variant } from './variant';
import {BaseModel} from '../classes/base-model';
import { PriceListType } from './price-list-type.enum';

export class PriceList extends BaseModel{
    Id: number;
    ProductId: number;
    NominalPrice: number;
    IsEnabled: boolean;
    BeginDate: Date;
    EndDate: Date;
    NextPriceList: PriceList;
    NextPriceListId: number;
    FakeId: number;
    Localization?: {
        Name?: string,
        Info?: string,
        Tr?: {
            Name?: string,
            Info?: string
        },
        En?: {
            Name?: string
            Info?: string
        }
    };
    Variants: Variant[];
    Product: Product;
    Type: PriceListType;
    AllowedSalesTotal: number;
    ActualSalesTotal: number;
}
