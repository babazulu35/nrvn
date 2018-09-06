import { ReservationCreateService } from './../reservation-create.service';

export class BaseFactory {
    reservationCreateService: ReservationCreateService

    constructor(reservationCreateService: ReservationCreateService, data?:any){
        this.reservationCreateService = reservationCreateService;
    }

    set(key: string, value: any, hasLocalization?:boolean) {
        if(!this["model"]) return;
        this["model"].set(key, value, hasLocalization, false);
    }

    get(key: string, hasLocalization?:boolean) {
        if(!this["model"]) return;
        return this["model"].get(key, hasLocalization);
    }
}