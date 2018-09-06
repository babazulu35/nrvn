import { Observable } from 'rxjs/Rx';
import { URLSearchParams } from '@angular/http';
import { BaseDataService } from '../../../classes/base-data-service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { StoreService } from '../../../services/store.service';
import { AuthenticationService } from '../../../services/authentication.service';

@Injectable()
export class ReservationService extends BaseDataService {
    constructor(http: Http, storeService: StoreService, authenticationService: AuthenticationService) {
        super(http, 'Reservation', storeService, authenticationService);
    }

    cancelReservationByReservationIdList (reservationIdList) {
        this.setCustomEndpoint('CancelReservation');
        return this.executePost({
            ReservationIdList: reservationIdList
        });
    }

    cancelReservationByReservationCustomerIdList (reservationCustomerIdList) {
        this.setCustomEndpoint('CancelReservation');
        return this.executePost({
            ReservationCustomerIdList: reservationCustomerIdList
        });
    }

    cancelReservationByReservationSeatIdList (reservationSeatIdList) {
        this.setCustomEndpoint('CancelReservation');
        return this.executePost({
            ReservationSeatIdList: reservationSeatIdList
        });
    }

    acceptInvitation (reservationCode) {
        this.setCustomEndpoint('RsvpAction');
        return this.executePost({
            ResponseType: 1,
            InviteCode: reservationCode
        });
    }

    getSeatsForGroupSale(reservationCode: any, performanceId: any): Observable<any> {
        this.setCustomEndpoint('GetSeatsForGroupSale');
        return this.getWithParams([
            {key: 'reservationCode', value: reservationCode},
            {key: 'performanceId', value: performanceId}
        ]);
    }
}
