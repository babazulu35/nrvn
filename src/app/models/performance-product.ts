import { Product } from './product';
import { Performance } from './performance';
import { Template } from './template';
import {BaseModel} from '../classes/base-model';

export class PerformanceProduct extends BaseModel {
    ProductId: number;
    PerformanceId: number;
    Capacity: number;
    Duration: number;
    CategoryColorSeat: string;
    IsSoldOut: boolean;
    IsBundle: boolean;
    NonBundleLimit: number;
    VenueTemplate: Template;
    Product: Product;
    Performance: Performance;
}
