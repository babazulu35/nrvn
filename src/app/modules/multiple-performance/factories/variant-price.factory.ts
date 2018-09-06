import { VariantPrice } from './../../../models/variant-price';
import { BaseFactory } from './base.factory';
import { MulitplePerformanceService } from '../mulitple-performance.service';

export class VariantPriceFactory extends BaseFactory {

    model: VariantPrice;
    factoryId: any;

    constructor(multiplePerformanceService: MulitplePerformanceService, data?:any) {
        super(multiplePerformanceService, data);
        this.model = new VariantPrice(data);
        this.factoryId = multiplePerformanceService.generateRandomUniqueID();
        delete this.model.Id;
    }
    
}