import { VariantPrice } from './../../../models/variant-price';
import { Variant } from './../../../models/variant';
import { BaseFactory } from './base.factory';
import { MulitplePerformanceService } from '../mulitple-performance.service';
import { VariantPriceFactory } from './variant-price.factory';

export class VariantFactory extends BaseFactory {

    model: Variant;
    factoryId: any;

    variantPriceFactories: VariantPriceFactory[];

    constructor(multiplePerformanceService: MulitplePerformanceService, data?:any) {
        super(multiplePerformanceService, data);
        this.model = new Variant(data);
        this.model.Prices = [];
        this.factoryId = multiplePerformanceService.generateRandomUniqueID();
        delete this.model.Id;
    }

    addVariantPriceFactory(variantPriceFactory: VariantPriceFactory): Promise<VariantPriceFactory> {
        return new Promise( (resolve, reject) => {
            if(variantPriceFactory) {
                let existVariantPriceFactory = this.getVariantPriceFactoryById(variantPriceFactory.factoryId);
                if(!existVariantPriceFactory) {
                    if(!this.variantPriceFactories) this.variantPriceFactories = [];
                    this.variantPriceFactories.push(variantPriceFactory);
                    if(!this.model.Prices) this.model.Prices = [];
                    this.model.Prices.push(variantPriceFactory.model);
                    resolve(variantPriceFactory);
                }else{
                    reject({Message: `<b>${variantPriceFactory.factoryId}</b> factoryId'li varyant fiyatı daha önce eklenmiş.`});
                }
            }else{
                reject();
            }
        });
    }

    removeVariantPriceFactory(variantPriceFactory: VariantPriceFactory) {
        let index;
        if(this.model.Prices) {
            index = this.model.Prices.indexOf(variantPriceFactory.model);
            if(index >= 0) this.model.Prices.splice(index, 1);
        }
        index = this.variantPriceFactories.indexOf(variantPriceFactory);
        if(index >= 0) this.variantPriceFactories.splice(index, 1);
    }

    removeVariantPriceFactoryById(id: any) {
        this.removeVariantPriceFactory(this.getVariantPriceFactoryById(id));
    }

    removeVariantPriceFactoryByModel(model: any) {
        this.removeVariantPriceFactory(this.getVariantPriceFactoryByModel(model));
    }

    getVariantPriceFactoryById(id: any): VariantPriceFactory {
        if(!this.variantPriceFactories || !id) return null;
        return this.variantPriceFactories.find( item => item.factoryId === id);
    }

    getVariantPriceFactoryByModel(model: VariantPrice): VariantPriceFactory {
        if(!this.variantPriceFactories || !model) return null;
        return this.variantPriceFactories.find( item => item.model === model);
    }
    
}