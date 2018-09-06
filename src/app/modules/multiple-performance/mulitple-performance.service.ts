import { AuthenticationService } from './../../services/authentication.service';
import { Router } from '@angular/router';
import { Event } from './../../models/event';
import { VariantPriceFactory } from './factories/variant-price.factory';
import { Performance } from './../../models/performance';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { VariantFactory } from './factories/variant.factory';
import { PriceListFactory } from './factories/price-list.factory';
import { ProductFactory } from './factories/product.factory';
import { PerformanceFactory } from './factories/performance.factory';
import { Injectable } from '@angular/core';
import { EventFactory } from './factories/event.factory';

import * as moment from 'moment';
import { VenueEditorSeat } from '../../models/venue-editor-seat';

@Injectable()
export class MulitplePerformanceService {

  entityTypeId: number;

  basePerformanceFactory$: BehaviorSubject<PerformanceFactory> = new BehaviorSubject(null);
  basePerformanceFactory: PerformanceFactory;

  currentEventFactory$: BehaviorSubject<EventFactory> = new BehaviorSubject(null);
  currentEventFactory: EventFactory;

  baseProductFactory$: BehaviorSubject<ProductFactory> = new BehaviorSubject(null);
  baseProductFactory: ProductFactory;

  payload$: BehaviorSubject<{}> = new BehaviorSubject(null);

  venueEditorSeats: VenueEditorSeat[];
  venueEditorSeats$: BehaviorSubject<VenueEditorSeat[]> = new BehaviorSubject(null);

  levels: {
    key: string,
    label: string,
    icon?: string,
    hasError?: boolean,
    hasAction?: boolean
  }[];

  currentLevel: {
    key: string,
    label: string,
    icon?: string,
    hasError?: boolean,
    hasAction?: boolean
  };

  goBackTo:string;

  variantTypeList: { value: any, text: string }[];

  constructor( private router:Router,private authService:AuthenticationService) { 
    this.levels = [];
    this.levels.push({key: "event", label: "Etkinlik Bilgileri", icon: "insert_invitation"});
    this.levels.push({key: "products", label: "Ürünleştirme", icon: "loyalty"});
    this.levels.push({key: "capacity", label: "Kapasite Seçimi", icon: "dialpad"});
    this.levels.push({key: "performances", label: "Performans Bilgileri", icon: "schedule"});
  }

  createEventFactory(data?:any): EventFactory {
    let eventFactory:EventFactory = new EventFactory(this, data);
    eventFactory.entityTypeId = this.entityTypeId;
    return eventFactory;
  }

  createPerformanceFactory(data?:any): PerformanceFactory {
    return new PerformanceFactory(this, data);
  }

  createProductFactory(data?:any, product?: any): ProductFactory {
    return new ProductFactory(this, data, product);
  }

  createPriceListFactory(data?:any): PriceListFactory {
    return new PriceListFactory(this, data);
  }

  createVariantFactory(data?:any): VariantFactory {
    return new VariantFactory(this, data);
  }

  createVariantPriceFactory(data?:any): VariantPriceFactory {
    return new VariantPriceFactory(this, data);
  }

  setBasePerformanceFactory(performanceFactory: PerformanceFactory) {
    this.basePerformanceFactory = performanceFactory;
    if(this.currentEventFactory) {
      this.currentEventFactory.performances = [];
      this.currentEventFactory.performances$.next(this.currentEventFactory.performances);
    }
    this.basePerformanceFactory$.next(this.basePerformanceFactory);
  }

  setBasePerformance(performance: Performance, createFactories?:boolean) {
    if(!performance) {
      performance = new Performance({
				"Status": 4,
				"Code": "001",
				"IsEnabled": true,
				"PurchaseTimeSeconds": 300,
				"IsSeatSelectionEnabled": true,
				"IsSeason": false,
				"ReservationAvailable": false,
				"ReservationExpirationType": 0,
				"PerformanceId": null,
				"IsInviteFriendAvailable": false,
				"InviteFriendExpirationType": 0,
				"AccessIntegrationTypeId": 0,
				"IsAccessIntegrationActive": false,
				"IsTicketForwardingAvailable": true,
				"IsGenerateBarcodeAvailable": true
      });
    }
    this.setBasePerformanceFactory(this.createPerformanceFactory(performance));
    if(createFactories) this.setFactoriesWithPerformance(performance);
    if(performance.PerformancePerformers) this.basePerformanceFactory.setPerformancePerformers(performance.PerformancePerformers);
  }

  setCurrentEventFactory(eventFactory: EventFactory) {
    this.currentEventFactory = eventFactory;
    if(!this.basePerformanceFactory) this.setBasePerformance(null);
    this.currentEventFactory$.next(this.currentEventFactory);
  }

  setBaseProductFactory(productFactory: ProductFactory) {
    this.baseProductFactory = productFactory;
    this.baseProductFactory$.next(this.baseProductFactory);
  }

  setFactoriesWithPerformance(performance: Performance) {
    // console.log("setFactoriesWithPerformance : ", performance, this.basePerformanceFactory);
    if(performance) {
      if(performance.VenueTemplate && performance.VenueTemplate.Venue) this.basePerformanceFactory.setVenue(performance.VenueTemplate.Venue, performance.VenueTemplate);
      if(performance.Products) {
        this.basePerformanceFactory.productFactories = [];
        performance.Products.forEach( performanceProduct => {
          this.basePerformanceFactory.addProductFactory(this.createProductFactory(performanceProduct)).then( productFactory => {
            if(performanceProduct.Product && performanceProduct.Product.PriceLists) {
              productFactory.priceListFactories = [];
              performanceProduct.Product.PriceLists.forEach( priceList => {
                productFactory.addPriceListFactory(this.createPriceListFactory(priceList)).then( priceListFactory => {
                  if(priceList.Variants) {
                    priceListFactory.variantFactories = [];
                    priceList.Variants.forEach( variant => {
                      priceListFactory.addVariantFactory(this.createVariantFactory(variant)).then( variantFactory => {
                        if(variant.Prices) {
                          variantFactory.variantPriceFactories = [];
                          variant.Prices.forEach( variantPrice => {
                            variantFactory.addVariantPriceFactory(this.createVariantPriceFactory(variantPrice)).then( variantpriceFactory => {
                              
                            });
                          });
                        }
                      });
                    });
                  }
                })
              });
            }
          })
        });
      }
    }
  }

  createPayload(): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload: any = {};
      if(this.basePerformanceFactory) {
        if(this.basePerformanceFactory.model) {

          payload["PurchaseTimeSeconds"] = this.basePerformanceFactory.model.PurchaseTimeSeconds;
          payload["IsEnabled"] = this.basePerformanceFactory.model.IsEnabled;
          payload["IsSeason"] = this.basePerformanceFactory.model.IsSeason;
          payload["ReservationAvailable"] = this.basePerformanceFactory.model.ReservationAvailable;
          payload["ReservationExpirationTime"] = this.basePerformanceFactory.model.ReservationExpirationTime;
          payload["ReservationExpirationType"] = this.basePerformanceFactory.model.ReservationExpirationType;
          payload["IsInviteFriendAvailable"] = this.basePerformanceFactory.model.IsInviteFriendAvailable;
          payload["InviteFriendExpirationType"] = this.basePerformanceFactory.model.InviteFriendExpirationType;
          payload["InviteFriendExpirationTime"] = this.basePerformanceFactory.model.InviteFriendExpirationTime;
          payload["PublishDate"] = this.basePerformanceFactory.model.PublishDate || moment(new Date(), 'DD.MM.YYYY, dddd HH:mm', true).toISOString();
          payload["AccessIntegrationTypeId"] = this.basePerformanceFactory.model.AccessIntegrationTypeId;
          if(payload["AccessIntegrationTypeId"] == 0) payload["AccessIntegrationTypeId"] = null;
          payload["IsAccessIntegrationActive"] = this.basePerformanceFactory.model.IsAccessIntegrationActive;
          payload["IsTicketForwardingAvailable"] = this.basePerformanceFactory.model.IsTicketForwardingAvailable;
          payload["IsGenerateBarcodeAvailable"] = this.basePerformanceFactory.model.IsGenerateBarcodeAvailable;
          payload["Images"] = this.basePerformanceFactory.model.Images;
          payload["PromoterId"] = this.basePerformanceFactory.promoterId;
  
          payload["Duration"] = this.basePerformanceFactory.baseDuration || 0;
          payload["NameType"] = this.basePerformanceFactory.performanceNameType || 0; 
          
          if(this.basePerformanceFactory.model.VenueTemplate) {
            payload['VenueTemplateId'] = this.basePerformanceFactory.model.VenueTemplate.Id;
          }else{
            reject({Message: `VenueTemplateId bulunmadı`, payload: payload });
          }
        }else {
          reject({Message: `Performans modeli bulunmadı`, payload: payload });
        }

        if(this.basePerformanceFactory.performancePerformers && this.basePerformanceFactory.performancePerformers.length) {
          let performerList = payload["PerformerList"] = [];
          this.basePerformanceFactory.performancePerformers.forEach( performancePerformer => {
            performerList.push({
              PerformerId: performancePerformer.PerformerId,
              Info: performancePerformer.Info
            });
          });
        }

        if(this.basePerformanceFactory.productFactories && this.basePerformanceFactory.productFactories.length) {
          let productList = payload["ProductList"] = [];
          let productItem;
          this.basePerformanceFactory.productFactories.forEach( productFactory => {
            productItem = {
              GroupId: productFactory.model.Product.GroupId,
              CurrencyId: productFactory.model.Product.CurrencyId,
              IsRefundable: productFactory.model.Product.IsRefundable,
              IsBundle: productFactory.model.Product.IsBundle,
              MaxProductsPerTrx: productFactory.model.Product.MaxProductsPerTrx,
              Vat: productFactory.model.Product.Vat,
              IsSeatSelectionAvailable: productFactory.model.Product.IsSeatSelectionAvailable || true,
              CategoryColorSeat: productFactory.model.CategoryColorSeat,
              Localization: productFactory.model.Product.getRawLocalization(true)
            };
            productList.push(productItem);

            if(productFactory.seats && productFactory.seats.length) {
              let seatList = productItem["SeatList"] = productFactory.getSeatIds();
            }

            if(productFactory.productSelectionTypes && productFactory.productSelectionTypes.length) {
              let selectionTypeList = productItem["SelectionTypeList"] = [];
              productFactory.productSelectionTypes.forEach( productSelectionType => {
                selectionTypeList.push(productSelectionType);
              });
            }

            if(productFactory.priceListFactories && productFactory.priceListFactories.length) {
              let priceLists = productItem["PriceLists"] = [];
              let priceListItem;
              productFactory.priceListFactories.forEach( priceListFactory => {
                priceListItem = {
                  IsEnabled: priceListFactory.model.IsEnabled,
                  Type: priceListFactory.model.Type,
                  NominalPrice: priceListFactory.model.NominalPrice,
                  AllowedSeatTotal: priceListFactory.model.AllowedSalesTotal,
                  NextPriceId: priceListFactory.model.NextPriceListId,
                  BeginDate: priceListFactory.model.BeginDate,
                  EndDate: priceListFactory.model.EndDate,
                  BeginDateType: priceListFactory.beginDateType,
                  EndDatetype: priceListFactory.endDateType,
                  BeginDateRelatedDuration: priceListFactory.beginDateRelatedDuration,
                  EndDateRelatedDuration: priceListFactory.endDateRelatedDuration,
                  Localization: priceListFactory.model.getRawLocalization(true)
                }
                priceLists.push(priceListItem);

                if(priceListFactory.variantFactories && priceListFactory.variantFactories.length) {
                  let variantList = priceListItem["VariantList"] = [];
                  let variantItem;
                  priceListFactory.variantFactories.forEach( variantFactory => {
                    variantItem = {
                      DefaultServiceFeeAdjType : variantFactory.model.DefaultServiceFeeAdjType,
                      DefaultServiceFee : variantFactory.model.DefaultServiceFee,
                      IsActive : variantFactory.model.IsActive,
                      DefaultPrice : variantFactory.model.DefaultPrice,
                      VariantTypeId : variantFactory.model.VariantTypeId,
                      AllowedSalesTotal : variantFactory.model.AllowedSalesTotal,
                      VariantType: variantFactory.model.VariantType
                    }
                    variantList.push(variantItem);

                    if(variantFactory.variantPriceFactories && variantFactory.variantPriceFactories.length) {
                      let variantPriceList = variantItem["VariantPriceList"] = [];
                      let variantPriceItem;
                      variantFactory.variantPriceFactories.forEach( variantPriceFactory => {
                        variantPriceItem = {
                          ServiceFeeAdjType : variantPriceFactory.model.ServiceFeeAdjType,
                          ServiceFee : variantPriceFactory.model.ServiceFee,
                          TicketingFee : variantPriceFactory.model.TicketingFee,
                          Price : variantPriceFactory.model.Price,
                          MaxProduct : variantPriceFactory.model.MaxProduct,
                          SalesChannel: variantPriceFactory.model.SalesChannel,
                          SalesChannelId : variantPriceFactory.model.SalesChannelId
                        }
                        variantPriceList.push(variantPriceItem);
                      });
                    }
                  });
                }
              });
            }
          });
        }
      }else {

      }
      
      if(this.currentEventFactory) {
        
        payload["EventId"] = this.currentEventFactory.model.Id;
        // payload["Id"] = this.currentEventFactory.model.Id;
        payload["Status"] =  4 ;//this.currentEventFactory.model.Status;
        payload["Code"] = "001"; //this.currentEventFactory.model.Code;
        payload["Localization"] = this.currentEventFactory.model.getRawLocalization();
        
        if(this.currentEventFactory.performances && this.currentEventFactory.performances.length) {
          let performanceList = payload['PerformanceList'] = [];
          this.currentEventFactory.performances.forEach( item => {
            if(item.Date != null)
            {
            performanceList.push({
              Date: item.Date,
              Localization: item.getRawLocalization()
            });
          }
          });
        }

        if(this.currentEventFactory.entityAttributes && this.currentEventFactory.entityAttributes.length) {
          let attributeList = payload["AttributeList"] = [];
          this.currentEventFactory.entityAttributes.forEach( item => {
            attributeList.push({
              AttributeId: item.AttributeId,
              Value: item.Value,
              IsActive: item.IsActive,
              EntityTypeId: this.currentEventFactory.entityTypeId
            });
          });
        }

        if((this.currentEventFactory.sponsors && this.currentEventFactory.sponsors.length) || (this.currentEventFactory.promoters && this.currentEventFactory.promoters.length) ) {
          let entityFirms = payload["EntityFirms"] = [];
          if(this.currentEventFactory.sponsors && this.currentEventFactory.sponsors.length) {
            this.currentEventFactory.sponsors.forEach( item => {
              if(item.OwnerFirmId != undefined)
              {
                entityFirms.push({
                  Type: item.Type || 3, //item.Type || 3,
                  SubType: item.SubType,
                  OwnerFirmId: item.OwnerFirmId
                })
              }
            });  
          }

          if(this.currentEventFactory.promoters && this.currentEventFactory.promoters.length) {
            this.currentEventFactory.promoters.forEach( item => {
              if(item.OwnerFirmId != undefined)
              {
                entityFirms.push({
                  Type: 2, //item.Type || 2,
                  SubType: item.SubType,
                  OwnerFirmId: item.OwnerFirmId
                })
              }
            });  
          }
        }

      }else {
        reject({Message: `Henüz etkinlik kopyası oluşturulmadı`, payload: payload });
      }
      console.log("create payload : ", payload, this.basePerformanceFactory, this.currentEventFactory);
      resolve(payload);
    });
  }

  generateRandomUniqueID(length : number = 6){
    return 'x'.repeat(length).replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  setCurrentLevelByKey(key: string) {
    if(!this.levels) return;
    this.currentLevel = this.levels.find( item => item.key == key);
    let currentIndex: number = this.levels.indexOf(this.currentLevel);
    this.levels.map( (level, index) => {
      level.hasAction = index < currentIndex;
    });
  }

  currentLevelChangeHandler(event:any) {
    return this.router.navigate(['/multiple-performance/create/' + event.currentLevel.key]);
  }

  currentRoute(key:string) {
    if(!this.levels) return;
    let currentRouteIndex =  this.levels.findIndex(item => item.key == key);

    if(currentRouteIndex > 0) {
      this.goBackTo = this.levels[currentRouteIndex - 1].key;
    }
    else {
      this.goBackTo = '#';
    }
  }

  goBack() {
    return this.router.navigate(['/multiple-performance/create/' + this.goBackTo]);
  }

}
