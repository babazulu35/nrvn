import { Component, OnInit, HostBinding, Input, OnDestroy } from '@angular/core';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';
import { EntityService } from '../../../../services/entity.service';
import { ReservationService } from '../../services/reservation.service';
import { NotificationService } from '../../../../services/notification.service';


@Component({
  selector: 'app-customer-seat-info-box',
  templateUrl: './customer-seat-info-box.component.html',
  styleUrls: ['./customer-seat-info-box.component.scss'],
  providers: [EntityService, ReservationService],
})
export class CustomerSeatInfoBoxComponent implements OnInit, OnDestroy {

  subscription: any;
  reservationSeats: any;
  isLoading = false;
  @Input() customerName: string;
  @Input() actionsAllowed: boolean;
  @Input() customerSurname: string;
  @Input() reservationCustomerId: any;
  response: any;

  constructor(
    private tetherService: TetherDialog,
    private reservationCustomersService: EntityService,
    private reservationService: ReservationService,
    private notificationService: NotificationService,
  ) {
    this.reservationCustomersService.setCustomEndpoint('GetAll');
  }

  ngOnInit() {

    this.subscription = this.reservationCustomersService.data.subscribe(entities => {
      this.reservationSeats = entities;
    });

    this.reservationCustomersService
      .fromEntity('ReReservationSeat')
      .expand(['VenueSeat', 'VenueRow', 'VenueBlock'])
      .where('ReservationCustomerId', '=', this.reservationCustomerId)
      .page(0)
      .executeQuery();
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  cancel(e, seat) {
    this.isLoading = true;
    this.reservationService.cancelReservationByReservationSeatIdList([seat.Id]).subscribe(response => {
      this.notificationService.add({ type: 'success', text: 'Koltuk iptal edildi.' });
      if (response && response.ReservationSeatIdList) {
        response.ReservationSeatIdList.forEach(element => {
          let i = this.reservationSeats.findIndex(r => r.Id === element);
          this.reservationSeats[i].Status = 4;
        });
        if (!this.response) {
          this.response = response;
        } else {
          if (!this.response.ReservationSeatIdList) this.response.ReservationSeatIdList = [];
          this.response.ReservationSeatIdList = this.response.ReservationSeatIdList.concat(response.ReservationSeatIdList);
        }
      }
      if (!this.response) {
        this.response = response;
      } else {
        if (response.ReservationIdList) {
          if (!this.response.ReservationIdList) this.response.ReservationIdList = [];
          this.response.ReservationIdList = this.response.ReservationIdList.concat(response.ReservationIdList);
        }
        if (response.ReservationCustomerIdList) {
          if (!this.response.ReservationCustomerIdList) this.response.ReservationCustomerIdList = [];
          this.response.ReservationCustomerIdList = this.response.ReservationCustomerIdList.concat(response.ReservationCustomerIdList);
        }
      }
      this.isLoading = false;
    }, error => this.notificationService.add({ type: 'danger', text: 'Koltuk iptal edilirken bir problem oluştu.' }))
  }

  close(e) {
    this.tetherService.close({
      Response: this.response
    })
  }
}
