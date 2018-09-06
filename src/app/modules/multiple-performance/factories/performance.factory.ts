import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PerformancePerformer } from './../../../models/performance-performer';
import { Performer } from './../../../models/performer';
import { Product } from './../../../models/product';
import { Performance } from './../../../models/performance';
import { BaseFactory } from './base.factory';
import { MulitplePerformanceService } from '../mulitple-performance.service';
import { ProductFactory } from './product.factory';
import { Venue } from '../../../models/venue';
import { Template } from '../../../models/template';

export class PerformanceFactory extends BaseFactory {

    model: Performance;
    factoryId: any;
    modelId: number;
    baseDuration: number;
    promoterId:number;
    performanceNameType: number;

    productFactories: ProductFactory[];
    performers: Performer[];
    performers$: BehaviorSubject<Performer[]> = new BehaviorSubject(null);
    performancePerformers: PerformancePerformer[];
    performancePerformers$: BehaviorSubject<PerformancePerformer[]> = new BehaviorSubject(null);

    constructor(multiplePerformanceService: MulitplePerformanceService, data?:any) {
        super(multiplePerformanceService, data);
        this.model = new Performance(data);
        this.model.Products = [];
        this.model.Date = null;
        this.modelId = this.model.Id;
        this.factoryId = multiplePerformanceService.generateRandomUniqueID();
        delete this.model.Id;
    }

    setDuration(duration: number) {
        this.baseDuration = duration;
    }

    setPromoterId(promoterId:number) {
        this.promoterId = promoterId;
    }

    setPerformanceNameType(nameType:number) {
        this.performanceNameType = nameType;
    }

    setVenue(venue: Venue, venueTemplate: Template) {
        if(!this.model) return;
        this.model.VenueTemplate = venueTemplate;
        this.model.VenueTemplate.Venue = venue;
    }

    setPerformancePerformers(performanceperformers: PerformancePerformer[]) {
        this.performancePerformers = performanceperformers;
        this.performancePerformers$.next(this.performancePerformers);
    }

    addProductFactory(productFactory: ProductFactory): Promise<ProductFactory> {
        return new Promise( (resolve, reject) => {
            if(productFactory) {
                let existProductFactory = this.getProductFactoryById(productFactory.factoryId);
                if(!existProductFactory) {
                    if(!this.productFactories) this.productFactories = [];
                    this.productFactories.push(productFactory);
                    if(!this.model.Products) this.model.Products = [];
                    this.model.Products.push(productFactory.model);
                    resolve(productFactory);
                }else{
                    reject({Message: `<b>${productFactory.factoryId}</b> factoryId'li ürün daha önce eklenmiş.`});
                }
            }else{
                reject();
            }
        });
    }

    removeProductFactory(productFactory: ProductFactory) {
        let index;
        if(this.model.Products) {
            index = this.model.Products.indexOf(productFactory.model);
            if(index >= 0) this.model.Products.splice(index, 1);
        }
        index = this.productFactories.indexOf(productFactory);
        if(index >= 0) this.productFactories.splice(index, 1);
    }

    removeProductFactoryById(id: any) {
        this.removeProductFactory(this.getProductFactoryById(id));
    }

    getProductFactoryById(id: any): ProductFactory {
        if(!this.productFactories || !id) return null;
        return this.productFactories.find( item => item.factoryId === id);
    }

    getProductFactoryByModel(model: any): ProductFactory {
        if(!this.productFactories || !model) return null;
        return this.productFactories.find( item => item.model === model);
    }

    getPerformerById(id: any): Performer {
        if(!this.performers || !id) return null;
        return this.performers.find( item => item.Id === id);
    }
    
}