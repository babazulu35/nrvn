import { EntityService } from './../../../../../../../services/entity.service';
import { CustomerCapacity } from './../../../components/customer-capacity-select-list/customer-capacity-select-list.component';
import { ReservationCreateRoles } from './../../../models/reservation-create-roles';
import { VenueBlock } from './../../../../../../../models/venue-block';
import { VenueSeat } from './../../../../../../../models/venue-seat';
import { BlockCapacity } from './../../../../../../common-module/components/block-capacity-list/block-capacity-list.component';
import { PerformanceProduct } from './../../../../../../../models/performance-product';
import { BlockCapacityBoxComponent, VenueBlockCapacity } from './../../../../../../common-module/common/block-capacity-box/block-capacity-box.component';
import { VenueEditorSeat } from './../../../../../../../models/venue-editor-seat';
import { ReservationProduct } from './../../../models/reservation-product';
import { Performance } from './../../../../../../../models/performance';
import { Component, OnInit, ChangeDetectorRef, HostBinding, ViewChild, Injector, ComponentFactoryResolver, ComponentRef, Inject } from '@angular/core';
import { ReservationCreateService } from '../../../reservation-create.service';
import { SeatStatistics } from './../../../../../../../models/seat-statistics';
import { Router } from '@angular/router';
import { ReservationCreateRole } from '../../../models/reservation-create-role';
import { ReservationCreate } from '../../../models/reservation-create';
import { CrmAnonymousUser } from '../../../../../../../models/crm-anonymous-user';
import { VenueTemplateEditorComponent } from '../../../../../../common-module/components/venue-template-editor/venue-template-editor.component';
import { AppSettingsService } from '../../../../../../../services/app-settings.service';
import { TetherDialog } from '../../../../../../common-module/modules/tether-dialog/tether-dialog';
import { NotificationService } from '../../../../../../../services/notification.service';
import * as _ from 'lodash';
import { Seat } from '../../../../../../../models/seat';
import { ReservationSeat } from '../../../models/reservation-seat';
import { cloneDeep } from 'lodash';
import { Product } from '../../../../../../../models/product';
import { SeatStatus } from '../../../../../../../models/seat-status.enum';
import { Subscription } from 'rxjs';
import { CustomerFactory } from '../../../factories/customer.factory';

@Component({
  selector: 'app-reservation-create-seat-editor',
  templateUrl: './reservation-create-seat-editor.component.html',
  styleUrls: ['./reservation-create-seat-editor.component.scss'],
  entryComponents: [BlockCapacityBoxComponent]
})
export class ReservationCreateSeatEditorComponent implements OnInit {
  @HostBinding('class.or-reservation-create-seat-editor') true;
  @ViewChild(VenueTemplateEditorComponent) venueTemplateEditor: VenueTemplateEditorComponent;

  isLoading: boolean;

  role: ReservationCreateRole;
  performance: Performance;
  reservationCreate: ReservationCreate;

  customerCapacities: CustomerCapacity[];
  selectedCustomerCapacity: CustomerCapacity;
  selectedCustomerFactory: CustomerFactory;
  
  selectedSeats: VenueEditorSeat[] = [];
  venueBlockCapacities: VenueBlockCapacity[];
  blockCapacityBoxComponent: BlockCapacityBoxComponent;
  
  reservationProducts: ReservationProduct[];
  selectedReservationProduct: ReservationProduct;

  seatStatistics: SeatStatistics;
  statistics: {}[];
  infoStatistics: {}[];

  minCustomerCount: number = 0;
  maxCustomerCount: number = 0;
  minSeatCount: number = 1;
  maxSeatCount: number = 0;
  matchSeatsAndCustomers: boolean;

  colorModeIsProduct:boolean;

  currentRoleSubscription: Subscription;
  performanceSubscription: Subscription;
  customerFactoriesSubscription: Subscription;
  seatStatisticsSubscription: Subscription;
  venueEditorSubscription: Subscription;

  private poolFilterKey: string = "pool";

  get hasSelectedSeat(): boolean {
    return this.selectedSeats && this.selectedSeats.length > 0;
  }

  validation: {
    MinMaxValidation: { isValid: any, message: string },
    SeatCountPerCustomerValidation: { isValid: any, message: string },
	} = {
		MinMaxValidation: {
			message: 'Koltuk seçiminde gerekli kritleri sağlanmadı!',
			isValid():boolean {
        return (this.seatStatistics
          && (this.minSeatCount > 0 ? this.seatStatistics.selectedCount >= this.minSeatCount : true)
          && (this.maxSeatCount > 0 ? this.seatStatistics.selectedCount <= this.maxSeatCount : true))
			}
    },
    SeatCountPerCustomerValidation: {
			message: 'Koltuk seçiminde gerekli kritleri sağlanmadı!',
			isValid():boolean {
        if(this.role == ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION) {
          // return this.seatStatistics.selectedCount >= this.reservationCreate.SeatCountPerCustomer &&
          //   this.seatStatistics.selectedCount % this.reservationCreate.SeatCountPerCustomer == 0 &&
          //   this.seatStatistics.selectedCount <= this.reservationCreate.SeatCountPerCustomer*this.reservationCreateService.customerFactories.length
          return this.seatStatistics.selectedCount % this.reservationCreate.SeatCountPerCustomer == 0;
        }else{
          return true;
        }
			}
    }
	};

	get isValid():boolean {
    if( this.validation
      && this.validation.MinMaxValidation.isValid.call(this)
			&& this.validation.SeatCountPerCustomerValidation.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
  };

  get reservationProductsHasBlock(): ReservationProduct[] {
    return this.reservationProducts ? this.reservationProducts.filter( reservationProduct => reservationProduct.blockSeats ? (reservationProduct.blockSeats.some( blockSeat => blockSeat.seatIds && blockSeat.seatIds.length > 0)) : false) : null;
  }

  constructor(
    public reservationCreateService: ReservationCreateService,
    private appSettingsService: AppSettingsService,
    private router:Router,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    public tetherService: TetherDialog,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef
  ) { 
    this.seatStatistics = this.reservationCreateService.seatStatistics;
  }

  ngOnInit() {
    this.isLoading = true;
    this.currentRoleSubscription = this.reservationCreateService.currentRole$.subscribe( role => {
      if(role) {
        this.role = role;
        this.reservationCreate = this.reservationCreateService.reservationCreate;
      }

      this.performanceSubscription = this.reservationCreateService.performance$.subscribe( performance => {
        console.log(performance);
        if(performance) {
          this.performance = performance;
          
          if(this.role == ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION) {
            this.reservationProducts = [];
            this.performance.Products.forEach( performanceProduct => {
              this.reservationProducts.push({
                product: performanceProduct.Product,
                productId: performanceProduct.ProductId,
                productColor: performanceProduct.CategoryColorSeat,
                blockSeats: []
              });
            });
          }else{
  
          }
        }
        this.changeDetector.detectChanges();
      });
  
      this.customerFactoriesSubscription = this.reservationCreateService.customerFactories$.subscribe ( customerFactories => {
        if(customerFactories) {
          if(this.role != ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION) {
            this.customerCapacities = [];
            customerFactories.forEach( customerFactory => this.customerCapacities.push({
              id: customerFactory.factoryId,
              customer: customerFactory.model,
              capacity: customerFactory.seats ? customerFactory.seats.length : 0,
            }));
            // if(!this.selectedCustomerCapacity && this.customerCapacities) this.setSelectedCustomerCapacity(this.customerCapacities[0]);
          }else {
            this.customerCapacities = null;
            this.minSeatCount = this.reservationCreate.SeatCountPerCustomer;
            this.maxSeatCount = customerFactories.length * this.reservationCreate.SeatCountPerCustomer;
          }
        }
          
      });
  
      this.seatStatisticsSubscription = this.reservationCreateService.seatStatistics$.subscribe( statistics => {
        if(statistics) {
          this.setStatistics();
        }
      });
  
      this.venueEditorSubscription = this.reservationCreateService.venueEditorSeats$.subscribe( venueEditorSeats => {
        if(venueEditorSeats) {
          // this.selectedSeats = venueEditorSeats.filter( seat => seat.IsStanding === false );
          this.setCapacity(venueEditorSeats);
        }
      });
    });
  }

  ngOnDestroy() {
    if(this.currentRoleSubscription) this.currentRoleSubscription.unsubscribe();
    if(this.performanceSubscription) this.performanceSubscription.unsubscribe();
    if(this.customerFactoriesSubscription) this.customerFactoriesSubscription.unsubscribe();
    if(this.seatStatisticsSubscription) this.seatStatisticsSubscription.unsubscribe();
    if(this.venueEditorSubscription) this.venueEditorSubscription.unsubscribe();
  }

  setEditorCustomers(){
    if(this.reservationCreateService.customerFactories) {
      let payload: {customerId: number, seatIds?: number[]}[] = [];
      let seatIds: number[];
      let csvItems: {customer: CrmAnonymousUser, vSeatId: number}[];
      this.reservationCreateService.customerFactories.forEach( customerFactory => {
        if(this.reservationCreateService.customerCsv) {
          seatIds = [];
          csvItems = this.reservationCreateService.customerCsv.payload.filter( payloadItem => payloadItem.customer.PhoneNumber == customerFactory.model.PhoneNumber );
          if(csvItems) csvItems.forEach( csvItem => {
            if(csvItem.vSeatId) seatIds.push(csvItem.vSeatId)
          });
        }else{
          seatIds = customerFactory.getSeatIds();
        }
        payload.push({
          customerId: customerFactory.factoryId,
          seatIds: seatIds
        });
      });
      if(csvItems && csvItems.length) {
        this.venueTemplateEditor.selectCustomerSeats(payload, 'VSeatId')
      }else{
        this.venueTemplateEditor.selectCustomerSeats(payload)
      }
      if(this.selectedCustomerCapacity) this.venueTemplateEditor.setCustomer(this.selectedCustomerCapacity.id);
    }
  }

  selectSeatsByCustomers(): Promise<any> {
    if(this.reservationCreateService.customerFactories) {
      let payload: {customerId: number, seatIds?: number[]}[] = [];
      let targetProp: string;
      this.reservationCreateService.customerFactories.forEach( customerFactory => {
        let seatIds: number[] = [];
        if(this.reservationCreateService.customerCsv && !this.reservationCreateService.customerCsvUsedOnce){
          this.reservationCreateService.customerCsvUsedOnce = true;
          targetProp = "VSeatId";
          let csvItems: {customer: CrmAnonymousUser, vSeatId: number}[] = [];
          seatIds = [];
          csvItems = this.reservationCreateService.customerCsv.payload.filter( payloadItem => payloadItem.customer.PhoneNumber == customerFactory.model.PhoneNumber );
          if(csvItems) csvItems.forEach( csvItem => {
            if(csvItem.vSeatId) seatIds.push(csvItem.vSeatId)
          });
        }else{
          seatIds = customerFactory.getSeatIds();
        }
        payload.push({
          customerId: customerFactory.factoryId,
          seatIds: seatIds
        })
      });

      return this.venueTemplateEditor.selectCustomerSeats(payload, targetProp);
    }else{
      return Promise.resolve(null);
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
      let alreadySelectedSeatIds: number[] = this.selectedSeats ? this.venueTemplateEditor.getSeatIds(this.selectedSeats) || [] : this.reservationCreateService.getSeatIds();
      
      payload.Sections.forEach( section => {
        if(section && section.Blocks && section.Blocks.length) {
          section.Blocks.forEach( block => {
            blockCapacities = [];
            if(this.performance && this.performance.Products) {
              this.performance.Products.forEach( performanceProduct => {
                if(block.Rows) {
                  switch(this.role) {
                    case ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION:
                      seatsHasAvailableStatus = [];
                      availableSeats = [];
                      currentSeats = [];
                      otherSeats = [];
                      totalCapacity = 0;
                      let filterKey = this.poolFilterKey;

                      block.Rows.forEach( row => {
                        seatsHasAvailableStatus = _.unionBy(seatsHasAvailableStatus, row.Seats.filter( seat => seat.ProductId == performanceProduct.ProductId &&  (seat.Status == SeatStatus.OnSale || seat.Status == SeatStatus.Pending || seat.Status == SeatStatus.Hold)), 'Id');
                        availableSeats = _.unionBy(availableSeats, seatsHasAvailableStatus.filter( seat => !seat.CustomerId || seat.CustomerId == filterKey), 'Id');
                        otherSeats = _.unionBy(otherSeats, seatsHasAvailableStatus.filter( seat => seat.CustomerId && seat.CustomerId != filterKey), 'Id');
                        currentSeats = _.unionBy(currentSeats, seatsHasAvailableStatus.filter(seat => seat.CustomerId == filterKey), 'Id');
                      });

                      blockCapacity = <BlockCapacity>{
                        id: performanceProduct.ProductId,
                        title: performanceProduct.Product.Localization.Name,
                        filter: filterKey,
                        availableSeats: availableSeats,
                        currentSeats: currentSeats,
                        currentCapacity: currentSeats.length,
                        availableCapacity: availableSeats.length,
                        totalCapacity: otherSeats.length + availableSeats.length,
                      }
                      if(blockCapacity) blockCapacities.push(blockCapacity)
                    break;
                    default:
                      if(this.customerCapacities) {
                        this.reservationCreateService.customerFactories.forEach( customerFactory => {
                          seatsHasAvailableStatus = [];
                          availableSeats = [];
                          currentSeats = [];
                          otherSeats = [];
                          totalCapacity = 0;

                          block.Rows.forEach( row => {
                            seatsHasAvailableStatus = _.unionBy(seatsHasAvailableStatus, row.Seats.filter( seat => seat.ProductId == performanceProduct.ProductId &&  (seat.Status == SeatStatus.OnSale || seat.Status == SeatStatus.Pending || seat.Status == SeatStatus.Hold)), 'Id');
                            availableSeats = _.unionBy(availableSeats, seatsHasAvailableStatus.filter( seat => !seat.CustomerId || seat.CustomerId == customerFactory.factoryId), 'Id');
                            otherSeats = _.unionBy(otherSeats, seatsHasAvailableStatus.filter( seat => seat.CustomerId && seat.CustomerId != customerFactory.factoryId), 'Id');
                            currentSeats = _.unionBy(currentSeats, seatsHasAvailableStatus.filter(seat => seat.CustomerId == customerFactory.factoryId), 'Id');
                          });
                          blockCapacity = <BlockCapacity>{
                            id: performanceProduct.ProductId,
                            title: performanceProduct.Product.Localization.Name,
                            filter: customerFactory.factoryId,
                            availableSeats: availableSeats,
                            currentSeats: currentSeats,
                            currentCapacity: currentSeats.length,
                            availableCapacity: availableSeats.length,
                            totalCapacity: otherSeats.length + availableSeats.length,
                          }
                          if(blockCapacity) blockCapacities.push(blockCapacity)
                        });
                      }
                    break;
                  }
                }
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

      this.setReservationSeats();
    }
  }

  setSelectedSeatsByCustomerId(customerId?: any) {
    this.venueTemplateEditor.getCurrentVenueData( payload => {
      this.setVenueBlockCapacities(payload)
      this.venueBlockCapacities.forEach( venueBlockCapacity => {
        if(venueBlockCapacity.capacities) {
          venueBlockCapacity.capacities.forEach( blockCapacity => {
            if(blockCapacity.filter == customerId) {
              this.selectedSeats = _.unionBy(this.selectedSeats, blockCapacity.currentSeats, 'Id');
            }
          });
        }
      });
    });
  }

  setReservationSeats() {
    let currentSeats: VenueEditorSeat[];
    let existBlockCapacity: BlockCapacity;
    switch(this.role) {
      case ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION:
        let existReservationProduct: ReservationProduct;
        let existBlockSeat: {block?: VenueBlock, seatIds?: number[]};
        currentSeats = [];
        this.venueBlockCapacities.forEach( venueBlockCapacity => {
          venueBlockCapacity.capacities.forEach( blockCapacity => {
            currentSeats = _.unionBy(currentSeats, blockCapacity.currentSeats, 'Id');
            if(this.reservationProducts) {
              this.reservationProducts.forEach( reservationProduct => {
                if(reservationProduct.productId == blockCapacity.id) {
                  reservationProduct.blockSeats.forEach( blockSeat => {
                    if(blockSeat.block.Id == venueBlockCapacity.block.Id) {
                      blockSeat.seatIds = this.venueTemplateEditor.getSeatIds(blockCapacity.currentSeats);
                    }
                  })
                }
              })
            }
          });
        });
        this.reservationCreateService.setSeatsByVenueEditorSeats(currentSeats);
      break;
      default:
        if(this.customerCapacities) {
          let existCustomerCapacity: CustomerCapacity;
          this.reservationCreateService.customerFactories.forEach( customerFactory => {
            currentSeats = [];
            this.venueBlockCapacities.forEach( venueBlockCapacity => {
              venueBlockCapacity.capacities.forEach( blockCapacity => {
                if(blockCapacity.filter == customerFactory.factoryId) {
                  currentSeats = _.unionBy(currentSeats, blockCapacity.currentSeats, 'Id');
                }
              })
            });
            customerFactory.setSeatsByVenueEditorSeats(currentSeats);
            existCustomerCapacity = this.customerCapacities.find( customerCapacity => customerCapacity.id == customerFactory.factoryId);
            if(existCustomerCapacity) existCustomerCapacity.capacity = currentSeats.length;
          });
        }
      break;
    };
    this.setStatistics();
  }
  
  setReservationProductCapacities(payload) {
    if(this.reservationProducts && payload && payload.Sections) {
      let existReservationProduct: ReservationProduct;
      let existBlock: {block?: VenueBlock, seatIds?: number[]}
      let isProductInBlock:boolean;
      payload.Sections.forEach( section => {
        if(section.Blocks) section.Blocks.forEach( block => {
          let self = this;
          let blockHasProduct = _.some(block.Rows, function(item) {
            return item.Seats.some( seat => self.reservationProducts.some( reservationProduct => reservationProduct.productId == seat.ProductId));
          });
          this.reservationProducts.forEach( reservationProduct => {
            isProductInBlock = block.Rows.some( row => row.Seats.some( seat => seat.ProductId == reservationProduct.productId));
            if(isProductInBlock) {
              existBlock = reservationProduct.blockSeats.find( blockSeat => blockSeat.block.Id == block.Id);
              if(!existBlock) {
                existBlock = {block: block, seatIds: []};
                reservationProduct.blockSeats.push(existBlock);
              }
            }
          });
        });
      });
    }
  }

  venueEditorEventHandler(event) {
    switch(event.type) {
      case VenueTemplateEditorComponent.EVENT_LAYOUT_READY:
        this.isLoading = false;
        switch(this.role) {
          case ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION:
            this.venueTemplateEditor.setCustomer(this.poolFilterKey, this.reservationCreateService.getSeatIds()).then( selectedSeats => this.setSelectedSeatsByCustomerId(this.poolFilterKey));
          break;
          default:
            this.selectSeatsByCustomers().then( selectedSeats => {
              if(this.customerCapacities) this.setSelectedCustomerCapacity(this.customerCapacities[0]);
              if(this.selectedCustomerFactory) this.setSelectedSeatsByCustomerId(this.selectedCustomerFactory.factoryId);
            });
          break;
        }
        this.setReservationProductCapacities(event.payload);
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
            switch(this.role) {
              case ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION:
                this.setSelectedSeatsByCustomerId(this.poolFilterKey);
              break;
              default:
                if(this.selectedCustomerFactory) this.setSelectedSeatsByCustomerId(this.selectedCustomerFactory.factoryId);
              break;
            }
            break;
          }
        }else{
          switch(this.role) {
            case ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION:
              this.setSelectedSeatsByCustomerId(this.poolFilterKey);
            break;
            default:
              if(this.selectedCustomerFactory) this.setSelectedSeatsByCustomerId(this.selectedCustomerFactory.factoryId);
            break;
          }
        }
      break;
      // case VenueTemplateEditorComponent.EVENT_SELECT_LAST:
      //   if(!event.payload.selected && event.payload.target._type == VenueTemplateEditorComponent.TYPE_SEAT && this.selectedSeats.length == 1) {
      //     switch(this.role) {
      //       case ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION:
      //         this.setSelectedSeatsByCustomerId(this.poolFilterKey);
      //       break;
      //       default:
      //         if(this.selectedCustomerFactory) this.setSelectedSeatsByCustomerId(this.selectedCustomerFactory.factoryId);
      //       break;
      //     }
      //   }
      // break;
    };
  }

  openBlockCapacityBox(venueBlock: any) {
    if(!this.venueBlockCapacities || !venueBlock) return;
    let component:ComponentRef<BlockCapacityBoxComponent> = this.resolver.resolveComponentFactory(BlockCapacityBoxComponent).create(this.injector);
    this.blockCapacityBoxComponent = component.instance;

    let venueBlockCapacity: VenueBlockCapacity = this.venueBlockCapacities.find( blockCapacity => blockCapacity.block.Id == venueBlock.Id);
    switch(this.role) {
      case ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION:
        venueBlockCapacity.capacities.map( blockCapacity => blockCapacity.isActive = blockCapacity.filter == this.poolFilterKey);
      break;
      default:
        if(this.selectedCustomerFactory) venueBlockCapacity.capacities.map( blockCapacity => blockCapacity.isActive = blockCapacity.filter == this.selectedCustomerFactory.factoryId);
      break;
    }
    this.blockCapacityBoxComponent.venueBlockCapacity = venueBlockCapacity;
    
    this.tetherService.modal(component, {
      escapeKeyIsActive: false,
      outsideClickIsActive: false,
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
        let customerId: any;
        switch(this.role) {
          case ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION:
            customerId = this.poolFilterKey;
          break;
          default:
            customerId = this.selectedCustomerFactory.factoryId;
          break;
        }
        this.venueTemplateEditor.selectCustomerSeats([
          {customerId: customerId, seatIds: seatIds},
          {customerId: null, seatIds: this.venueTemplateEditor.getSeatIds(availableSeats)}
        ]).then( selectResult => {
          this.venueTemplateEditor.setCustomer(customerId);
          this.setSelectedSeatsByCustomerId(customerId)
        });
      }catch(e){ console.log(e)};
    }).catch( reason => {
        
    });
  }

  customerCapacitySelectChangeHandler(event) {
    this.reservationCreateService.setVenueEditorSeats(null);
    this.setSelectedCustomerCapacity(this.customerCapacities.find( customerCapacity => customerCapacity.id == event.id));
  }

  setSelectedCustomerCapacity(customerCapacity: CustomerCapacity) {
    this.selectedCustomerCapacity = customerCapacity;
    if(this.selectedCustomerCapacity) this.selectedCustomerFactory = this.reservationCreateService.getCustomerFactoryById(this.selectedCustomerCapacity.id);
    if(this.venueTemplateEditor && this.selectedCustomerCapacity) this.venueTemplateEditor.setCustomer(this.selectedCustomerCapacity.id);
  }

  backClickHandler(event:any) {
    if(!this.performance) return;
    this.router.navigate(['/performance', this.performance.Id, this.role.parentRoutePath, 'create', this.reservationCreateService.currentRole.path]);
  }

  setVenueEditorSeats() {
    let oldSeatIds = this.reservationCreateService.getVenueEditorSeatIds();
    let venueEditorSeats: VenueEditorSeat[] = [];
    
    if(this.selectedSeats) {
      let venueEditorSeat: VenueEditorSeat;
      this.selectedSeats.forEach( item => {
        venueEditorSeat = cloneDeep(item);
        Object.keys(venueEditorSeat).forEach( key => {
          if(key.substr(0, 1)=="_") delete venueEditorSeat[key];
        });
        venueEditorSeats.push(venueEditorSeat);
      });
    }
    
    if(this.venueBlockCapacities) {
      this.venueBlockCapacities.forEach( venueBlockCapacity => {
        if(venueBlockCapacity.capacities) {
          venueBlockCapacity.capacities.forEach( blockCapacity => {
            if(blockCapacity.currentSeats && blockCapacity.currentSeats.length) venueEditorSeats = venueEditorSeats.concat(blockCapacity.currentSeats.filter( seat => seat.IsStanding));
          })
        }
      });
    }
    if(this.maxSeatCount > 0 && venueEditorSeats.length > this.maxSeatCount) {
      this.notificationService.add({type: "danger", text: `Maksimum ${this.maxSeatCount} koltuk seçebilirsiniz. ${venueEditorSeats.length} koltuk seçtiniz.`});
      this.venueTemplateEditor.selectSeats(null);
      this.venueTemplateEditor.selectSeats(oldSeatIds);
    }else{
      this.reservationCreateService.setVenueEditorSeats(venueEditorSeats, this.selectedCustomerCapacity ? this.selectedCustomerCapacity.customer : null);
    }
  }

  setCapacity(venueEditorSeats?: VenueEditorSeat[], venueBlockCapacities?:VenueBlockCapacity[] ) {
    if(!venueEditorSeats) venueEditorSeats = this.reservationCreateService.venueEditorSeats;
    if(!venueBlockCapacities) venueBlockCapacities = this.venueBlockCapacities;
    try{
      if(this.reservationProducts) {
        let existReservationProduct: ReservationProduct;
        let existBlock: {block?: VenueBlock, seatIds?: number[]};
        let existCustomerCapacity: CustomerCapacity;
        this.reservationProducts.forEach( reservationProduct => reservationProduct.blockSeats.forEach( blockSeat => blockSeat.seatIds = []));

        if(venueEditorSeats) {  
            venueEditorSeats.forEach( venueEditorSeat => {
              existReservationProduct = this.reservationProducts.find( reservationProduct => reservationProduct.productId == venueEditorSeat.ProductId );
              if(existReservationProduct) {
                existBlock = existReservationProduct.blockSeats.find( blockSeat => blockSeat.block.Rows.some( row => row.Id == venueEditorSeat.RowId ));
                if(existBlock && existBlock.seatIds) existBlock.seatIds.push(venueEditorSeat.Id);
              }
            });
        }
      }
    }catch(e){ console.log(e)};
    
    if(this.customerCapacities) {
      let existCustomerCapacity: CustomerCapacity;
      let existCustomerFactory: CustomerFactory;
      let existBlock: {block?: VenueBlock, seatIds?: number[]};

      this.customerCapacities.forEach( customerCapacity => {
        existCustomerFactory = this.reservationCreateService.getCustomerFactoryById(customerCapacity.id);
        if(existCustomerFactory) customerCapacity.capacity = existCustomerFactory.seats ? existCustomerFactory.seats.length : 0;
      });
    }
    
    this.setStatistics();
    this.changeDetector.detectChanges();
  }

  setStatistics() {
    this.statistics = [];
    let infoStatistics = [];
    if(this.seatStatistics.totalCapacityCount != null) infoStatistics.push({key: 'totalCapacityCount', label: 'TOPLAM KAPASİTE', value: this.seatStatistics.totalCapacityCount});
    if(this.seatStatistics.onSaleCount != null) infoStatistics.push({key: 'onSaleCount', label: 'SATIŞA AÇIK', value: this.seatStatistics.onSaleCount});
    this.seatStatistics.selectedCount = 0;
    switch(this.role) {
      case ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION:
      this.seatStatistics.selectedCount = this.reservationCreateService.seats ? this.reservationCreateService.seats.length : 0;
      break;
      default:
        if(this.reservationCreateService.customerFactories) this.reservationCreateService.customerFactories.forEach( customerFactory => this.seatStatistics.selectedCount += customerFactory.seats ? customerFactory.seats.length : 0);
      break;
    }
    // this.remainingCapacityCount = this.totalCapacityCount - totalSelectedSeatsLength;
    // if(this.remainingCapacityCount < 0) this.remainingCapacityCount = 0;
    infoStatistics.push({key: 'selectedSeats', label: 'SEÇİLEN', value: this.seatStatistics.selectedCount});
    this.statistics = [infoStatistics];
  }

  inputChangeHandler(event, name: string, target?:any) {
    if(!target) target = this;
    switch(name) {
      case "colorModeIsProduct":
        this.colorModeIsProduct = event;
        if(this.colorModeIsProduct) {
          this.venueTemplateEditor.changeColorMode("seatColor");
        }else{
          this.venueTemplateEditor.changeColorMode(null);
        }
      break;
      default:
        target[name] = event;
      break;
    }
    this.changeDetector.detectChanges();
  }

  addAvailableSeats() {
    let venueEditorSeats: VenueEditorSeat[] = [];
    if(this.venueBlockCapacities) {
      this.venueBlockCapacities.forEach( venueBlockCapacity => {
        if(venueBlockCapacity.capacities) {
          venueBlockCapacity.capacities.forEach( blockCapacity => {
            venueEditorSeats = venueEditorSeats.concat(blockCapacity.availableSeats);
          });
        }
      });
    }
    if(this.selectedCustomerFactory) this.venueTemplateEditor.setCustomer(this.selectedCustomerFactory.factoryId, this.venueTemplateEditor.getSeatIds(venueEditorSeats));
  }

  submitClickHandler(event) {
    this.isLoading = true;
    this.reservationCreateService.createReservation().then( result => {
      this.isLoading = false;
      this.notificationService.add({type: 'success', text: this.reservationCreateService.currentRole.dictionary["title"]["main"] + " başarıyla oluşturuldu"});
      this.router.navigate(["/performance", this.performance.Id, this.role.parentRoutePath]);
    }).catch( error => {
      this.isLoading = false;
      this.notificationService.add({type: 'danger', text: "HATA: "+error.Message});
    });
  }

}
