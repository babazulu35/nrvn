import {BaseModel} from '../classes/base-model';

export class ProductProduct extends BaseModel {
    ProductId: number;
    RelatedProductId: number;
    PriceActionId: number;
}
