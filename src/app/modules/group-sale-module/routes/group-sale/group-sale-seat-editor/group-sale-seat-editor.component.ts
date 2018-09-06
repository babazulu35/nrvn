import { CrmAnonymousUser } from './../../../../../models/crm-anonymous-user';
import { ReservationService } from './../../../../reservation-module/services/reservation.service';
import { SeatStatus } from './../../../../../models/seat-status.enum';
import { Performance } from './../../../../../models/performance';
import { GroupSaleService } from './../../../services/group-sale.service';
import { ProductBlockCapacity } from './../../../../common-module/components/product-block-capacity-statistics/product-block-capacity-statistics.component';
import { Component, OnInit, ViewChild, Injector, ComponentFactoryResolver, ChangeDetectorRef, ComponentRef } from '@angular/core';
import { VenueTemplateEditorComponent } from '../../../../common-module/components/venue-template-editor/venue-template-editor.component';
import { VenueEditorSeat } from '../../../../../models/venue-editor-seat';
import { VenueBlockCapacity, BlockCapacityBoxComponent } from '../../../../common-module/common/block-capacity-box/block-capacity-box.component';
import { SeatStatistics } from '../../../../../models/seat-statistics';
import { Subscription } from 'rxjs';
import { AppSettingsService } from '../../../../../services/app-settings.service';
import { Router } from '@angular/router';
import { TetherDialog } from '../../../../common-module/modules/tether-dialog/tether-dialog';
import { NotificationService } from '../../../../../services/notification.service';
import { BlockCapacity } from '../../../../common-module/components/block-capacity-list/block-capacity-list.component';
import * as _ from 'lodash';
import { VenueBlock } from '../../../../../models/venue-block';
import { SeatColors } from '../../../../../models/seat-colors';
import { CrmMemberService } from '../../../../../services/crm-member.service';
import { CrmAnonymousUserService } from '../../../../../services/crm-anonymous-user.service';
import { GroupSaleCreate } from '../../../models/group-sale-create';

@Component({
  selector: 'app-group-sale-seat-editor',
  templateUrl: './group-sale-seat-editor.component.html',
  styleUrls: ['./group-sale-seat-editor.component.scss'],
  entryComponents: [BlockCapacityBoxComponent],
  providers: [ReservationService, CrmMemberService, CrmAnonymousUserService]
})
export class GroupSaleSeatEditorComponent implements OnInit {
  @ViewChild(VenueTemplateEditorComponent) venueTemplateEditor: VenueTemplateEditorComponent;

  isLoading: boolean;
  performance: Performance;
  editorRole: string = "group_sales";

  groupSaleCreate: GroupSaleCreate;
  selectedSeats: VenueEditorSeat[] = [];
  venueBlockCapacities: VenueBlockCapacity[];
  blockCapacityBoxComponent: BlockCapacityBoxComponent;

  minSeatCount: number = 1;
  maxSeatCount: number = 0;

  productBlockCapacities: ProductBlockCapacity[];

  seatStatistics: SeatStatistics;
  statistics: {}[];

  colorModeIsProduct:boolean;
  reservationCodeBoxIsActive:boolean;

  performanceSubscription: Subscription;
  seatStatisticsSubscription: Subscription;
  groupSaleCreateSubscription: Subscription;

  private groupSaleFilterKey: string = "group-sale";

  get hasSelectedSeat(): boolean {
    return this.selectedSeats && this.selectedSeats.length > 0;
  }

  validation: {
    MinMaxValidation: { isValid: any, message: string }
	} = {
		MinMaxValidation: {
			message: 'Koltuk seçiminde gerekli kritleri sağlanmadı!',
			isValid():boolean {
        return (this.seatStatistics
          && (this.minSeatCount > 0 ? this.seatStatistics.selectedCount >= this.minSeatCount : true)
          && (this.maxSeatCount > 0 ? this.seatStatistics.selectedCount <= this.maxSeatCount : true))
			}
    }
	};

	get isValid():boolean {
    if( this.validation
      && this.validation.MinMaxValidation.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
  };

  get productBlockCapacitiesHasBlock(): ProductBlockCapacity[] {
    return this.productBlockCapacities ? this.productBlockCapacities.filter( productBlockCapacity => productBlockCapacity.blockSeats ? (productBlockCapacity.blockSeats.some( blockSeat => blockSeat.seatIds && blockSeat.seatIds.length > 0)) : false) : null;
  }

  constructor(
    private groupSaleService: GroupSaleService,
    private reservationService: ReservationService,
    private appSettingsService: AppSettingsService,
    private router:Router,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    public tetherService: TetherDialog,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef,
    private crmMemberService: CrmMemberService,
		private crmAnonymMemberService: CrmAnonymousUserService,
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.performanceSubscription = this.groupSaleService.performance$.subscribe( performance => {
      if(performance) {
        this.performance = performance;
        this.productBlockCapacities = [];
        this.performance.Products.forEach( performanceProduct => {
          this.productBlockCapacities.push({
            product: performanceProduct.Product,
            productId: performanceProduct.ProductId,
            productColor: performanceProduct.CategoryColorSeat,
            blockSeats: []
          });
        });
      }
    });

    this.groupSaleCreateSubscription = this.groupSaleService.groupSaleCreate$.subscribe( groupSaleCreate => {
      if(groupSaleCreate) this.groupSaleCreate = groupSaleCreate
    });

    this.seatStatisticsSubscription = this.groupSaleService.seatStatistics$.subscribe( seatStatistics => {
      this.seatStatistics = seatStatistics;
      this.setStatistics();
    });
  }

  ngOnDestroy() {
    if(this.performanceSubscription) this.performanceSubscription.unsubscribe();
    if(this.groupSaleCreateSubscription) this.groupSaleCreateSubscription.unsubscribe();
    if(this.seatStatisticsSubscription) this.seatStatisticsSubscription.unsubscribe();
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
      let alreadySelectedSeatIds: number[] = this.selectedSeats ? this.venueTemplateEditor.getSeatIds(this.selectedSeats) || [] : this.groupSaleService.getSeatIds();
      
      payload.Sections.forEach( section => {
        if(section && section.Blocks && section.Blocks.length) {
          section.Blocks.forEach( block => {
            blockCapacities = [];
            if(this.performance && this.performance.Products) {
              this.performance.Products.forEach( performanceProduct => {
                if(block.Rows) {
                  seatsHasAvailableStatus = [];
                  availableSeats = [];
                  currentSeats = [];
                  otherSeats = [];
                  totalCapacity = 0;
                  let filterKey = this.groupSaleFilterKey;

                  block.Rows.forEach( row => {
                    seatsHasAvailableStatus = _.unionBy(seatsHasAvailableStatus, row.Seats.filter( seat => seat.ProductId == performanceProduct.ProductId && (seat.Status == SeatStatus.Reserved || seat.Status == SeatStatus.OnSale || seat.Status == SeatStatus.Hold || seat.Status == SeatStatus.Pending)), 'Id');
                    availableSeats = _.unionBy(availableSeats, seatsHasAvailableStatus.filter( seat => !seat.FilterId || seat.FilterId == filterKey), 'Id');
                    otherSeats = _.unionBy(otherSeats, seatsHasAvailableStatus.filter( seat => seat.FilterId && seat.FilterId != filterKey), 'Id');
                    currentSeats = _.unionBy(currentSeats, seatsHasAvailableStatus.filter(seat => seat.FilterId == filterKey), 'Id');
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

      this.setGroupSaleSeats();
    }
  }

  setProductBlockCapacities(payload) {
    if(this.productBlockCapacities && payload && payload.Sections) {
      let existBlock: {block?: VenueBlock, seatIds?: number[]}
      let isProductInBlock:boolean;
      payload.Sections.forEach( section => {
        if(section.Blocks) section.Blocks.forEach( block => {
          let self = this;
          let blockHasProduct = _.some(block.Rows, function(item) {
            return item.Seats.some( seat => self.productBlockCapacities.some( reservationProduct => reservationProduct.productId == seat.ProductId));
          });
          this.productBlockCapacities.forEach( reservationProduct => {
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

  setGroupSaleSeats() {
    let currentSeats: VenueEditorSeat[];
    let existBlockCapacity: BlockCapacity;
    let existProductBlockCapacity: ProductBlockCapacity;
    currentSeats = [];
    this.venueBlockCapacities.forEach( venueBlockCapacity => {
      venueBlockCapacity.capacities.forEach( blockCapacity => {
        currentSeats = _.unionBy(currentSeats, blockCapacity.currentSeats, 'Id');
        if(this.productBlockCapacities) {
          this.productBlockCapacities.forEach( reservationProduct => {
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
    this.groupSaleService.setSeatsByVenueEditorSeats(currentSeats);
    this.setStatistics();
  }

  setSelectedSeatsByFilterId(filterId?: any) {
    this.venueTemplateEditor.getCurrentVenueData( payload => {
      // console.log(filterId, payload);
      this.setVenueBlockCapacities(payload)
      this.venueBlockCapacities.forEach( venueBlockCapacity => {
        if(venueBlockCapacity.capacities) {
          venueBlockCapacity.capacities.forEach( blockCapacity => {
            if(blockCapacity.filter == filterId) {
              this.selectedSeats = _.unionBy(this.selectedSeats, blockCapacity.currentSeats, 'Id');
            }
          });
        }
      });
    });
  }

  venueEditorEventHandler(event) {
    switch(event.type) {
      case VenueTemplateEditorComponent.EVENT_LAYOUT_READY:
        this.isLoading = false;
        this.venueTemplateEditor.setFilter(this.groupSaleFilterKey, this.groupSaleService.getSeatIds()).then( selectedSeats => this.setSelectedSeatsByFilterId(this.groupSaleFilterKey));
        this.setProductBlockCapacities(event.payload);
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
              this.setSelectedSeatsByFilterId(this.groupSaleFilterKey);
            break;
          }
        }else{
          this.setSelectedSeatsByFilterId(this.groupSaleFilterKey);
        }
      break;
    };
  }

  openBlockCapacityBox(venueBlock: any) {
    if(!this.venueBlockCapacities || !venueBlock) return;
    let component:ComponentRef<BlockCapacityBoxComponent> = this.resolver.resolveComponentFactory(BlockCapacityBoxComponent).create(this.injector);
    this.blockCapacityBoxComponent = component.instance;

    let venueBlockCapacity: VenueBlockCapacity = this.venueBlockCapacities.find( blockCapacity => blockCapacity.block.Id == venueBlock.Id);
    venueBlockCapacity.capacities.map( blockCapacity => blockCapacity.isActive = blockCapacity.filter == this.groupSaleFilterKey);
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
        let filterId: any = this.groupSaleFilterKey;
        this.venueTemplateEditor.selectFilterSeats([
          {filterId: filterId, seatIds: seatIds},
          {filterId: null, seatIds: this.venueTemplateEditor.getSeatIds(availableSeats)}
        ]).then( selectResult => {
          this.venueTemplateEditor.setFilter(filterId);
          this.setSelectedSeatsByFilterId(filterId)
        });
      }catch(e){ console.log(e)};
    }).catch( reason => {
        
    });
  }

  setStatistics() {
    if(!this.seatStatistics) return;
    this.statistics = [];
    let infoStatistics = [];
    if(this.seatStatistics.totalCapacityCount != null) infoStatistics.push({key: 'totalCapacityCount', label: 'TOPLAM KAPASİTE', value: this.seatStatistics.totalCapacityCount});
    if(this.seatStatistics.onSaleCount != null) infoStatistics.push({key: 'onSaleCount', label: 'SATIŞA AÇIK', value: this.seatStatistics.onSaleCount});
    this.seatStatistics.selectedCount = 0;
    this.seatStatistics.selectedCount = this.groupSaleService.seats ? this.groupSaleService.seats.length : 0;
    infoStatistics.push({key: 'selectedSeats', label: 'SEÇİLEN', value: this.seatStatistics.selectedCount});

    let statusStatistics = [];
    if(this.seatStatistics.soldCount != null) statusStatistics.push({color: SeatColors.SOLD, key: 'soldCount', label: 'SATIŞ', value: this.seatStatistics.soldCount});
    if(this.seatStatistics.blockedCount != null) statusStatistics.push({color: SeatColors.PENDING, key: 'blockedCount', label: 'SATIŞTA DEĞİL', value: this.seatStatistics.blockedCount});
    if(this.seatStatistics.canceledCount != null) statusStatistics.push({color: SeatColors.KILL, key: 'canceledCount', label: 'SATILAMAZ', value: this.seatStatistics.canceledCount});
    
    this.statistics = [infoStatistics, statusStatistics];
    if(this.seatStatistics.selectedCount > 0) this.reservationCodeBoxIsActive = false;
  }

  enterRezervationCode(event:any) {
    this.reservationCodeBoxIsActive = true;
  }

  reservationCodeActionHandler(event:any) {
    switch(event.action) {
      case "GetSeatsForGroupSale":
        this.getSeatsForGroupSale(event.value);
      break;
      case 'ReserReservationCode':
        this.groupSaleService.reset();
        let alreadySelectedSeatIds: number[] = this.selectedSeats ? this.venueTemplateEditor.getSeatIds(this.selectedSeats) || [] : this.groupSaleService.getSeatIds();
        this.venueTemplateEditor.selectFilterSeats([
          {filterId: null, seatIds: alreadySelectedSeatIds}
        ]).then( selectResult => {
          this.venueTemplateEditor.setFilter(this.groupSaleFilterKey);
          this.venueTemplateEditor.getCurrentVenueData(payload => {
            this.setVenueBlockCapacities(payload)
            console.log(payload);
          });
        });
        this.changeDetector.detectChanges();
      break;
    }
  }

  getSeatsForGroupSale(reservationCode: string){
    if(!this.performance) return;
    this.reservationService.getSeatsForGroupSale(reservationCode, this.performance.Id).subscribe( result => {
      if(result) {
        this.groupSaleService.groupSaleCreate.ReservationCode = reservationCode;
        let customer = new CrmAnonymousUser();
        if(result.CrmMemberId) {
          customer.CrmMemberId = result.CrmMemberId;
          this.crmMemberService.getMemberFromID(customer.CrmMemberId).subscribe( customerResult => {		
            if(customerResult) {
              customer.FirstName = customerResult.EntityModel.Name;
              customer.LastName = customerResult.EntityModel.Surname;
              customer.PhoneNumber = customerResult.EntityModel.PhoneNumber;
              this.groupSaleService.setCustomer(customer);
            }
          })
        }else if(result.AnonymousMemberId) {
          customer.AnonymousMemberId = result.AnonymousMemberId;
          this.crmAnonymMemberService.getById(customer.AnonymousMemberId).subscribe(customerResult => {		
            customer.PhoneNumber = customerResult.PhoneNumber;
            this.groupSaleService.setCustomer(customer);
          });
        }

        let seatIds: number[] = [];
        if(result.SeatIdList && result.SeatIdList.length) {
          result.SeatIdList.forEach( seatId => seatIds.push(seatId));
          this.venueTemplateEditor.selectFilterSeats([{filterId: this.groupSaleFilterKey, seatIds: seatIds}]).then( result => {
            this.venueTemplateEditor.setFilter(this.groupSaleFilterKey);
            this.notificationService.add({type: 'success', text: 'İlgili rezervasyon koduyla koltuk seçimleri yapılmıştır'});
          });
        }else{
          this.notificationService.add({type: 'danger', text: 'İlgili rezervasyon kodu için koltuk bilgisi bulunamadı.'});
        }


      }
    }, error => {
      this.notificationService.add({type: 'danger', text: error.Message || "Bilinmeyen bir hata oluştu."});
    });;
  }

  submitClickHandler(event) {
    this.groupSaleService.setProductBlockCapacities(this.productBlockCapacities);
    this.groupSaleService.createPayload().then( payload => {
      this.router.navigate(['/performance', this.performance.Id, 'group-sale', 'settings']);
    });
  }

}
