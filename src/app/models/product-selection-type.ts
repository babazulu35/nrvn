import {BaseModel} from '../classes/base-model';
import {SelectionType} from './selection-type.enum';

export class ProductSelectionType extends BaseModel {
    ProductId: number;
    SalesChannelId: number;
    SelectionType: SelectionType;
    AllocationType: number;
}
