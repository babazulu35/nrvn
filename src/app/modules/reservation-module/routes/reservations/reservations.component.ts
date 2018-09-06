import { Component, OnInit, OnDestroy, Inject, ComponentRef, ComponentFactoryResolver, Injector, HostBinding } from '@angular/core';
import { EntityService } from '../../../../services/entity.service';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';
import { CrmMemberService } from '../../../../services/crm-member.service';
import { ReservationService } from '../../services/reservation.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PerformanceStatus } from '../../../../models/performance-status.enum';
import { CustomerSeatInfoBoxComponent } from '../../components/customer-seat-info-box/customer-seat-info-box.component';
import { ReservationCustomerService } from '../../services/reservation-customer.service';
import { ExpirationDatePickerBoxComponent } from '../../components/expiration-date-picker-box/expiration-date-picker-box.component';
import { NotificationService } from '../../../../services/notification.service';


@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss'],
  providers: [
    EntityService,
    CrmMemberService,
    ReservationService,
    ReservationCustomerService,
    { provide: 'performanceEntityService', useClass: EntityService },
    { provide: 'reservationsService', useClass: EntityService },
    { provide: 'reservationSeatsService', useClass: EntityService },
  ],
  entryComponents: [CustomerSeatInfoBoxComponent, ExpirationDatePickerBoxComponent],
})
export class ReservationsComponent implements OnInit, OnDestroy {

  @HostBinding('class.or-reservations') true;
  // Subscriptions
  reservationsSubscription: any;
  reservationCustomersSubscription: any;
  performanceSubscription: any;

  // Template Variables
  PerformanceStatus = PerformanceStatus;
  isLoading = false;
  startScreen = true;
  noDataInContent;
  noReservations;
  noReservationsSearch;

  reservations: any;
  reservationCustomers: any;

  pageSizes: Array<Object> = [{text: '10', value: 10}, {text: '20', value: 20}];
	pageSize = 10;
  currentPage = 1;
  count;
  pageSizeReservation = 10;
  currentPageReservation = 1;
  countReservation;
  performance: any;

  get showPagination(): boolean {
    return this.countReservation > this.pageSizes[0]['value'];
  }

  get isReservationSelected(): boolean { 
    if (this.reservations) {
      return  this.reservations.some(r => r.isSelected) 
    } else {
      return false;
    }
  };

  get isSuitableForNew(): boolean {
    if (this.performance) {
      return this.performance && this.performance.ReservationAvailable
                              && this.performance.Status === PerformanceStatus.OnSale || this.performance.Status === PerformanceStatus.SoldOut;
    }
  }

  pills: Array<any> = [
		{ text: 'TÜMÜ', filter: '', isActive: false, type: 1 },
    { text: 'AÇIK', filter: "Status eq cast('1', Nirvana.Shared.Enums.ReservationCustomerStatus)", isActive: false, type: 1 },
    { text: 'KAPALI', filter: "Status eq cast('2', Nirvana.Shared.Enums.ReservationCustomerStatus)",  isActive: false , type: 1},
    { text: 'GEÇMİŞ', filter: "Status eq cast('3', Nirvana.Shared.Enums.ReservationCustomerStatus)",  isActive: false , type: 1},
    { text: "RSVP'Lİ", filter: "Reservation/Type eq cast('2', Nirvana.Shared.Enums.ReservationNewType)", isActive: false, type: 1 },
    { text: 'PROMOTER', filter: "Reservation/Type eq cast('3', Nirvana.Shared.Enums.ReservationNewType)",  isActive: false , type: 1},
    { text: 'SOSYAL', filter: "Reservation/Type eq cast('4', Nirvana.Shared.Enums.ReservationNewType)",  isActive: false , type: 1},
  ];

  constructor(
    private reservationCustomersService: EntityService,
    public tetherService: TetherDialog,
    private crmMemberService: CrmMemberService,
    private reservationService: ReservationService,
    private reservationCustomerService: ReservationCustomerService,
    @Inject('performanceEntityService') private performanceEntityService: EntityService,
    @Inject('reservationsService') private reservationsService: EntityService,
    @Inject('reservationSeatsService') private reservationSeatsService: EntityService,
    private router: Router,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
  ) {
    this.reservationCustomersService.setCustomEndpoint('GetAll');
    this.reservationsService.setCustomEndpoint('GetAll');
    this.performanceEntityService.setCustomEndpoint('GetAll');
    this.reservationSeatsService.setCustomEndpoint('GetAll');
  }

  ngOnInit() {

    this.isLoading = true;

    let performanceId;
		let url = this.router.url;
		if (url) {
			let parts = url.split('/');
			if (parts && parts.length >= 2) {
				performanceId = +parts[2];
			}
    }

		this.performanceSubscription = this.performanceEntityService.data.subscribe(entities => {
			if (entities && entities[0]) this.performance = entities[0];
		});
    this.performanceEntityService.fromEntity('EPerformance')
                                 .where('Id', '=',  performanceId)
                                 .take(1)
                                 .page(0)
                                 .executeQuery();

    this.reservationsSubscription = this.reservationsService.queryParamSubject.subscribe(params => {
      let query = this.reservationsService.fromEntity('ReReservation')
                                                    .expand(['ReservationCustomers'])
                                                    .expand(['ReservationSeats'])
                                                    .where('PerformanceId', '=', performanceId)
                                                    .andRaw("(Type eq cast('2', Nirvana.Shared.Enums.ReservationNewType) or Type eq cast('3', Nirvana.Shared.Enums.ReservationNewType) or Type eq cast('4', Nirvana.Shared.Enums.ReservationNewType))")
                                                    .take(params['pageSize'])
                                                    .page(params['page']);

        // Searching
        if (params['search']) {
          query.search(params['search']['key'], params['search']['value']);
        }

        // Filtering
        if (params['filter'] && params['filter'].length > 0 && params['filter'][0].filter) {
          query.andRaw(params['filter'][0].filter);
        }

        query.executeQuery();
    }, error => this.handleError(error));

    this.reservationsService.queryParamSubject.subscribe(
      params => {
        this.updateLocalParamsReservation(params);
        this.reservationsService.data.skip(1).subscribe(
          entities => {
            if (entities) {
              this.reservations = entities;
              if (this.startScreen) {
                this.startScreen = false;
                this.noReservations = this.reservations.length === 0;
              } else {
                this.noReservationsSearch = this.reservations.length === 0;
              }
              if (!this.noReservations) {
                this.setReservationsInfo();
              }
              this.isLoading = false;
            }
      }, error => this.handleError(error));
    }, error => this.handleError(error));



    this.reservationCustomersService.data.subscribe(
      entities => {
        if (entities) {
          this.reservationCustomers = entities;
          this.noDataInContent = this.reservationCustomers.length === 0;
          if (!this.noDataInContent) {
            this.setMemberInfo();
          }
          this.isLoading = false;
        }
      }, error => this.handleError(error));

    this.reservationCustomersService.queryParamSubject.subscribe(
      params => {
        this.updateLocalParams(params);
        let query = this.reservationCustomersService.fromEntity('ReReservationCustomer')
                                                    .expand(['AnonymousMember'])
                                                    .expand(['Reservation'])
                                                    .where('Reservation/PerformanceId', '=', performanceId)
                                                    .andRaw("(Reservation/Type eq cast('2', Nirvana.Shared.Enums.ReservationNewType) or Reservation/Type eq cast('3', Nirvana.Shared.Enums.ReservationNewType) or Reservation/Type eq cast('4', Nirvana.Shared.Enums.ReservationNewType))")
                                                    .take(params['pageSize'])
                                                    .page(params['page']);

        // Searching
        if (params['search']) {
          query.search(params['search']['key'], params['search']['value']);
        }

        // Filtering
        if (params['filter'] && params['filter'].length > 0) {
          params['filter'].forEach(element => {
            if (element['filter'] !== '') query.andRaw(element.filter);
          });
        }

        query.executeQuery();
    }, error => this.handleError(error));

    this.reservationCustomersService.getCount().subscribe(
			count => this.count = count
    );

    this.reservationsService.getCount().subscribe(
			count => this.countReservation = count
		);
  }

  ngOnDestroy() {
    if (this.performanceSubscription) this.performanceSubscription.unsubscribe();
    if (this.reservationsSubscription) this.reservationsSubscription.unsubscribe();
    if (this.reservationCustomersSubscription) this.reservationCustomersSubscription.unsubscribe();
  }

  onInputChange(event) {
    this.reservationsService.setSearch({ key: '', value: `ReservationCustomers/any(a:contains(a/ReservationCode, '${event}'))`});
    this.reservationCustomersService.setSearch({ key: 'ReservationCode', value: event});
  }

  // List Actions
  transistPage(page) {
    this.reservationCustomersService.setPage(page);
  }
  
  transistPageReservation(page) {
    this.reservationsService.setPage(page);
	}

	changePageSize(pageSize) {
		this.reservationCustomersService.setPageSize(pageSize);
  }

  changePageSizeReservation (pageSize) {
		this.reservationsService.setPageSize(pageSize);
  }

  pillFilter(pill) {
    this.reservationCustomersService.setAdditionalFilter(pill);
  }

  // Page Actions
  openCustomerSeatInfoBox(event, customer) {
    let component: ComponentRef<CustomerSeatInfoBoxComponent>;
    component = this.resolver.resolveComponentFactory(CustomerSeatInfoBoxComponent).create(this.injector);
    component.instance.reservationCustomerId = customer.Id;
    component.instance.customerName = customer.AnonymousMember ? customer.AnonymousMember.FirstName : (customer.CrmMember ? customer.CrmMember.Name : null);
    component.instance.customerSurname = customer.AnonymousMember ? customer.AnonymousMember.LastName : (customer.CrmMember ? customer.CrmMember.Surname : null);
    component.instance.actionsAllowed = true;

		this.tetherService.modal(component, {
      escapeKeyIsActive: false,
      outsideClickIsActive: false,
			dialog: {
				style: {
					maxWidth: '400px',
					width: '40vw',
					height: '50vh'
				}
			}
		}).then(result => {
      if (result && result.Response) {
        this.updateStatus(result.Response);
      }
		})
		.catch(reason =>
			console.log('Refund Reason Modal dismiss reason: ', reason)
		);
  }

  private openExpirationDatePickerBox(item, type) {
    let component: ComponentRef<ExpirationDatePickerBoxComponent>;
    component = this.resolver.resolveComponentFactory(ExpirationDatePickerBoxComponent).create(this.injector);
    component.instance.performance = this.performance;

		this.tetherService.modal(component, {
			escapeKeyIsActive: true,
			dialog: {
				style: {
					maxWidth: '400px',
					width: '40vw',
					height: '50vh'
				}
			}
		}).then(result => {
      if (result && result.NewExpirationDate) {
        switch (type) {
          case 'customer':
            this.updateReservationCustomerExpirationDate(item, result.NewExpirationDate);
            break;
          case 'reservation':
            this.updateReservationExpirationDate(item, result.NewExpirationDate);
            break;
          default:
            break;
        }
      }
		})
		.catch(reason =>
			console.log('Refund Reason Modal dismiss reason: ', reason)
		);
  }

  openReservationCustomerContextMenu(event, customer) {

    if (!customer) return;

    let content = {
        title: 'İŞLEMLER',
        data: this.getReservationCustomerActions(customer)
    }

    this.tetherService.context(content,
        {
            target: event.target,
            attachment: 'top right',
            targetAttachment: 'top right',
        }
    ).then(result => {
        if (result) {
            switch (result['action']) {
              case 'acceptInvitation':
                this.acceptInvitation(customer);
                break;
              case 'updateExpirationDate':
                this.openExpirationDatePickerBox(customer, 'customer');
                break;
              case 'cancel':
                this.cancelReservationCustomer(customer);
                break;
            }
        }
    }).catch(reason => console.log('dismiss reason : ', reason));
  }

  openReservationContextMenu(event, reservation) {
    if (!reservation) return;

    let content = {
        title: 'İŞLEMLER',
        data: this.getReservationActions(reservation),
    }

    this.tetherService.context(content,
        {
            target: event.target,
            attachment: 'top right',
            targetAttachment: 'top right',
        }
    ).then(result => {
        if (result) {
            switch (result['action']) {
                case 'updateExpirationDate':
                  this.openExpirationDatePickerBox(reservation, 'reservation');
                  break;
                case 'cancel':
                  this.cancelReservation(reservation);
                  break;
                case 'exportCsv':
                  this.exportCsv(reservation);
                  break;
            }
        }
    }).catch(reason => console.log('dismiss reason : ', reason));
  }

  selectReservation(event, reservation) {
    if (!reservation) return;

    if (reservation.isSelected) {
      this.reservations.forEach(element => {
        element.isSelected = false;
      });
    } else {
      this.reservations.forEach(element => {
        if (element.Id === reservation.Id) {
          element.isSelected = true;
        } else {
          element.isSelected = false;
        }
      });
    }
    this.reservationCustomersService.setAdditionalFilter({ filter: `ReservationId eq ${reservation.Id}` , type: 2});
  }

  // Action Methods
  private cancelReservation(reservation) {
    this.isLoading = true;
    this.reservationService.cancelReservationByReservationIdList([reservation.Id]).subscribe(response => {
      this.notificationService.add({
        type: 'success',
        text: 'Rezervasyon iptal edildi.'
      });
    this.updateStatus(response);
    this.isLoading = false;
    }, error => this.handleError(error));
  }

  private cancelReservationCustomer(reservationCustomer) {
    this.isLoading = true;
    this.reservationService.cancelReservationByReservationCustomerIdList([reservationCustomer.Id]).subscribe(response => {
      this.notificationService.add({
        type: 'success',
        text: 'Rezervasyon iptal edildi.'
      });
      this.updateStatus(response);
      this.isLoading = false;
    }, error => this.handleError(error));
  }

  private updateReservationExpirationDate(reservation, newExpirationDate) {
    this.isLoading = true;
    let payload = [];
    if (reservation.ReservationCustomers) {
      reservation.ReservationCustomers.forEach(element => {
        payload.push({
          Id: element.Id,
          ExpirationDate: newExpirationDate
        });
      });
    }
    this.reservationCustomerService.setCustomEndpoint('PatchAll');
    this.reservationCustomerService.update(payload, null).subscribe(response => {
      this.notificationService.add({
        type: 'success',
        text: 'RSVP tarihi güncellendi.'
      });
      if (reservation.isSelected) {
        this.reservationCustomers.forEach(element => {
          element.ExpirationDate = newExpirationDate;
        });
      }
      this.isLoading = false;
    }, error => this.handleError(error));
  }

  private updateReservationCustomerExpirationDate(reservationCustomer, newExpirationDate) {
    this.isLoading = true;
    let payload = {
      ExpirationDate: newExpirationDate
    }
    this.reservationCustomerService.flushCustomEndpoint();
    this.reservationCustomerService.executePatch(payload, reservationCustomer.Id).subscribe(response => {
      this.notificationService.add({
        type: 'success',
        text: 'RSVP tarihi güncellendi.'
      });
      reservationCustomer.ExpirationDate = newExpirationDate;
      this.isLoading = false;
    }, error => this.handleError(error));
  }

  private acceptInvitation(reservationCustomer) {
    this.isLoading = true;
    this.reservationService.acceptInvitation(reservationCustomer.ReservationCode).subscribe(response => {
      this.notificationService.add({
        type: 'success',
        text: 'Davetiye kabul edildi.'
      });
      reservationCustomer.Status = 2;
      let reservation = this.reservations.find(r => r.Id === reservationCustomer.Reservation.Id);
      if (reservation) {
        reservation.ReservationSeats.forEach(seat => {
          if (seat.ReservationCustomerId === reservationCustomer.Id) seat.Status = 2;
        });
        this.setReservationInfo(reservation);
      }
      this.isLoading = false;
    }, error => this.handleError(error));
  }

  // Not working -- MT
  private convertToGroupSale() {

  }

  private exportCsv(reservation) {
    this.reservationSeatsService.fromEntity('ReReservation')
                                .expand(['ReservationCustomers', 'AnonymousMember'])
                                .expand(['ReservationSeats', 'VenueSeat', 'VenueRow', 'VenueBlock', 'Section'])
                                .where('Id', '=', reservation.Id)
                                .take(1)
                                .page(0)
                                .executeQuery();

    this.reservationSeatsService.data.skip(1).first().subscribe(result => {
      let customers = [];
      if (result && result.length > 0 && result[0].ReservationCustomers) {
        customers = result[0].ReservationCustomers;
        let crmMemberIds = customers.map(item => item.CrmMemberId);
        let uniqueMemberIds = [];
        crmMemberIds.forEach(element => {
          if (element) {
            let isPresent = uniqueMemberIds.some(i => i === element);
            if (!isPresent) uniqueMemberIds.push(element);
          }
        });

        if (uniqueMemberIds.length > 0) {
          this.crmMemberService.getMembersWithIdList(uniqueMemberIds).subscribe(response => {
            if (response.EntityModel && response.EntityModel.length) {
              response.EntityModel.forEach(element => {
                if (element && element.Value) {
                  let i = customers.findIndex(customer => customer.CrmMemberId === element.Key);
                  if (i > -1) {
                    customers[i].CrmMember = element.Value;
                  }
                }
              });
            }
            if (result[0].ReservationSeats) {
              let seats = result[0].ReservationSeats;
              this.prepareCsvModel(customers, seats);
            }
          }, error => this.handleError(error));
        } else {
          if (result[0].ReservationSeats) {
            let seats = result[0].ReservationSeats;
            this.prepareCsvModel(customers, seats);
          }
        }
      }
    }, error => this.handleError(error));
  }

  // Helper Methods

  private convertArrayOfObjectsToCSV(args) {
    let result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ';';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
  }

  private prepareCsvModel(customers, seats) {
    let model: {
      name: string;
      lastName: string;
      phoneNumber: string;
      email: string;
      venueSeatId: string;
      section: string;
      block: string;
      row: string;
      seat: string;
    }[] = [];

    seats.forEach(seat => {
      let customer = customers.find(c => c.Id === seat.ReservationCustomerId)   ;
      let modelSeat = {
        name: customer.AnonymousMember ? customer.AnonymousMember.FirstName : (customer.CrmMember ? customer.CrmMember.Name : ''),
        lastName: customer.AnonymousMember ? customer.AnonymousMember.LastName : (customer.CrmMember ? customer.CrmMember.Surname : ''),
        phoneNumber: customer.AnonymousMember ? (customer.AnonymousMember.PhoneNumber) : (customer.CrmMember ? (customer.CrmMember.PhoneNumber) : ''),
        email: customer.AnonymousMember ? (customer.AnonymousMember.Email) : (customer.CrmMember ? (customer.CrmMember.EmailAddress) : ''),
        venueSeatId: '',
        section: '',
        block: '',
        row: '',
        seat: '',
      }
      if (seat.VenueSeat) {
        modelSeat.venueSeatId = seat.VenueSeat.VSeatId;
        if (seat.VenueSeat.VenueRow) {
          if (seat.VenueSeat.VenueRow.VenueBlock) {
            if (seat.VenueSeat.VenueRow.VenueBlock.Section) {
              modelSeat.section = seat.VenueSeat.VenueRow.VenueBlock.Section.Name || '';
            }
            modelSeat.block = seat.VenueSeat.VenueRow.VenueBlock.Name || '';
          }
          modelSeat.row = seat.VenueSeat.VenueRow.Name || seat.VenueSeat.VenueRow.RowNumber || '';
        }
        modelSeat.seat = seat.VenueSeat.Name || seat.VenueSeat.SeatNo || '';
      }
      model.push(modelSeat);
    });

    let csv = this.convertArrayOfObjectsToCSV({data: model});

    if (csv == null) return;

    let filename = 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }

    let data = encodeURI(csv);

    let link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  }

  private updateLocalParams(params: Object = {}) {
		this.currentPage = params['page'] ? params['page'] : 1
		this.pageSize = params['pageSize'] ? params['pageSize'] : 10
  }

  private updateLocalParamsReservation(params: Object = {}) {
		this.currentPageReservation = params['page'] ? params['page'] : 1
		this.pageSizeReservation = params['pageSize'] ? params['pageSize'] : 10
  }

  private getReservationCustomerActions(customer) {
    if (!customer) return;

    let actions = [
      { label: 'RSVP Değiştir', icon: 'timelapse', action: 'updateExpirationDate' },
      { label: 'İptal Et', icon: 'cancel', action: 'cancel' },
    ];

    if (customer.Reservation.Type === 2) { // Resvp Invitation
      actions.unshift({ label: 'Davetiyeyi Kabul Et', icon: 'check', action: 'acceptInvitation' });
    } else if (customer.Reservation.Type === 3) { // Promoter Reservation
      // actions.unshift({ label: 'Grup Satışa Çevir', icon: 'people', action: 'convertToGroupSale' });
    }

    return actions;
  }

  private getReservationActions(reservation) {
    if (!reservation) return;

    let actions = [
      { label: 'Koltukları Dışa Aktar', icon: 'file_download', action: 'exportCsv' },
    ];

    if (reservation.Status === 1) {
      actions.unshift({ label: 'RSVP Değiştir', icon: 'timelapse', action: 'updateExpirationDate' });
      actions.push({ label: 'İptal Et', icon: 'cancel', action: 'cancel' },);
    }

    return actions;
  }

  private setMemberInfo() {
    let crmMemberIds = this.reservationCustomers.map(item => item.CrmMemberId);
    let uniqueMemberIds = [];
    crmMemberIds.forEach(element => {
      if (element) {
        let isPresent = uniqueMemberIds.some(i => i === element);
        if (!isPresent) uniqueMemberIds.push(element);
      }
    });
    if (uniqueMemberIds.length > 0) {
      this.crmMemberService.getMembersWithIdList(uniqueMemberIds).subscribe(response => {
        if (response.EntityModel && response.EntityModel.length) {
          response.EntityModel.forEach(element => {
            if (element && element.Value) {
              this.reservationCustomers.forEach(customer => {
                if (customer.CrmMemberId === element.Key) customer.CrmMember = element.Value;
              });
            }
          });
        }
      }, error => this.handleError(error));
    }
  }

  private updateStatus(cancelResponse) {
    if (cancelResponse) {
      if (cancelResponse.ReservationIdList) {
        cancelResponse.ReservationIdList.forEach(element => {
          let i = this.reservations.findIndex(r => r.Id === element);
          this.reservations[i].Status = 2;
        });
      }

      if (cancelResponse.ReservationCustomerIdList) {
        cancelResponse.ReservationCustomerIdList.forEach(element => {
          let i = this.reservationCustomers.findIndex(r => r.Id === element);
          this.reservationCustomers[i].Status = 2;
        });
      }

      if (cancelResponse.ReservationSeatIdList) {
        cancelResponse.ReservationSeatIdList.forEach(element => {
          this.reservations.forEach(reservation => {
            reservation.ReservationSeats.forEach(seat => {
              if (seat.Id === element) {
                seat.Status = 4;
              }
            });
            this.setReservationInfo(reservation);
          });
        });
      }
    }
  }

  private updateReservationSeats() {

  }

  private setReservationsInfo() {
    this.reservations.forEach(element => {
      element.isSelected = false;
      this.setReservationInfo(element);
    });
  }

  private setReservationInfo(reservation) {
    reservation.OpenCount = 0;
    reservation.AcceptedCount = 0;
    reservation.RejectedCount = 0;
    reservation.ClosedCount = 0;
    reservation.EntryCount = 0;
    if (reservation.ReservationSeats) {
      reservation.ReservationSeats.forEach(seat => {
        switch (seat.Status) {
          case 1:
            reservation.OpenCount++;
            break;
          case 2:
            reservation.AcceptedCount++;
            break;
          case 3:
            reservation.RejectedCount++;
            break;
          case 4:
            reservation.ClosedCount++;
            break;
          default:
            break;
        }
        reservation.EntryCount++;
      });
    }
  }

  handleError(error) {
    this.isLoading = false;
    if (error && error.Type === 2) {
      this.notificationService.add({
        type: 'danger',
        text: `${error['ErrorCode']}: ${error['Message']}`
    });
    } else {
      this.notificationService.add({
        type: 'danger',
        text: `İşlem yapılırken bir sorun oluştu.`
      });
    }
  }

  goToCreate() {
    this.router.navigate(['create/reservation'], {relativeTo: this.route});;
  }
}
