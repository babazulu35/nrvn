import { Performance } from './../../../models/performance';
import { GroupSaleSeat } from './../models/group-sale-seat';
import { CrmAnonymousUser } from './../../../models/crm-anonymous-user';
import { GroupSaleCreate } from './../models/group-sale-create';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SeatStatistics } from '../../../models/seat-statistics';
import { AuthenticationService } from '../../../services/authentication.service';
import { BaseDataService } from '../../../classes/base-data-service';
import { Http } from '@angular/http';
import { VenueEditorSeat } from '../../../models/venue-editor-seat';
import { ProductBlockCapacity } from '../../common-module/components/product-block-capacity-statistics/product-block-capacity-statistics.component';

@Injectable()
export class GroupSaleService extends BaseDataService {

  performance: Performance;
  performance$: BehaviorSubject<Performance> = new BehaviorSubject(null);

  groupSaleCreate: GroupSaleCreate;
  groupSaleCreate$: BehaviorSubject<GroupSaleCreate> = new BehaviorSubject(null);;

  customer: CrmAnonymousUser;
  customer$: BehaviorSubject<CrmAnonymousUser> = new BehaviorSubject(null);

  seats: GroupSaleSeat[];
  seats$: BehaviorSubject<GroupSaleSeat[]> = new BehaviorSubject(null);

  seatStatistics: SeatStatistics;
  seatStatistics$: BehaviorSubject<SeatStatistics> = new BehaviorSubject(null);

  productBlockCapacities: ProductBlockCapacity[];
  productBlockCapacities$: BehaviorSubject<ProductBlockCapacity[]> = new BehaviorSubject(null);
  
  constructor(http: Http, authenticationService: AuthenticationService) { 
    super(http, 'PProduct', null, authenticationService);
    
    this.setGroupSaleCreate(new GroupSaleCreate());
    this.seatStatistics = {};
  }

  set(key: string, value: any) {
    this.groupSaleCreate[key] = value;
  }

  get(key): any {
    return this.groupSaleCreate[key];
  }

  setGroupSaleCreate(groupSaleCreate: GroupSaleCreate) {
    this.groupSaleCreate = new GroupSaleCreate();
    if(this.performance) this.groupSaleCreate.PerformanceId = this.performance.Id;
    this.groupSaleCreate$.next(this.groupSaleCreate);
  }

  setSeatStatistic(key: string, value: number) {
    this.seatStatistics[key] = value;
    this.seatStatistics$.next(this.seatStatistics);
  }

  setPerformance(performance:Performance): Performance {
    this.performance = performance;
    if(this.performance && this.performance.Id) this.groupSaleCreate.PerformanceId = this.performance.Id;
    this.performance$.next(this.performance);
    console.log(this.performance);
    return this.performance;
  }

  setCustomer(customer:CrmAnonymousUser): CrmAnonymousUser {
    this.customer = customer;
    this.customer$.next(this.customer);
    return this.customer;
  }

  setSeats(seats: GroupSaleSeat[]) {
    this.seats = seats;
    this.seats$.next(this.seats);
  }

  setProductBlockCapacities(productBlockCapacities: ProductBlockCapacity[]) {
    this.productBlockCapacities = productBlockCapacities;
    this.productBlockCapacities$.next(this.productBlockCapacities);
  }

  setSeatsByVenueEditorSeats( venueEditorSeats: VenueEditorSeat[]) {
    if(venueEditorSeats && venueEditorSeats.length) {
      let groupSaleSeats: GroupSaleSeat[] = [];
      venueEditorSeats.forEach( venueEditorSeat => {
        groupSaleSeats.push({
          PerformanceId: this.performance.Id,
          ProductId: venueEditorSeat.ProductId,
          VariantId: venueEditorSeat.VariantId,
          RowId: venueEditorSeat.RowId,
          SeatId: venueEditorSeat.Id,
          TicketType: venueEditorSeat.TicketType,
          TargetSeatStatus: 1
        });
      });
      this.setSeats(groupSaleSeats);
    }else{
      this.setSeats(null);
    }
  }

  getSeatIds(): number[] {
    let seatIds: number[] = [];
    if(this.seats && this.seats.length) this.seats.forEach( seat => seatIds.push(seat.SeatId));
    return seatIds;
  }

  reset(){
    this.setCustomer(null);
    this.setSeats(null);
    this.setProductBlockCapacities(null);
    this.seatStatistics = {};
    this.setGroupSaleCreate(new GroupSaleCreate());
  }

  createPayload(): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload: any = {};
      let customerFactoriesPayload = [];
      
      if(this.groupSaleCreate) {
        this.groupSaleCreate.Customer = this.customer;
        this.groupSaleCreate.Seats = this.seats;
        payload = {
          "ReservationCode": this.groupSaleCreate.ReservationCode,
          "PerformanceId": this.groupSaleCreate.PerformanceId,
          "Description": this.groupSaleCreate.Description,
          "TotalAmount": this.groupSaleCreate.TotalAmount,
          "TotalServiceFee": this.groupSaleCreate.TotalServiceFee,
          "TotalTicketingFee": this.groupSaleCreate.TotalTicketingFee,
          "InvoiceNo": this.groupSaleCreate.InvoiceNo
        }
        if(this.groupSaleCreate.Customer) {
          payload["Customer"]= {
            "AnonymousMemberId": this.groupSaleCreate.Customer.AnonymousMemberId,
            "CrmMemberId": this.groupSaleCreate.Customer.CrmMemberId,
            "FirstName": this.groupSaleCreate.Customer.FirstName,
            "LastName": this.groupSaleCreate.Customer.LastName,
            "Email": this.groupSaleCreate.Customer.Email,
            "Phone": this.groupSaleCreate.Customer.PhoneNumber
          }
        }
        payload["Seats"] = this.groupSaleCreate.Seats;
        console.log("create payload : ", payload, "model : ", this.groupSaleCreate);
        resolve(payload);
      }else {
        reject({Message: `Zorunlu alanlar tanımlı değil`, payload: payload, groupSaleCreate: this.groupSaleCreate });
      }
    });
  }

  createGroupSale(payload?:any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setCustomEndpoint('NewPostGroupSale', true);
      if(payload) {
        this.save(payload).subscribe( result => {
          resolve(result);
        }, error => {
          reject(error);
        });
      }else{
        this.createPayload().then( createPayload => {
          this.save(createPayload).subscribe( result => {
            resolve(result);
          }, error => {
            reject(error);
          });
        });
      }
    });
  }
}
