import { ProductFactory } from './../../factories/product.factory';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MulitplePerformanceService } from './../../mulitple-performance.service';
import { Component, OnInit, Inject } from '@angular/core';
import { EventFactory } from '../../factories/event.factory';
import { EntityService } from '../../../../services/entity.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-multiple-performance-create',
  templateUrl: './multiple-performance-create.component.html',
  styleUrls: ['./multiple-performance-create.component.scss'],
  providers: [
    MulitplePerformanceService,
    { provide: 'entityTypeEntityService', useClass: EntityService },
    { provide: 'currencyEntityService', useClass: EntityService },
  ],
})
export class MultiplePerformanceCreateComponent implements OnInit {

  childRoutename: string;
  entityTypeId: number;

  constructor(
    private multiplePerformanceService: MulitplePerformanceService,
    @Inject('entityTypeEntityService') private entityTypeEntityService: EntityService,
    @Inject('currencyEntityService') private currencyEntityService: EntityService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appSettingsService: AppSettingsService
  ) { 
    this.activatedRoute.url.subscribe( url => {
      this.activatedRoute.firstChild.url.subscribe( childUrl => {
        this.childRoutename = childUrl[0].path;
        this.multiplePerformanceService.setCurrentLevelByKey(this.childRoutename);
        this.multiplePerformanceService.currentRoute(this.childRoutename);
      });
    });
    this.entityTypeDataHandler();
  }

  ngOnInit() {
    // let baseProductFactory = this.multiplePerformanceService.createProductFactory();
    // baseProductFactory.vatList = cloneDeep(this.appSettingsService.getLocalSettings('vatList'));
    // baseProductFactory.vatList.unshift({text: 'Seçiniz', value: '-1'});

    
    this.multiplePerformanceService.baseProductFactory$.subscribe( baseProductFactory => {
      if(baseProductFactory) {
        if(!baseProductFactory.vatList) this.setVatList(baseProductFactory);
        if(!baseProductFactory.currencyList) this.setCurrencyList(baseProductFactory);
        if(!baseProductFactory.defaultTicketingFee) baseProductFactory.defaultTicketingFee = null;
      }
    });
    if(!this.multiplePerformanceService.baseProductFactory) this.multiplePerformanceService.setBaseProductFactory(this.multiplePerformanceService.createProductFactory());
  }

  entityTypeDataHandler() {
		this.entityTypeEntityService.data.subscribe( result => {
			if(result && result[0]) {
        this.entityTypeId = result[0].Id;
        this.multiplePerformanceService.entityTypeId = this.entityTypeId;
        
        this.multiplePerformanceService.setCurrentEventFactory(this.multiplePerformanceService.createEventFactory({	"Status": 4,
				 "Images": null,
				
				 "ReservationAvailable": false,
		
				"ReservationExpirationType": 0,
				"ReservationExpirationTime": 0,
				"IsInviteFriendAvailable": false,
				"InviteFriendExpirationType": 0,
				"InviteFriendExpirationTime": 0,
				"SuspensionReason": null,
				"CancellationReason": null,}));
			}
    });
		this.entityTypeEntityService.setCustomEndpoint('GetAll');
		this.entityTypeEntityService.fromEntity('AEntityType').where('EntityTypeCode', '=', "'EVT'").page(0).take(1).executeQuery();
  }

  setVatList(productFactory: ProductFactory) {
    if(!productFactory) return;
    if(!productFactory.vatList) {
      productFactory.vatList = cloneDeep(this.appSettingsService.getLocalSettings('vatList'));
      productFactory.vatList.unshift({text: 'Seçiniz', value: '-1'});
    }
  }

  setCurrencyList(productFactory: ProductFactory) {
    if(!productFactory) return;
    this.currencyEntityService.setCustomEndpoint('GetAll');
    this.currencyEntityService.data.subscribe( result => {
      productFactory.currencyList = [];
      result.forEach( currency => {
        productFactory.currencyList.push({text: `${currency['Code']}`, value: currency['Id'], name: currency['Name']});
      });
      productFactory.defaultCurrencyId = 19;
    });
    this.currencyEntityService.fromEntity('CCurrency').take(100).page(0).executeQuery();
  }

}
