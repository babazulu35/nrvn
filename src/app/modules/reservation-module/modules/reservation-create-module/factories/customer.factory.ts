import { uniqueId } from 'lodash';
import { CrmAnonymousUser } from './../../../../../models/crm-anonymous-user';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseFactory } from './base.factory';
import { ReservationSeat } from '../models/reservation-seat';
import { ReservationCreateService } from '../reservation-create.service';
import { VenueEditorSeat } from '../../../../../models/venue-editor-seat';

export class CustomerFactory extends BaseFactory {

    model: CrmAnonymousUser;
    factoryId: any;

    seats: ReservationSeat[];
    seats$: BehaviorSubject<ReservationSeat[]> = new BehaviorSubject(null);
    

    constructor(reservationCreateService: ReservationCreateService, data?:any) {
        super(reservationCreateService, data);
        this.model = new CrmAnonymousUser(data);
        this.factoryId = uniqueId('customer-');
    }

    setSeats(seats: ReservationSeat[]) {
        this.seats = seats;
        this.seats$.next(this.seats);
    }

    setSeatsByVenueEditorSeats( venueEditorSeats: VenueEditorSeat[]) {
        if(venueEditorSeats && venueEditorSeats.length) {
            let reservationSeats: ReservationSeat[] = [];
            venueEditorSeats.forEach( venueEditorSeat => {
            reservationSeats.push({
                PerformanceId: this.reservationCreateService.performance.Id,
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
        if(!this.seats) return null;
        let ids: number [] = [];
        this.seats.forEach( seat => ids.push(seat.SeatId));
        return ids;
    }
}