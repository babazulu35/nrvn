import { VenueEditorSeat } from './../../../../models/venue-editor-seat';
import { SeatStatistics } from './../../../../models/seat-statistics';
import { Performance } from './../../../../models/performance';
import { ReservationCreateRoles } from './models/reservation-create-roles';
import { BaseDataService } from './../../../../classes/base-data-service';
import { CrmAnonymousUser } from './../../../../models/crm-anonymous-user';
import { ReservationSeat } from './models/reservation-seat';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReservationCreateRole } from './models/reservation-create-role';
import { Injectable } from '@angular/core';
import { ReservationCreate } from './models/reservation-create';
import { CustomerFactory } from './factories/customer.factory';
import { Http } from '@angular/http';
import { AuthenticationService } from '../../../../services/authentication.service';
import { cloneDeep, cloneDeepWith } from 'lodash';

@Injectable()
export class ReservationCreateService extends BaseDataService {

  roles: ReservationCreateRole[];
  currentRole: ReservationCreateRole;
  currentRole$: BehaviorSubject<ReservationCreateRole> = new BehaviorSubject(null);

  performance: Performance;
  performance$: BehaviorSubject<Performance> = new BehaviorSubject(null);

  reservationCreate: ReservationCreate;

  customerFactories: CustomerFactory[];
  customerFactories$: BehaviorSubject<CustomerFactory[]> = new BehaviorSubject(null);
  
  customerCsv: {file: File, fileData: any, payload?: any};
  customerCsv$: BehaviorSubject<{file: File, fileData: any, payload?: any}> = new BehaviorSubject(null);
  customerCsvUsedOnce: boolean;

  seats: ReservationSeat[];
  seats$: BehaviorSubject<ReservationSeat[]> = new BehaviorSubject(null);

  seatStatistics: SeatStatistics;
  seatStatistics$: BehaviorSubject<SeatStatistics> = new BehaviorSubject(null);

  venueEditorSeats: VenueEditorSeat[];
  venueEditorSeats$: BehaviorSubject<VenueEditorSeat[]> = new BehaviorSubject(null);

  constructor(http: Http, authenticationService: AuthenticationService) { 
    super(http, 'Reservation', null, authenticationService);
    this.roles = [];
    this.roles.push(ReservationCreateRoles.ROLE_RESERVATION);
    this.roles.push(ReservationCreateRoles.ROLE_INVITATION);
    this.roles.push(ReservationCreateRoles.ROLE_RSVP_INVITATION);
    this.roles.push(ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION);

    this.reservationCreate = new ReservationCreate();
    this.seatStatistics = {};
  }

  set(key: string, value: any) {
    this.reservationCreate[key] = value;
  }

  get(key): any {
    return this.reservationCreate[key];
  }

  setSeatStatistic(key: string, value: number) {
    this.seatStatistics[key] = value;
    this.seatStatistics$.next(this.seatStatistics);
  }

  setCurrentRoleByPath(path: string): ReservationCreateRole {
    this.currentRole = this.roles.find( role => role.path == path);
    this.currentRole$.next(this.currentRole);
    return this.currentRole;
  }

  setPerformance(performance:Performance): Performance {
    this.performance = performance;
    this.performance$.next(this.performance);
    return this.performance;
  }

  setCustomerCsv(csv: any) {
    this.customerCsvUsedOnce = false;
    this.customerCsv = csv;
    this.setCustomerFactories(null);
    if(this.customerCsv && this.customerCsv.payload && this.customerCsv.payload.length > 0){
      this.setCustomerFactories(null);
      this.customerCsv.payload.forEach( item => {
        // this.addCustomer(item.customer, [item.reservationSeat]);
        this.addCustomer(item.customer);
      })
    }
    this.customerCsv$.next(this.customerCsv);
  }

  setCustomerFactories(customers: CrmAnonymousUser[], forceToRenew?: boolean) {
    if(this.currentRole != ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION) {
      this.seats = null;
      this.venueEditorSeats = null;
    }
    let existCustomerFactories: CustomerFactory[] = [];
    if(this.customerFactories && !forceToRenew && customers) {
      existCustomerFactories = this.customerFactories.filter( customerFactory => customers.some( customer => (customer.CrmMemberId && customer.CrmMemberId == customerFactory.model.CrmMemberId) || customer.PhoneNumber == customerFactory.model.PhoneNumber ));
      customers = customers.filter( customer => !existCustomerFactories.some( customerFactory => (customerFactory.model.CrmMemberId && customerFactory.model.CrmMemberId == customer.CrmMemberId) || customerFactory.model.PhoneNumber == customer.PhoneNumber));
    }
    
    this.customerFactories = existCustomerFactories;
    if(customers) customers.forEach( customer => this.addCustomerFactory(this.createCustomerFactory(customer)));
    this.customerFactories$.next(this.customerFactories);
  }

  createCustomerFactory(data): CustomerFactory {
    return new CustomerFactory(this, data);
  }

  addCustomer(customer: CrmAnonymousUser, seats?: ReservationSeat[]) {
    this.addCustomerFactory(this.createCustomerFactory(customer)).then( newCustomer => {
      if(seats) seats.forEach( seat => {
        newCustomer.addSeat(seat)
      });
    }).catch( reason => {
      if(seats && reason.customer) seats.forEach( seat => reason.customer.addSeat(seat));
    });
  }

  addCustomerFactory(customer: CustomerFactory): Promise<CustomerFactory> {
    return new Promise( (resolve, reject) => {
        if(customer) {
            let existCustomer = this.getCustomerFactoryByKey(customer.factoryId || customer.model.CrmMemberId || customer.model.PhoneNumber);
            if(!existCustomer) {
                if(!this.customerFactories) this.customerFactories = [];
                this.customerFactories.push(customer);
                this.customerFactories$.next(this.customerFactories);
                resolve(customer);
            }else{
              reject({Message: `${customer.factoryId} nolu id ile daha önce müşteri eklenmiş.`, customer: existCustomer});
            }
        }else{
            reject();
        }
    });
  }

  removeCustomerFactory(customer: CustomerFactory) {
      let index = this.customerFactories.indexOf(customer);
      if(index >= 0) {
        let removedCustomerFactories = this.customerFactories.splice(index, 1);
        removedCustomerFactories.forEach( customerFactory => {
          customerFactory.seats.forEach( seat => {
            this.removeSeatById(seat.SeatId);
          })
        })
      }
      this.customerFactories$.next(this.customerFactories);
  }

  removeCustomerFactoryById(id: any): Promise<CustomerFactory[]> {
      return new Promise( (resolve, reject) => {
          let existCustomer = this.getCustomerFactoryById(id);
          if(existCustomer) {
              this.removeCustomerFactory(existCustomer);
              resolve(this.customerFactories);
          }else{
              reject({Message: `${id} nolu id ile müşteri bulunamadı.`});
          }
      });
  }

  removeCustomerFactoryByModel(model: CrmAnonymousUser): Promise<CustomerFactory[]> {
    return new Promise( (resolve, reject) => {
        let existCustomer = this.getCustomerFactoryByModel(model);
        if(existCustomer) {
            this.removeCustomerFactory(existCustomer);
            resolve(this.customerFactories);
        }else{
            reject({Message: `${model.CrmMemberId || model.PhoneNumber} nolu id veya telefon ile müşteri bulunamadı.`});
        }
    });
}

  getCustomerFactoryById(id: any): CustomerFactory {
    if(!this.customerFactories || !id) return null;
    return this.customerFactories.find( item => item.factoryId === id);
  }

  getCustomerFactoryByKey(key: any): CustomerFactory {
    if(!this.customerFactories || !key) return null;
    return this.customerFactories.find( item => item.factoryId === key || item.model.CrmMemberId == key || item.model.PhoneNumber == key);
  }

  getCustomerFactoryByModel(model: CrmAnonymousUser): CustomerFactory {
    if(!this.customerFactories || !model) return null;
    return this.customerFactories.find( item => item.model === model);
  }

  setVenueEditorSeats(seats: VenueEditorSeat[], customer?: CrmAnonymousUser) {
    this.venueEditorSeats = seats;
    console.log("SET VENUE EDITOR SEATS => ", this.venueEditorSeats);
    if(this.venueEditorSeats) {
      let existCustomerFactory: CustomerFactory;
      this.seats = [];
      let reservationSeat: ReservationSeat;

      if(customer) {
        existCustomerFactory = this.getCustomerFactoryByKey(customer.CrmMemberId || customer.PhoneNumber);
        existCustomerFactory.seats = [];
      }

      this.venueEditorSeats.forEach( venueEditorSeat => {
        reservationSeat = {
          PerformanceId: this.performance.Id,
          ProductId: venueEditorSeat.ProductId,
          RowId: venueEditorSeat.RowId,
          SeatId: venueEditorSeat.Id
        };

        this.addSeat(reservationSeat);
        // if(customer) {
        //   if(existCustomerFactory) existCustomerFactory.addSeat(reservationSeat);
        // }
      });
    }else{
      this.seats = null;
    }
    this.venueEditorSeats$.next(this.venueEditorSeats);
  }
  
  getVenueEditorSeatIds(venueEditorSeats?: VenueEditorSeat[]): number[] {
    if(!venueEditorSeats) venueEditorSeats = this.venueEditorSeats;
    let ids: number[] = [];
    if(venueEditorSeats) venueEditorSeats.forEach( seat => ids.push(seat.Id));
    return ids;
  }

  setSeats( seats: ReservationSeat[]) {
    this.seats = seats;
    this.seats$.next(this.seats);
  }

  setSeatsByVenueEditorSeats( venueEditorSeats: VenueEditorSeat[]) {
    if(venueEditorSeats && venueEditorSeats.length) {
      let reservationSeats: ReservationSeat[] = [];
      venueEditorSeats.forEach( venueEditorSeat => {
        reservationSeats.push({
          PerformanceId: this.performance.Id,
          ProductId: venueEditorSeat.ProductId,
          RowId: venueEditorSeat.RowId,
          SeatId: venueEditorSeat.Id
        });
      });
      this.setSeats(reservationSeats);
    }else{
      this.setSeats(null);
    }
  }

  addSeat(seat: ReservationSeat): Promise<ReservationSeat> {
    return new Promise( (resolve, reject) => {
        if(seat) {
            let existSeat = this.getSeatById(seat.SeatId);
            if(!existSeat) {
                if(!this.seats) this.seats = [];
                this.seats.push(seat);
                this.seats$.next(this.seats);
                resolve(seat);
            }else{
              reject({Message: `${seat.SeatId} nolu SeatID ile daha önce koltuk eklenmiş.`});
            }
        }else{
            reject();
        }
    });
  }

  removeSeat(seat: ReservationSeat) {
      let index = this.seats.indexOf(seat);
      if(index >= 0) this.seats.splice(index, 1);
      this.seats$.next(this.seats);
  }

  removeSeatById(id: any): Promise<ReservationSeat[]> {
      return new Promise( (resolve, reject) => {
          let existSeat = this.getSeatById(id);
          if(existSeat) {
              this.removeSeat(existSeat);
              let existVenueEditorSeat = this.venueEditorSeats.find( seat => seat.Id == existSeat.SeatId);
              if(existVenueEditorSeat) {
                this.venueEditorSeats.splice(this.venueEditorSeats.indexOf(existVenueEditorSeat), 0);
                this.venueEditorSeats$.next(this.venueEditorSeats);
              }
              resolve(this.seats);
          }else{
              reject({Message: `${id} nolu SeatId ile koltuk bulunamadı.`});
          }
      });
  }

  getSeatById(id: any): ReservationSeat {
    if(!this.seats || !id) return null;
    return this.seats.find( item => item.SeatId === id);
  }

  getSeatIds(): number[] {
    let seatIds: number[] = [];
    if(this.seats && this.seats.length) this.seats.forEach( seat => seatIds.push(seat.SeatId));
    return seatIds;
  }

  createCustomerPayload(customer: CrmAnonymousUser) {
    if(customer.CrmMemberId) {
      return new CrmAnonymousUser({CrmMemberId: customer.CrmMemberId})
    }else{
      return cloneDeep(customer);
    }
  }
  createPayload(): Promise<any> {
    return new Promise((resolve, reject) => {
      let payload: any = {};
      let self = this;
      let customerFactoriesPayload = [];
      
      if(this.reservationCreate && this.currentRole && this.customerFactories && this.customerFactories.length) {
        payload["Name"] = this.reservationCreate.Name;
        payload["Description"] = this.reservationCreate.Description;

        switch(this.currentRole) {
          case ReservationCreateRoles.ROLE_RESERVATION:
          case ReservationCreateRoles.ROLE_RSVP_INVITATION:
            payload["ExpirationType"] = this.reservationCreate.ExpirationType;
            payload["ExpirationTime"] = this.reservationCreate.ExpirationTime;
            customerFactoriesPayload = [];
            this.customerFactories.forEach( customer => {
              customerFactoriesPayload.push({
                Customer: self.createCustomerPayload(customer.model),
                Seats: cloneDeep(customer.seats)  
              })
            });
            payload["CustomerSeats"] = customerFactoriesPayload;
          break;
          case ReservationCreateRoles.ROLE_INVITATION:
            customerFactoriesPayload = [];
            this.customerFactories.forEach( customer => {
              customerFactoriesPayload.push({
                Customer: self.createCustomerPayload(customer.model),
                Seats: cloneDeep(customer.seats)  
              })
            });
            payload["CustomerSeats"] = customerFactoriesPayload;
          break;
          case ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION:
            payload["ExpirationType"] = this.reservationCreate.ExpirationType;
            payload["ExpirationTime"] = this.reservationCreate.ExpirationTime;
            payload["SeatCountPerCustomer"] = this.reservationCreate.SeatCountPerCustomer;
            customerFactoriesPayload = [];
            this.customerFactories.forEach( customer => {
              customerFactoriesPayload.push(self.createCustomerPayload(customer.model));
            });
            payload["Customers"] = customerFactoriesPayload;
            payload["Seats"] = cloneDeep(this.seats);
          break;
        }
        console.log("create payload : ", payload, "model : ", this.reservationCreate);
        resolve(payload);
      }else {
        reject({Message: `Zorunlu alanlar tanımlı değil`, payload: payload, reservationCreate: this.reservationCreate });
      }
    });
  }

  createReservation(payload?:any): Promise<any> {
    return new Promise((resolve, reject) => {
      if(this.currentRole) {
        this.setCustomEndpoint(this.currentRole.endPoint);
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
          })
        }
      }else {
        reject({Message: `currentRole ve endPoint tanımlanmamış.`, reservationCreate: this.reservationCreate });
      }
    });
  }

}
