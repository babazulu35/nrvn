import { VenueEditorSeat } from './../../../models/venue-editor-seat';
import { cloneDeep } from 'lodash';
import { PriceList } from './../../../models/price-list';
import { PerformanceProduct } from './../../../models/performance-product';
import { ProductSelectionType } from './../../../models/product-selection-type';
import { PriceListFactory } from './price-list.factory';
import { BaseFactory } from './base.factory';
import { Product } from '../../../models/product';
import { MulitplePerformanceService } from '../mulitple-performance.service';

export class ProductFactory extends BaseFactory {
    
    model: PerformanceProduct;
    product: Product;
    factoryId: any;

    priceListFactories: PriceListFactory[];
    seats: VenueEditorSeat[];
    productSelectionTypes: ProductSelectionType[];
    allowCustomProductSelectionType: boolean;
    
    variantTypeList: { value: any, text: string }[];
    currencyList: { value: any, text: string, name?: string }[];
	defaultCurrencyId: number;
    vatList: { value: any, text: string }[];
    defaultVat: number;
    defaultTicketingFee: number;
    

    constructor(multiplePerformanceService: MulitplePerformanceService, data?:any, product?:any) {
        super(multiplePerformanceService, data);
        this.model = new PerformanceProduct(data);
        this.model.Product = new Product(product || this.model.Product);
        this.model.Product.PriceLists = [];
        this.factoryId = multiplePerformanceService.generateRandomUniqueID();
        delete this.model.PerformanceId;
        delete this.model.ProductId;
        delete this.model.Product.Id;
        this.model.Capacity = 0;
    }

    setColor(color: string) {
        if(this.model) this.model.CategoryColorSeat = color;
    }

    setSeats(seats: VenueEditorSeat[]) {
        this.seats = seats;
        this.model.Capacity = this.seats ? this.seats.length : 0;
    }

    getSeatIds(): number[] {
        if(!this.seats) return null;
        let ids: number [] = [];
        this.seats.forEach( seat => ids.push(seat.Id));
        return ids;
    }

    setProductSelectionTypes(productSelectionTypes: ProductSelectionType[]) {
        this.productSelectionTypes = productSelectionTypes;
    }

    addPriceListFactory(priceListFactory?: PriceListFactory): Promise<PriceListFactory> {
        if(!priceListFactory) priceListFactory = this.multiplePerformanceService.createPriceListFactory();
        return new Promise( (resolve, reject) => {
            if(priceListFactory) {
                let existPriceListFactory = this.getPriceListFactoryById(priceListFactory.factoryId);
                if(!existPriceListFactory) {
                    if(!this.priceListFactories) this.priceListFactories = [];
                    this.priceListFactories.push(priceListFactory);
                    if(!this.model.Product.PriceLists) this.model.Product.PriceLists = [];
                    this.model.Product.PriceLists.push(priceListFactory.model);
                    resolve(priceListFactory);
                }else{
                    reject({Message: `<b>${priceListFactory.factoryId}</b> factoryId'li fiyat bloğu daha önce eklenmiş.`});
                }
            }else{
                reject();
            }
        });
    }

    removePriceListFactory(priceListFactory: PriceListFactory) {
        let index;
        if(this.model.Product.PriceLists) {
            index = this.model.Product.PriceLists.indexOf(priceListFactory.model);
            if(index >= 0) this.model.Product.PriceLists.splice(index, 1);
        }
        index = this.priceListFactories.indexOf(priceListFactory);
        if(index >= 0) this.priceListFactories.splice(index, 1);
    }

    removePriceListFactoryById(id: any) {
        this.removePriceListFactory(this.getPriceListFactoryById(id));
    }

    removePriceListFactoryByModel(model: PriceList) {
        this.removePriceListFactory(this.getPriceListFactoryByModel(model));
    }

    getPriceListFactoryById(id: any): PriceListFactory {
        if(!this.priceListFactories || !id) return null;
        return this.priceListFactories.find( item => item.factoryId === id);
    }

    getPriceListFactoryByModel(model: PriceList): PriceListFactory {
        if(!this.priceListFactories || !model) return null;
        return this.priceListFactories.find( item => item.model === model);
    }
}