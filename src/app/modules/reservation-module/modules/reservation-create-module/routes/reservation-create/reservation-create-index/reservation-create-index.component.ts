import { ReservationSeat } from './../../../models/reservation-seat';
import { Subscription } from 'rxjs/Subscription';
import { SeatStatistics } from './../../../../../../../models/seat-statistics';
import { CrmAnonymousUser } from './../../../../../../../models/crm-anonymous-user';
import { ReservationCreate } from './../../../models/reservation-create';
import { Performance } from './../../../../../../../models/performance';
import { ReservationCreateRoles } from './../../../models/reservation-create-roles';
import { ReservationCreateRole } from './../../../models/reservation-create-role';
import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { ReservationCreateService } from '../../../reservation-create.service';
import { Router } from '@angular/router';
import { ReservationCreateSettings } from '../../../models/reservation-create-settings';
import { EntityService } from '../../../../../../../services/entity.service';

@Component({
  selector: 'app-reservation-create-index',
  templateUrl: './reservation-create-index.component.html',
  styleUrls: ['./reservation-create-index.component.scss']
})
export class ReservationCreateIndexComponent implements OnInit {

  isLoading: boolean;

  role: ReservationCreateRole;
  performance: Performance;
  reservationCreate: ReservationCreate;
  customers: CrmAnonymousUser[];
  customerCsv: any;
  
  rsvpOptions: {label: string, value: any, icon: string, disabled?: boolean}[];
  hoursRange: {value: any, text: string}[];

  seatStatistics: SeatStatistics;
  statistics: {}[];
  infoStatistics: {}[];

  currentRoleSubscription: Subscription;
  performanceSubscription: Subscription;
  customerFactoriesSubscription: Subscription;
  seatStatisticsSubscription: Subscription;

  public validation: {
    Name: { isValid: any, message: string },
    ExpirationTime: { isValid: any, message: string },
    SeatCountPerCustomer: { isValid: any, message: string },
    Customer: { isValid: any, message: string },
	} = {
    Name: {
      message: "Ad alanı zorunludur",
			isValid(): boolean {
				return this.reservationCreate && this.reservationCreate.Name && this.reservationCreate.Name.length;
			}
    },
    ExpirationTime: {
      message: "Geçerlilik süresi seçmelisiniz",
			isValid(): boolean {
				return this.role === ReservationCreateRoles.ROLE_RSVP_INVITATION ? true : (this.reservationCreate && !this.reservationCreate.ExpirationType ? true : this.reservationCreate.ExpirationTime > 0);
			}
    },
    SeatCountPerCustomer: {
      message: "Geçerlilik süresi seçmelisiniz",
			isValid(): boolean {
				return this.role !== ReservationCreateRoles.ROLE_RSVP_POOL_INVITATION ? true : this.reservationCreate && this.reservationCreate.SeatCountPerCustomer > 0;
			}
    },
    Customer: {
      message: "Ürün seçimi zorunludur.",
			isValid(): boolean {
				return this.customers && this.customers.length
			}
    }
  };
  
  public get isValid():boolean {
		if( this.validation
			&& this.validation.Name.isValid.call(this)
      && this.validation.ExpirationTime.isValid.call(this)
      && this.validation.SeatCountPerCustomer.isValid.call(this)
      && this.validation.Customer.isValid.call(this)
			){
			return true;
		}else{
      // if(this.validation) console.log(
      //   this.validation.Name.isValid.call(this),
      //   this.validation.ExpirationTime.isValid.call(this),
      //   this.validation.Customer.isValid.call(this)
      // )
			return false
		}
  };
  
  constructor(
    public reservationCreateService: ReservationCreateService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) { 
    this.seatStatistics = this.reservationCreateService.seatStatistics;
  }

  ngOnInit() {
    this.hoursRange = ReservationCreateSettings.OPTIONS_HOURS_RANGE;

    this.currentRoleSubscription = this.reservationCreateService.currentRole$.subscribe( role => {
      if(role) {
        this.role = role;
        this.reservationCreate = this.reservationCreateService.reservationCreate;
        
        this.rsvpOptions = (this.role === ReservationCreateRoles.ROLE_RSVP_INVITATION || this.role === ReservationCreateRoles.ROLE_RESERVATION) ? ReservationCreateSettings.OPTIONS_RSVP : null;
        if(!this.reservationCreate.ExpirationType) this.reservationCreate.ExpirationType = this.role.expirationTypes ? 0 : null;
        if(!this.reservationCreate.ExpirationTime) this.reservationCreate.ExpirationTime = this.reservationCreate.ExpirationType !== null ? 0 : null;
      }
    });

    this.performanceSubscription = this.reservationCreateService.performance$.subscribe( performance => {
      if(performance) {
        this.performance = performance;
      }
    });

    this.customerFactoriesSubscription = this.reservationCreateService.customerFactories$.subscribe ( customerFactories => {
      if(customerFactories) {
        this.customers = [];
        customerFactories.forEach( customerFactory => this.customers.push(customerFactory.model) );
      }else {
        this.customers = null;
      }
    });

    this.seatStatisticsSubscription = this.reservationCreateService.seatStatistics$.subscribe( statistics => {
      if(statistics) {
        this.statistics = [];
        let infoStatistics = [];
        if(this.seatStatistics.totalCapacityCount != null) infoStatistics.push({key: 'totalCapacityCount', label: 'TOPLAM KAPASİTE', value: this.seatStatistics.totalCapacityCount});
        if(this.seatStatistics.onSaleCount != null) infoStatistics.push({key: 'onSaleCount', label: 'SATIŞTA', value: this.seatStatistics.onSaleCount});
        this.statistics = [infoStatistics];
      }
    });

    this.reservationCreateService.customerCsv$.subscribe( csv => this.customerCsv = csv );
  }

  ngOnDestroy() {
    if(this.currentRoleSubscription) this.currentRoleSubscription.unsubscribe();
    if(this.performanceSubscription) this.performanceSubscription.unsubscribe();
    if(this.customerFactoriesSubscription) this.customerFactoriesSubscription.unsubscribe();
    if(this.seatStatisticsSubscription) this.seatStatisticsSubscription.unsubscribe();
  }

  rsvpOptionChangeHandler(event:any) {
    if(!this.performance) return;
    let parentRoutePath: string = this.role.parentRoutePath;
    this.router.navigate(['/performance', this.performance.Id, parentRoutePath, 'create', event.value]);
  }

  backClickHandler(event:any) {
    if(!this.performance) return;
    this.router.navigate(['/performance', this.performance.Id, this.role.parentRoutePath]);
  }

  inputChangeHandler(event, name: string, target?: any) {
    if(!this.reservationCreate) return;
    if(!target) target = this.reservationCreate;

    switch (name) {
      default: 
        this.reservationCreateService.set(name, event);
      break;
    }
  }

  customersChangeHandler(event:CrmAnonymousUser[]) {
    this.reservationCreateService.setCustomerFactories(event);
  }

  csvChangeHandler(event: {file: File, fileData: any, payload?: any}) {
    this.reservationCreateService.setCustomerCsv(event);
  }

  toggleDescription() {
    this.reservationCreate.Description = this.reservationCreate.Description != null ? null : "";
  }

  submitClickHandler(event) {
    this.reservationCreateService.createPayload().then( payload => {
      this.router.navigate(['/performance', this.performance.Id, this.role.parentRoutePath, 'create', this.reservationCreateService.currentRole.path, 'seat-editor']);
    });
  }

  csvValidateFile(file: File, fileData) {
    let result: {valid: boolean, message: string, payload?:any};
    let payload: any[] = [];
    let payloadItem: {};
    let fields: string[];
    let valid: boolean;
    let customer: CrmAnonymousUser;
    let customers: CrmAnonymousUser[] = [];
    let vSeatId: number;

    fileData.split(/\n/).map( line => {
      if(line && line.length > 0) line = line.replace(/^\"|\"$/gm,'');
      // console.log(line, typeof line);
      fields = line.split(';');

      if(fields.length == 4 || fields.length == 5) {
        customer = new CrmAnonymousUser({
          FirstName: fields[0],
          LastName: fields[1],
          PhoneNumber: fields[2],
          Email: fields[3]
        });
        vSeatId = fields.length == 5 ? parseInt(fields[4]) : null;

        payloadItem = {
          customer: customer,
          vSeatId: vSeatId
        }
        payload.push(payloadItem);
      }
    });
    valid = payload.length > 0;
    result = {
      valid: valid,
      message: valid ? (payload.length + " kişi başarıyla eklendi") : "Yüklenen csv dosyasından kişiler alınamadı.",
      payload: payload
    }
    return result;
  }
}
