import { VenueService } from './../../../services/venue.service';
import { Component, OnInit, ComponentRef, ComponentFactoryResolver, Injector, Inject, ChangeDetectorRef } from '@angular/core';
import { EntityService } from '../../../services/entity.service';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { CreateHallBoxComponent } from '../components/create-hall-box/create-hall-box.component';
import { TetherDialog } from './../../common-module/modules/tether-dialog/tether-dialog'
import { Hall } from '../../../models/hall';
import { HallService } from '../services/hall.service'
import { EntityAttributeService } from '../../../services/entity-attribute.service';

@Component({
  selector: 'app-halls',
  templateUrl: './halls.component.html',
  styleUrls: ['./halls.component.scss'],
  entryComponents: [CreateHallBoxComponent],
  providers: [HallService, EntityAttributeService, 
    { provide: 'hallEntityService', useClass: EntityService },
    { provide: 'entityTypeEntityService', useClass: EntityService }]
})
export class HallsComponent implements OnInit {

  constructor(
    @Inject('hallEntityService') public hallEntityService: EntityService,
    @Inject('entityTypeEntityService') public entityTypeEntityService: EntityService,
    private route: ActivatedRoute,
    private venueService: VenueService,
    private resolver: ComponentFactoryResolver,
    private changeDetector: ChangeDetectorRef,
    private injector: Injector,
    public tether: TetherDialog,
    private hallService: HallService,
    private entityAttributeService: EntityAttributeService
  ) { }

  halls: any;
  realHalls: any;

  hallDate = moment().startOf('day');
  startDate;
  endDate;

  errorMessage: any;
  subscription;
  subscriptionEntityTypeData;
  subscriptionAttributeData;
  pageID;

  pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
  pageSize: number = 10;
  currentPage: number = 1;

  componentCreateBox: CreateHallBoxComponent;

  componentContainerData: any;

  isLoading: boolean = false;
  isCreateAvailable: boolean = true;

  entityTypeId: number = -1;

  ngOnInit() {

    this.subscribeToData();

    this.venueService.snapshotId.subscribe(result => {
      this.pageID = result;
      this.getCurrentHalls();
    })
    // this.getCurrentHalls();

  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
    if (this.subscriptionEntityTypeData) this.subscriptionEntityTypeData.unsubscribe();
    if (this.subscriptionAttributeData) this.subscriptionAttributeData.unsubscribe();
  }

  handleAttributes(result){
    result.forEach(r => {
      let hallId = r.EntityId;
      let hall;
      if(this.halls) hall = this.halls.find(item => { return item.Id == hallId });
      if(hall){
        let attributes: any[];
        attributes = [r];
        if(hall.Attributes){
          hall.Attributes.push(r);
        }else{
          hall.Attributes = attributes;
        }
      }      

    });
    
    this.realHalls = this.halls;
    this.isLoading = false;

  }

  subscribeToData() {

    this.subscriptionEntityTypeData = this.entityTypeEntityService.data.subscribe(result => {
      
      if (result && result[0]) {
        this.entityTypeId = result[0].Id;
        this.getAttributes();        
      }
    });

    this.subscriptionAttributeData = this.entityAttributeService.data.subscribe(result => {
      this.handleAttributes(result);
    }, error => {
      console.log("error getting attributes = ", error);
      this.isLoading = false;
    });

    this.subscription = this.hallEntityService.data.subscribe(
      result => {
        let resultArr = [];
        resultArr = result;
        this.checkForCreateHallPossibility(result);
        if (resultArr.length > 0) {
          if (result[0].Halls && result[0].Halls.length > 0) {
            this.halls = result[0].Halls;
            // console.log("halls = ", this.halls);
            this.filterForActiveHalls();
            this.filterPerformances();
            this.getEntityTypeId();
          }else{
            this.halls = null;
            this.realHalls = null;   
            this.isLoading = false;         
          }
        } else {
          this.halls = null;
          this.realHalls = null;
          this.isLoading = false;
        }
      },
      error => {
        this.errorMessage = <any>error
      }
    );
  }

  getEntityTypeId() {
    this.entityTypeEntityService.flushCustomEndpoint();
    this.entityTypeEntityService.setCustomEndpoint('GetAll');
    this.entityTypeEntityService.fromEntity('AEntityType').where('EntityTypeCode', '=', "'HALL'").page(0).take(1).executeQuery();
  }

  getAttributes() {
    if (this.halls) {    
      this.entityAttributeService.flushCustomEndpoint();
      this.entityAttributeService.setCustomEndpoint('GetEntityAttributeList');

      let filterString = 'EntityTypeId eq ' + this.entityTypeId + ' and IsActive eq true';

      for(let i=0; i<this.halls.length; i++){
        if(i == 0){
          filterString += ' and (EntityId eq ' + this.halls[i].Id;
        }else{
          filterString += ' or EntityId eq ' + this.halls[i].Id;
        }
      }

      filterString += ')';
      this.entityAttributeService.query({pageSize: 100, filter: [{filter: filterString}]});      
      try{
        this.entityAttributeService.executeQuery();
      }catch(e){
        console.log("attribute error = ", e);
      }
      // this.entityAttributeService.executeQuery();

    }else{
      this.realHalls = this.halls;
      this.isLoading = false;
    }
  }

  getCurrentHalls() {

    // this.subscribeToData();

    this.halls = null;
    this.realHalls = null;
    this.isLoading = true;

    if (!this.startDate ||  !this.endDate) {
      this.startDate = moment(this.hallDate).startOf('day');
      this.endDate = moment(this.hallDate).endOf('day');
    }

    this.hallEntityService.setCustomEndpoint("GetAll");
    let query = this.hallEntityService.fromEntity('VVenue')
      .where('Id', '=', this.pageID)
      .expand(['Halls', 'Templates', 'Performances', 'Event', 'Localization'])
      .expand(['Halls', 'Localization'])
      .expand(['Templates'])
      .take(1000)
      .page(0);

    query.executeQuery();

  }

  filterForActiveHalls() {

    let hallsToDelete = [];

    if (!this.halls) return;

    this.halls.forEach(hall => {
      if (!hall.IsActive) hallsToDelete.push(hall);
    });

    hallsToDelete.forEach(hall => {
      var index = this.halls.indexOf(hall);
      if (index > -1) {
        this.halls.splice(index, 1);
      }
    });

    if (this.halls.length === 0) this.halls = null;

  }

  checkForCreateHallPossibility(result) {
    if (result && result.length > 0) {
      result.forEach(res => {
        if (res.Templates && res.Templates.length > 0) {
          for (let i = 0; i < res.Templates.length; i++) {
            if (!res.Templates[i].HallId) {
              this.isCreateAvailable = false;
              break;
            }
          }
        } else {
          this.isCreateAvailable = true;
        }
      });
    }
  }

  filterPerformances() {

    let perfsToDelete = [];

    if (this.halls) {

      this.halls.forEach(hall => {
        if (hall.Templates) {
          hall.Templates.forEach(temp => {
            if (temp.Performances) {
              temp.Performances.forEach(perf => {
                if (!(moment(perf.Date) >= moment(this.startDate) && moment(perf.Date) <= moment(this.endDate))) {
                  perfsToDelete.push(perf);
                }
              });
            }
          });
        }
      });

      perfsToDelete.forEach(perf => {
        this.halls.forEach(hall => {
          if (hall.Templates) {
            hall.Templates.forEach(temp => {
              if (temp.Performances) {
                var index = temp.Performances.indexOf(perf);
                if (index > -1) {
                  temp.Performances.splice(index, 1);
                }
              }
            });
          }
        });
      });

      perfsToDelete = null

    }

  }

  updateLocalParams(params: Object = {}) {
    this.currentPage = params['page'] ? params['page'] : 0
    this.pageSize = params['pageSize'] ? params['pageSize'] : 10
  }

  inputChangeHandler(event, name: string, target?: any) {
    switch (name) {
      case 'hallDate':
        this.hallDate = event;
        this.startDate = moment(this.hallDate).startOf('day');
        this.endDate = moment(this.hallDate).endOf('day');
        // console.log("start = ", this.startDate.toISOString(), "\nend = ", this.endDate.toISOString(),"\n\n");
        this.getCurrentHalls();
        break;
    }
  }

  openCreateBox(isEditMode: boolean, event?, hall?: Hall) {

    let component: ComponentRef<CreateHallBoxComponent> = this.resolver.resolveComponentFactory(CreateHallBoxComponent).create(this.injector);
    this.componentCreateBox = component.instance;
    this.componentCreateBox.isEditMode = isEditMode;
    this.componentCreateBox.title = isEditMode ? "Salon Düzenle" : "Salon Ekle";
    this.componentCreateBox.venueId = this.pageID;
    this.componentCreateBox.defaultHall = hall ? hall : null;

    this.tether.modal(component, {
      escapeKeyIsActive: true
    }).then(result => {
      this.getCurrentHalls();
    }).catch(reason => {
      console.log(reason);
    });

  }

  hallEditEventHandler(event) {
    this.openCreateBox(true, null, event);
  }

  hallRemoveEventHandler(event) {

    this.isLoading = true;

    this.hallService.flushCustomEndpoint();
    this.hallService.setCustomEndpoint("Remove");
    this.hallService.delete(event).subscribe(
      result => {
        console.log("remove result = ", result);
        this.isLoading = false;
        this.getCurrentHalls();
      },
      error => {
        console.log("remove error = ", error);
        this.isLoading = false;
      },
      completed => {

      }
    );
  }

}
