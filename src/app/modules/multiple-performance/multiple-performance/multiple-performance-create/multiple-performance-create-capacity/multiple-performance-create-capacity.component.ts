import { PerformanceProduct } from './../../../../../models/performance-product';
import { ProductFactory } from './../../../factories/product.factory';
import { Product } from './../../../../../models/product';
import { Component, OnInit, HostBinding, ViewChild, Injector, ComponentFactoryResolver, ChangeDetectorRef, Inject, ComponentRef } from '@angular/core';
import { MulitplePerformanceService } from '../../../mulitple-performance.service';
import { VenueTemplateEditorComponent } from '../../../../common-module/components/venue-template-editor/venue-template-editor.component';
import { EventFactory } from '../../../factories/event.factory';
import { PerformanceFactory } from '../../../factories/performance.factory';
import { AppSettingsService } from '../../../../../services/app-settings.service';
import { TetherDialog } from '../../../../common-module/modules/tether-dialog/tether-dialog';
import { NotificationService } from '../../../../../services/notification.service';
import { Performance } from '../../../../../models/performance';
import { Event } from '../../../../../models/event';
import { Subscription } from 'rxjs';
import { Seat } from '../../../../../models/seat';
import { SeatColors } from '../../../../../models/seat-colors';
import { SeatStatus } from '../../../../../models/seat-status.enum';
import { TicketType } from '../../../../../models/ticket-type.enum';
import { Router } from '@angular/router';
import { EntityService } from '../../../../../services/entity.service';
import { BlockCapacityBoxComponent, VenueBlockCapacity } from '../../../../common-module/common/block-capacity-box/block-capacity-box.component';
import { BlockCapacity } from '../../../../common-module/components/block-capacity-list/block-capacity-list.component';
import { VenueEditorSeat } from '../../../../../models/venue-editor-seat';

import * as _ from 'lodash';

@Component({
  selector: 'app-multiple-performance-create-capacity',
  templateUrl: './multiple-performance-create-capacity.component.html',
  styleUrls: ['./multiple-performance-create-capacity.component.scss'],
  providers: [
    {provide: 'totalCapacityCountService', useClass: EntityService },
  ],
  entryComponents: [BlockCapacityBoxComponent]
})
export class MultiplePerformanceCreateCapacityComponent implements OnInit {
  @HostBinding('class.or-multiple-performance-create-capacity') true;
  @ViewChild(VenueTemplateEditorComponent) venueTemplateEditor: VenueTemplateEditorComponent;

  role: string = VenueTemplateEditorComponent.ROLE_MULTI_PRODUCT;
  isLoading: boolean;
  
  event: Event;
  performance: Performance;
  currentEventFacotry: EventFactory;
  basePerformanceFactory: PerformanceFactory;

  blockCapacityBoxComponent: BlockCapacityBoxComponent;
  venueBlockCapacities: VenueBlockCapacity[];
  
  eventSubscription: Subscription;
  performanceSubscription: Subscription;
  
  templateId: number;

  selectedProductFactory: ProductFactory;

  selectedSeats:{}[] = [];
  statistics: {}[];
  
  totalCapacityCount: number;
  remainingCapacityCount: number;

  // get levels() { return this.multiplePerformanceService.levels; }
  // get currentLevel() { return this.multiplePerformanceService.currentLevel }

  validation: {
		Capacity: { isValid: any, message: string },
	} = {
		Capacity: {
			message: 'Fiyat bilgilerinde zorunlu alanlar eksik!',
			isValid():boolean {
				return this.performance && this.performance.Products.some( performanceProduct => performanceProduct.Capacity > 0)
			}
		}
	};

	get isValid():boolean {
		if( this.validation
			&& this.validation.Capacity.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
  };
  
  constructor(
    @Inject('totalCapacityCountService') private totalCapacityCountService: EntityService,
    public multiplePerformanceService: MulitplePerformanceService,
    private appSettingsService: AppSettingsService,
    private router:Router,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    public tetherService: TetherDialog,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.eventSubscription = this.multiplePerformanceService.currentEventFactory$.subscribe( currentEventFactory => {
      this.currentEventFacotry = this.currentEventFacotry;
      if(currentEventFactory) {
        this.event = currentEventFactory.model;
      }
      this.changeDetector.detectChanges();
    });
    this.performanceSubscription = this.multiplePerformanceService.basePerformanceFactory$.subscribe( performanceFactory => {
      this.basePerformanceFactory = performanceFactory;
      if(performanceFactory) {
        this.performance = performanceFactory.model;
        
        if(this.performance && this.performance.VenueTemplate && this.performance.VenueTemplate.Id) {
          this.totalCapacityCountService.count.subscribe( count => {
            this.totalCapacityCount = count;
            this.setStatistics();
          });
          this.totalCapacityCountService.setCustomEndpoint('GetAll');
          this.totalCapacityCountService.fromEntity('VSeat').where('Row/Block/VenueSection/TemplateId', '=', this.performance.VenueTemplate.Id).take(1).page(0).executeQuery();
        }
      }
      this.changeDetector.detectChanges();
    });
  }

  ngOnDestroy() {
    if(this.eventSubscription) this.eventSubscription.unsubscribe();
    if(this.performanceSubscription) this.performanceSubscription.unsubscribe();
  }

  private setStatistics() {
    this.statistics = [];
    let infoStatistics = [];
    if(this.totalCapacityCount != null) {
      infoStatistics.push({key: 'totalCapacityCount', label: 'TOPLAM KAPASİTE', value: this.totalCapacityCount});
      let totalSelectedSeatsLength = 0;
      if(this.basePerformanceFactory && this.basePerformanceFactory.productFactories ) this.basePerformanceFactory.productFactories.forEach( productFactory => totalSelectedSeatsLength += productFactory.seats ? productFactory.seats.length : 0);
      this.remainingCapacityCount = this.totalCapacityCount - totalSelectedSeatsLength;
      if(this.remainingCapacityCount < 0) this.remainingCapacityCount = 0;
      infoStatistics.push({color: '000000', key: 'remainingCapacityCount', label: 'KALAN KAPASİTE', value: this.remainingCapacityCount || 0});
    }
    this.statistics = [infoStatistics];
    this.changeDetector.detectChanges();
  }

  selectSeatsByProduct(): Promise<any> {
    if(this.basePerformanceFactory && this.basePerformanceFactory.productFactories) {
      let payload: {productId: number, productColor?: string, seatIds?: number[]}[] = [];
      this.multiplePerformanceService.basePerformanceFactory.productFactories.forEach( productFactory => {
        payload.push({
          productId: productFactory.factoryId,
          productColor: productFactory.model.CategoryColorSeat,
          seatIds: productFactory.getSeatIds()
        })
      });

      return this.venueTemplateEditor.selectProductSeats(payload);
    }
  }

  setVenueBlockCapacities(payload) {
    if(payload && payload.Sections) {
      this.venueBlockCapacities = [];
      let venueBlockCapacity: VenueBlockCapacity;
      let blockCapacity: BlockCapacity;
      let blockCapacities: BlockCapacity[];
      let blockHasProduct: boolean;
      let seatsHasAvailableStatus: any[] = [];
      let availableSeats: any[] = [];
      let currentSeats: any[] = [];
      let otherSeats: any[] = [];
      let totalCapacity: number = 0;
      
      payload.Sections.forEach( section => {
        if(section && section.Blocks && section.Blocks.length) {
          section.Blocks.forEach( block => {
            blockCapacities = [];
            if(this.basePerformanceFactory && this.basePerformanceFactory.productFactories) {
              this.basePerformanceFactory.productFactories.forEach( productFactory => {
                seatsHasAvailableStatus = [];
                availableSeats = [];
                currentSeats = [];
                otherSeats = [];
                totalCapacity = 0;
                if(block.Rows) {
                  block.Rows.forEach( row => {
                    seatsHasAvailableStatus = _.unionBy(seatsHasAvailableStatus, row.Seats.filter( seat => (seat.Status == SeatStatus.OnSale || seat.Status == SeatStatus.Pending || seat.Status == SeatStatus.Hold)), 'Id');
                    availableSeats = _.unionBy(availableSeats, seatsHasAvailableStatus.filter( seat => !seat.ProductId || seat.ProductId == productFactory.factoryId), 'Id');
                    otherSeats = _.unionBy(otherSeats, seatsHasAvailableStatus.filter( seat => seat.ProductId && seat.ProductId != productFactory.factoryId), 'Id');
                    currentSeats = _.unionBy(currentSeats, seatsHasAvailableStatus.filter(seat => seat.ProductId == productFactory.factoryId ), 'Id');
                  });
                }
                blockCapacity = <BlockCapacity>{
                  id: productFactory.factoryId,
                  title: productFactory.model.Product.get('Name', true),
                  availableSeats: availableSeats,
                  currentSeats: currentSeats,
                  currentCapacity: currentSeats.length,
                  availableCapacity: availableSeats.length,
                  totalCapacity: otherSeats.length + availableSeats.length,
                }
                blockCapacities.push(blockCapacity)
              });
            }
            venueBlockCapacity = {
              block: block,
              capacities:blockCapacities
            }
            this.venueBlockCapacities.push(venueBlockCapacity);
          });
        }
      });

      this.setProductSeats();
    }
  }

  setProductSeats() {
    if(this.multiplePerformanceService.basePerformanceFactory.productFactories) {
      let currentSeats: VenueEditorSeat[];
      let existBlockCapacity: BlockCapacity;
      this.multiplePerformanceService.basePerformanceFactory.productFactories.forEach( productFactory => {
        currentSeats = [];
        this.venueBlockCapacities.forEach( venueBlockCapacity => {
          existBlockCapacity = venueBlockCapacity.capacities.find( blockCapacity => blockCapacity.id == productFactory.factoryId);
          currentSeats = _.unionBy(currentSeats, existBlockCapacity.currentSeats, 'Id');
        });   
        productFactory.setSeats(currentSeats);
      });
      this.setStatistics();
    }
  }

  venueEditorEventHandler(event) {
    if(!this.selectedProductFactory) return;
    switch(event.type) {
      case VenueTemplateEditorComponent.EVENT_LAYOUT_READY:
      this.isLoading = false;
      this.selectSeatsByProduct().then( selectedSeats => {
        this.setVenueBlockCapacities(event.payload);
        if(this.basePerformanceFactory.productFactories) this.setSelectedProductFactory(this.basePerformanceFactory.productFactories[0]);
      });
      break;
      case VenueTemplateEditorComponent.EVENT_SELECT:
        this.selectedSeats = [];
        let lastSelectedItem: any;
        
        if(event.payload.length) {
          lastSelectedItem = event.payload[event.payload.length-1];
          switch(lastSelectedItem._type) {
            case VenueTemplateEditorComponent.TYPE_BLOCK:
              if(lastSelectedItem.IsStanding) this.openBlockCapacityBox(lastSelectedItem);
            break;
            case VenueTemplateEditorComponent.TYPE_SEAT:
              this.getVenueDataBySelectedProduct();
            break;
          }
        }else{
          this.getVenueDataBySelectedProduct();
        }
      break;
    };
    
  }

  getVenueDataBySelectedProduct() {
    this.venueTemplateEditor.getCurrentVenueData( payload => {
      this.setVenueBlockCapacities(payload)
      this.venueBlockCapacities.forEach( venueBlockCapacity => {
        if(venueBlockCapacity.capacities) {
          venueBlockCapacity.capacities.forEach( blockCapacity => {
            if(blockCapacity.id == this.selectedProductFactory.factoryId && blockCapacity.currentSeats) this.selectedSeats = _.unionBy(this.selectedSeats, blockCapacity.currentSeats, 'Id');
          });
        }
      });
    });
  }

  openBlockCapacityBox(venueBlock: any) {
    if(!this.venueBlockCapacities || !venueBlock) return;
    let component:ComponentRef<BlockCapacityBoxComponent> = this.resolver.resolveComponentFactory(BlockCapacityBoxComponent).create(this.injector);
    this.blockCapacityBoxComponent = component.instance;

    let venueBlockCapacity: VenueBlockCapacity = this.venueBlockCapacities.find( blockCapacity => blockCapacity.block.Id == venueBlock.Id);
    venueBlockCapacity.capacities.map( blockCapacity => blockCapacity.isActive = blockCapacity.id == this.selectedProductFactory.factoryId );
    this.blockCapacityBoxComponent.venueBlockCapacity = venueBlockCapacity;
    
    this.tetherService.modal(component, {
      escapeKeyIsActive: false,
    }).then(result => {
      try{
        let currentSeats: any[] = [];
        let availableSeats: any[] = [];
        result.capacities.forEach( blockCapacity => {
          currentSeats = currentSeats.concat( blockCapacity.availableSeats.splice(0, blockCapacity.currentCapacity));
          availableSeats = availableSeats.concat( blockCapacity.availableSeats );
        });
        currentSeats = currentSeats.concat(this.selectedSeats);
        let seatIds = this.venueTemplateEditor.getSeatIds(currentSeats);
        this.venueTemplateEditor.selectProductSeats([
          {productId: this.selectedProductFactory.factoryId, productColor: this.selectedProductFactory.model.CategoryColorSeat, seatIds: seatIds},
          {productId: null, productColor: "", seatIds: this.venueTemplateEditor.getSeatIds(availableSeats)}
        ]).then( selectResult => {
          this.venueTemplateEditor.setProduct(this.selectedProductFactory.factoryId, this.selectedProductFactory.model.CategoryColorSeat);
          let self = this;
          this.venueTemplateEditor.getCurrentVenueData(function(payload) {
            self.setVenueBlockCapacities(payload);
          })
        });
      }catch(e){ console.log(e)};
    }).catch( reason => {
        
    });
  }

  performanceProductSelectActionHandler(event) {
    let existProductFactory = this.multiplePerformanceService.basePerformanceFactory.getProductFactoryByModel(event.performanceProduct);
    if(existProductFactory) {
      let productId: number = existProductFactory.model.Product && existProductFactory.model.Product.Id ? existProductFactory.model.Product.Id : existProductFactory.factoryId;
      switch(event.action) {
        case "clearCapacity":
          this.venueTemplateEditor.selectProductSeats([{productId: null, productColor: '', seatIds: this.getSelectedSeatIds()}]);
          if(this.venueTemplateEditor) this.venueTemplateEditor.setProduct(existProductFactory.factoryId, existProductFactory.model.CategoryColorSeat);
        break;
      }
    }
  }
  
  performanceProductSelectChangeHandler(event) {
    this.setSelectedProductFactory(this.multiplePerformanceService.basePerformanceFactory.getProductFactoryByModel(event));
    let productId: number = this.selectedProductFactory.model.Product && this.selectedProductFactory.model.Product.Id ? this.selectedProductFactory.model.Product.Id : this.selectedProductFactory.factoryId;
    if(this.venueTemplateEditor) this.venueTemplateEditor.setProduct(this.selectedProductFactory.factoryId, this.selectedProductFactory.model.CategoryColorSeat);
  }

  setSelectedProductFactory(productFactory: ProductFactory) {
    this.selectedProductFactory = productFactory;
    if(this.venueTemplateEditor && this.selectedProductFactory) this.venueTemplateEditor.setProduct(this.selectedProductFactory.factoryId, this.selectedProductFactory.model.CategoryColorSeat);
  }

  submitEvent(event) {
    this.multiplePerformanceService.createPayload().then( result => {
      this.router.navigate(['/multiple-performance', 'create', 'performances']);
    }).catch( reason => console.log("error : ", reason));
  }

  private getSelectedSeatIds(selectedSeats?: any[]): number[] {
    if(!selectedSeats) selectedSeats = this.selectedSeats;
    if(!selectedSeats) return null;
    let ids: number [] = [];
    selectedSeats.forEach( seat => ids.push(seat['Id']));
    return ids;
  }

}
