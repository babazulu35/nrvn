
import { LocalizationPipe } from './../../../../../pipes/localization.pipe';
import { Router } from '@angular/router';
import { TetherDialog } from './../../../../common-module/modules/tether-dialog/tether-dialog';
import { EntityAttributeService } from './../../../../../services/entity-attribute.service';
import { EntityAttribute } from './../../../../../models/entity-attribute';
import { EventService } from './../../../../../services/event.service';
import { EntityFirmService } from './../../../../../services/entity-firm.service';
import { EntityFirm } from './../../../../../models/entity-firm';
import { PerformanceFactory } from './../../../factories/performance.factory';
import { PerformanceService } from './../../../../../services/performance.service';
import { NotificationService } from './../../../../../services/notification.service';
import { EventFactory } from './../../../factories/event.factory';
import { Component, OnInit } from '@angular/core';
import { MulitplePerformanceService } from '../../../mulitple-performance.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Event } from '../../../../../models/event';

@Component({
  selector: 'app-multiple-performance-create-performances',
  templateUrl: './multiple-performance-create-performances.component.html',
  styleUrls: ['./multiple-performance-create-performances.component.scss'],
  providers: [PerformanceService,EventService,EntityFirmService,EntityAttributeService,LocalizationPipe]
})
export class MultiplePerformanceCreatePerformancesComponent implements OnInit {
  eventFactory: EventFactory;
  performanceFactory: PerformanceFactory
  performanceList = [];
  event: Event;
  isLoading:boolean = false;
  timeIsValid:boolean = false;

  eventSubscription: Subscription;
  performanceSubscription: Subscription;


  durationValue:number;
  sponsors:EntityFirm[];
  promoters:EntityFirm[];
  attributes:EntityAttribute[];

  performanceCount:number;
  
  get levels() { return this.multiplePerformanceService.levels; }
  get currentLevel() { return this.multiplePerformanceService.currentLevel }

  validation: {
    PerformanceList: {isValid:any,message:string},
    SetDuration: {isValid:any,message:string},
  }= {
    PerformanceList: {
      message:'Lütfen Performans Saati ve Tarihi Giriniz !',
      isValid():boolean {
        return this.timeIsValid ;
      }      
    },
    SetDuration: {
      message: 'Lütfen Ektinlik Süresini Giriniz!',
      isValid():boolean {
        return this.performanceFactory && this.performanceFactory.baseDuration > 0;
      }

    }
  }
  get isValid():boolean {
    if(this.validation.PerformanceList.isValid.call(this) && this.validation.SetDuration.isValid.call(this)) {
      return true;
    }
    else {
      return false;
    }
  }
  
  constructor(
    private multiplePerformanceService: MulitplePerformanceService,
    private performanceService: PerformanceService,
    private notificationService: NotificationService,
    private entityFirmService: EntityFirmService,
    private eventService: EventService,
    private entityAttributeService: EntityAttributeService,

    private tether: TetherDialog,
    private router:Router,
    private localPipe: LocalizationPipe

  ) { }

  ngOnInit() {
    this.timeIsValid = false;
    this.eventSubscription = this.multiplePerformanceService.currentEventFactory$.subscribe( currentEventFactory => {
      this.eventFactory = currentEventFactory;
      if(this.eventFactory)
      {  
        
        this.event = currentEventFactory.model;

        if(!this.eventFactory.model.Id && this.eventFactory.model.Id == undefined) {
        
          this.eventFactory.sponsors$.subscribe(sponsors => {
            this.sponsors = [];
            this.sponsors = sponsors;
            
          })
  

          this.eventFactory.promoters$.subscribe(promoters => {

            this.promoters = [];
            this.promoters = promoters;
          })
  
          this.eventFactory.entityAttributes$.subscribe(attributes => {
            this.attributes =  [];
            this.attributes = attributes;
          })
        }
        else {
          
        }
        
        this.eventFactory.performances$.subscribe(result => {
        
        });   


      }
 
    });
    this.performanceSubscription = this.multiplePerformanceService.basePerformanceFactory$.subscribe( performanceFactory => {
      this.performanceFactory = performanceFactory;
      if(performanceFactory) {
      }
    });   
    
  }

  ngOnDestroy() {
    if(this.eventSubscription) this.eventSubscription.unsubscribe();
    if(this.performanceSubscription) this.performanceSubscription.unsubscribe();
  }

  changeEventHandler(event) {
    this.timeIsValid = event;
  }

  countEventHandler(event) {
    this.performanceCount = event
  }

  createPayload() {

    this.multiplePerformanceService.createPayload().then( payload => console.log(payload)).catch(error => console.log(error));
    
  }

 saveSponsors(eventId) {
    if(this.sponsors && this.sponsors.length > 0) {

    
    this.addEventIdToSponsors(eventId);
    this.entityFirmService.setCustomEndpoint('PostAll');
    this.entityFirmService.create(this.sponsors).subscribe(
      response => {
         
          return true
         
      },
      error => {
        
          return false;
        
      })
  }else {
    return true;
  }
}

  savePromoters(eventId) {
    this.addEventIdToPromoters(eventId);
    this.entityFirmService.setCustomEndpoint('PostAll');
    this.entityFirmService.create(this.promoters).subscribe(response => {
      if(response) {
        return true;
      }
    }, error => {
      if(error) {
        return false;
      }
    })
  }



  saveAttributes(eventId) {
    this.addEventIdToAttributes(eventId);
    this.entityAttributeService.setCustomEndpoint('PostAll');
    this.entityAttributeService.create(this.attributes).subscribe(response => {
      if(response) {
        return true;
      }
    },error => {
      if(error) {
        return false;
      }
    })
  }

  addEventIdToSponsors(id) {
    
    this.sponsors.forEach(result => {
      result['EventId'] = id
    })
   
   return this.sponsors;
 }
 addEventIdToPromoters(id) {
   
   this.promoters.forEach(result => {
     result['EventId'] = id
   })
  
  return this.promoters;
}

addEventIdToAttributes(id) {
   
 this.attributes.forEach(result => {
   result['EntityId'] = id
 })

return this.attributes;
}

  createEvent() {
    this.eventService.setCustomEndpoint("CreateEvent");

    this.eventService.create(this.eventFactory.model.getRawData()).subscribe(result => {
      this.event.Id = result;
    
      this.createNewEvent(this.event.Id).then(response=> {
        this.isLoading = true;
        if(response) {
         
           this.saveSponsors(result);
           return true;          
        }
  
      }).then(saveSponsorResponse => {
         
          if(saveSponsorResponse)
          {
          this.savePromoters(result);
          return true;
        }
      }).then(savePromotersResponse => {
        if(savePromotersResponse)
        {
          this.saveAttributes(result);
          return true;
        }
        

      }).then(saveAttributesResponse => {
        if(saveAttributesResponse) {
          this.eventFactory.model.set("EventId",result); 
          this.eventFactory.set('Localization',this.performanceFactory.model.Localization);
          this.submitHandler();
        }
      }).catch(error => {
        this.isLoading = false;
        console.log("There is A Error on Chaining",error);
      })
    })

  }

  createNewEvent(event):Promise<any> {
    return new Promise((resolve,reject) => {
      if(event)
      {
        resolve(event);
      }
      else {
        reject({Message:'Yeni etkinlik oluşuturalamdı',status:false});
      }
      
    }).catch( error => {
      
    })
  }

  submitHandler() {
    
    if(this.isValid) {
      if(!this.eventFactory.model.Id)
      {
        this.createEvent();
      }
      else 
      {
      this.multiplePerformanceService.createPayload().then( result => {
        this.isLoading = true;
        this.performanceService.flushCustomEndpoint();
        this.performanceService.setCustomEndpoint('CreateMultiplePerformancesAsync');
        this.performanceService.create(result).subscribe( saveResult => {
          this.notificationService.add({type: "success", text: "Çoklu performans oluşturulmak üzerek kuyruğa eklendi.",timeOut:2000});
          this.multiplePerformanceService.setCurrentEventFactory(this.multiplePerformanceService.createEventFactory(null));
          this.multiplePerformanceService.setBasePerformanceFactory(this.multiplePerformanceService.createPerformanceFactory(null));
          this.router.navigate(['multiple-performance/create']);
          this.isLoading = false;
          

        }, error => {
          this.notificationService.add({type: "danger", text: "Bir Hata meydana geldi"});
          this.isLoading = false;
        });
      });
    }
  
    }
  }

  durationEventHandler(duration:number) {

    this.multiplePerformanceService.basePerformanceFactory.setDuration(duration);
   
  }

  legalMessageModal(event,pointer) {
    console.log("level",this.currentLevel.key);
    this.tether.confirm({
      title: `Geriye gitmek istediğinizden emin misiniz ?`,
      description: `Bu sayfadan geriye gitmek, girilmiş tüm performanslarınızı silecektir!`,
      confirmButton: {label: 'DEVAM ET'},
      dismissButton: {label: 'İPTAL'}
    }).then(result => {
      if(result) {
        switch(pointer) {
          case "Wizard":
            this.multiplePerformanceService.currentLevelChangeHandler(event)
          break;
          case "BackBtn":
            this.multiplePerformanceService.goBack();
          break;
        }
        
      } 
      
    }).catch( reason => {
    });
  }
  createPayloadConfirmationModal(){
    let eventName ="";
    let performanceCount = this.performanceCount;
    let productCount = this.performanceFactory.productFactories.length;
    eventName = this.event.Localization.Name;
    
    this.tether.confirm({
      title: `${this.localPipe.transform(eventName)}  etkinliği için etkinlik oluşturma işlemini tamamlamak üzeresiniz. Devam etmek istiyor musunuz ?`,
      description: `<strong>DİKKAT!</strong> Bu işlem sonucunda <strong>${performanceCount} performans</strong> ve buna bağlı olarak her performans için <strong> ${productCount} ürün </strong> oluşturulacaktır.`,
      dismissButton: {label: "VAZGEÇ"},
      confirmButton: {label: "KAYDET", theme: "primary"},

    },
      {
       dialog: {
         style: {
          width: "405px"
         }
       }
    }).then( result =>  {
     this.submitHandler();
    }).catch(reason=>{
      console.log("Dismiss Reason",reason);

    });
  }
}
