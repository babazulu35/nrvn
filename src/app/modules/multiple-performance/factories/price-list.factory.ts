import { Variant } from './../../../models/variant';
import { VariantFactory } from './variant.factory';
import { PriceList } from './../../../models/price-list';
import { BaseFactory } from './base.factory';
import { MulitplePerformanceService } from '../mulitple-performance.service';

export class PriceListFactory extends BaseFactory {

    model: PriceList;
    factoryId: any;

    variantFactories: VariantFactory[];

    beginDateType: number = 0;
    endDateType: number = 0;
    beginDateRelatedDuration: number;
    endDateRelatedDuration: number;

    beginDateTypes: {value: number, label: string}[];
    endDateTypes: {value: number, label: string}[];

    constructor(multiplePerformanceService: MulitplePerformanceService, data?:any) {
        super(multiplePerformanceService, data);
        this.model = new PriceList(data);
        this.model.Variants = [];
        this.factoryId = multiplePerformanceService.generateRandomUniqueID();
        delete this.model.Id;
        
        this.beginDateTypes = [];
        this.beginDateTypes.push({value: 0, label: "Kesin tarih"});
        this.beginDateTypes.push({value: 1, label: "Performans tarihine göre göreceli"});
        this.beginDateTypes.push({value: 2, label: "Önceki fiyat bloğu bitiş tarihine göre göreceli"});

        this.endDateTypes = [];
        this.endDateTypes.push({value: 0, label: "Kesin Tarih"});
        this.endDateTypes.push({value: 1, label: "Fiyat bloğu tarihine göre göreceli"});
        this.endDateTypes.push({value: 2, label: "Performans bitiş tarihine göre göreceli"});
    }
    
    addVariantFactory(variantFactory: VariantFactory): Promise<VariantFactory> {
        return new Promise( (resolve, reject) => {
            if(variantFactory) {
                let existVariantFactory = this.getVariantFactoryById(variantFactory.factoryId);
                if(!existVariantFactory) {
                    if(!this.variantFactories) this.variantFactories = [];
                    this.variantFactories.push(variantFactory);
                    if(!this.model.Variants) this.model.Variants = [];
                    this.model.Variants.push(variantFactory.model);
                    resolve(variantFactory);
                }else{
                    reject({Message: `<b>${variantFactory.factoryId}</b> factoryId'li varyant daha önce eklenmiş.`});
                }
            }else{
                reject();
            }
        });
    }

    removeVariantFactory(variantFactory: VariantFactory) {
        let index;
        if(this.model.Variants) {
            index = this.model.Variants.indexOf(variantFactory.model);
            if(index >= 0) this.model.Variants.splice(index, 1);
        }
        index = this.variantFactories.indexOf(variantFactory);
        if(index >= 0) this.variantFactories.splice(index, 1);
    }

    removeVariantFactoryById(id: any) {
        this.removeVariantFactory(this.getVariantFactoryById(id));
    }

    removeVariantFactoryByModel(model: Variant) {
        this.removeVariantFactory(this.getVariantFactoryByModel(model));
    }

    getVariantFactoryById(id: any): VariantFactory {
        if(!this.variantFactories || !id) return null;
        return this.variantFactories.find( item => item.factoryId === id);
    }

    getVariantFactoryByModel(model: Variant): VariantFactory {
        if(!this.variantFactories || !model) return null;
        return this.variantFactories.find( item => item.model === model);
    }
}