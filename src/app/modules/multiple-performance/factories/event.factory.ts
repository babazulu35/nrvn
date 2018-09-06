import { cloneDeep } from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntityFirm } from './../../../models/entity-firm';
import { EntityAttribute } from './../../../models/entity-attribute';
import { Template } from './../../../models/template';
import { MulitplePerformanceService } from './../mulitple-performance.service';
import { Performance } from './../../../models/performance';
import { Event } from './../../../models/event';
import { BaseFactory } from './base.factory';
import { Firm } from '../../../models/firm';
import { Venue } from '../../../models/venue';

export class EventFactory extends BaseFactory {

    model: Event;
    factoryId: any;
    entityTypeId: number;
    payload: any;
    performances: Performance[];
    entityAttributes:EntityAttribute[] = [];
    entityAttributes$: BehaviorSubject<EntityAttribute[]> = new BehaviorSubject(null);
    sponsors:EntityFirm[]  = [];
    promoters:EntityFirm[] = [];
    sponsors$: BehaviorSubject<EntityFirm[]> = new BehaviorSubject(null);
    promoters$: BehaviorSubject<EntityFirm[]> = new BehaviorSubject(null);
    performances$: BehaviorSubject<Performance[]> = new BehaviorSubject(null);

    constructor(multiplePerformanceService: MulitplePerformanceService, data?:any) {
        super(multiplePerformanceService, data);
        this.model = new Event(cloneDeep(data));
        this.factoryId = multiplePerformanceService.generateRandomUniqueID();
    }

    setVenue(venue: Venue, venueTemplate: Template) {
        if(!this.multiplePerformanceService.basePerformanceFactory) return;
        this.multiplePerformanceService.basePerformanceFactory.setVenue(venue, venueTemplate);
    }

    addPerformance(performance?:Performance, forceToCreateNew?: boolean): Promise<Performance> {
        if(forceToCreateNew && this.multiplePerformanceService.basePerformanceFactory) {
            return this.addPerformance(new Performance(cloneDeep(this.multiplePerformanceService.basePerformanceFactory.model)));
        }
        return new Promise( (resolve, reject) => {
            if(performance) {
                let existPerformance = this.getPerformanceByDate(performance.Date);
                if(!existPerformance) {
                    if(!this.performances) this.performances = [];
                    this.performances.push(performance);
                    this.performances$.next(this.performances);
                    resolve(performance);
                }else{
                    reject({Message: `<b>${performance.Date}</b> tarihli performans daha önce eklenmiş.`});
                }
            }else{
                reject();
            }
        });
    }

    removePerformance(performance) {
        let index = this.performances.indexOf(performance);
        if(index >= 0) this.performances.splice(index, 1);
        this.performances$.next(this.performances);
    }
    removeSponsorById(id) {
        let foundedIndex = this.sponsors.findIndex(result =>  result.OwnerFirmId == id)
        if(foundedIndex >= 0) 
        { 
        this.sponsors.splice(foundedIndex, 1); 
        this.sponsors$.next(this.sponsors);
        }
    }
    removePromoterById(id) {
        let foundedIndex = this.promoters.findIndex(result =>  result.OwnerFirmId == id)
        if(foundedIndex >= 0) {
            this.promoters.splice(foundedIndex, 1);
            this.promoters$.next(this.promoters);
        }
    }    
    removeAttributeById(id) {
        let foundedIndex = this.entityAttributes.findIndex(result =>  result.AttributeId == id)
        if(foundedIndex >= 0) this.entityAttributes.splice(foundedIndex, 1);
    }    

    objectPatcher(id,params) {
        
        let foundedIndex = this.sponsors.findIndex(result =>  result.OwnerFirmId == id)
        let parameters;
        for(parameters in params) {
            if(this.sponsors[foundedIndex].hasOwnProperty(parameters)) {

                this.sponsors[foundedIndex][parameters] = params[parameters]
                this.sponsors$.next(this.sponsors)
            }
        }
    }

    removePerformanceByDate(date: any): Promise<Performance[]> {
        return new Promise( (resolve, reject) => {
            let existPerformance = this.getPerformanceByDate(date);
            if(existPerformance) {
                this.removePerformance(existPerformance);
                resolve(this.performances);
            }else{
                reject({Message: `${date} tarihli bir performans bulunamadı.`});
            }
        });
    }

    getPerformanceByDate(date: any): Performance {
        if(!this.performances || !date) return null;
        return this.performances.find( item => item.Date === date);
    }

    getEntityAttributeByAttributeId(id: any): EntityAttribute {
        if(!this.entityAttributes) return null;
        return this.entityAttributes.find( item => item.AttributeId == id);
    }

    addEntityAttribute(entitiyAttribute: EntityAttribute): Promise<EntityAttribute> {
        return new Promise((resolve, reject) => {
            let existAttribute = this.getEntityAttributeByAttributeId(entitiyAttribute.AttributeId);
            if(!existAttribute) {
                if(!this.entityAttributes) this.entityAttributes = [];
                this.entityAttributes.push(entitiyAttribute);
                this.entityAttributes$.next(this.entityAttributes);
                resolve(entitiyAttribute);
            }else{
                reject({Message: `${entitiyAttribute.AttributeId} nolu AttributeId ile daha önce EntityAttribute eklenmiş.`});
            }
        });
    }

    setEntityAttributeList(entityAttributes?: EntityAttribute[]) {
        this.entityAttributes = [];
        if(entityAttributes) entityAttributes.forEach( item => this.addEntityAttribute(item));
    }

    getSponsorById(id: any): EntityFirm {
        if(!this.sponsors) return null;
        this.sponsors.find( item => { return item.OwnerFirmId == id });
    }

    addSponsor(entityFirm: EntityFirm): Promise<EntityFirm> {
        return new Promise((resolve, reject) => {
            let existEntityFirm = this.getSponsorById(entityFirm.OwnerFirmId);
            if(!existEntityFirm) {
                if(!this.sponsors) this.sponsors = [];
                this.sponsors.push(entityFirm);
                this.sponsors$.next(this.sponsors);
                resolve(entityFirm);
            }else{
                reject({Message: `${entityFirm.OwnerFirmId} nolu OwnerFirmId ile daha önce EntityFirm eklenmiş.`});
            }
        });
    }

    setSponsorList(entityFirms?: EntityFirm[]) {      
        this.sponsors = [];
        if(entityFirms) entityFirms.forEach( item => this.addSponsor(item));
    }

    getPromoterById(id: any): EntityFirm {
        if(!this.promoters) return null;
        return this.promoters.find( item => item.OwnerFirmId == id);
    }

    addPromoter(entityFirm: EntityFirm): Promise<EntityFirm> {
        return new Promise((resolve, reject) => {
            let existEntityFirm = this.getPromoterById(entityFirm.OwnerFirmId);
            if(!existEntityFirm) {
                if(!this.promoters) this.promoters = [];
                this.promoters.push(entityFirm);
                this.promoters$.next(this.promoters);
                resolve(entityFirm);
            }else{
                reject({Message: `${entityFirm.OwnerFirmId} nolu OwnerFirmId ile daha önce EntityFirm eklenmiş.`});
            }
        });
    }

    setPromoterList(entityFirms?: EntityFirm[]) {
        this.promoters = [];
        if(entityFirms) entityFirms.forEach( item => this.addPromoter(item));
        this.promoters$.next(this.promoters);
    }
}