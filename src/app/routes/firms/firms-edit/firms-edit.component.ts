import { FirmService } from './../../../services/firm.service';
import { NotificationService } from './../../../services/notification.service';


import { Component, OnInit, ChangeDetectorRef, ViewChild, ViewChildren, Inject, QueryList } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EntityService } from './../../../services/entity.service';
import { FirmCreate } from '../../../models/firm-create';
import { Observable } from 'rxjs/Observable';
import { FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { TextInputComponent } from '../../../modules/base-module/components/text-input/text-input.component';
import { HeaderTitleService } from '../../../services/header-title.service';

@Component({
  selector: 'app-firms-edit',
  templateUrl: './firms-edit.component.html',
  styleUrls: ['./firms-edit.component.scss'],
  providers:[
    EntityService,
    FirmService,
    { provide: 'entitySubService', useClass: EntityService },
    { provide: 'parentListService', useClass: EntityService },
    { provide: 'firmSubService', useClass: FirmService },
    { provide: 'localizationService', useClass: FirmService },
  ]
})
export class FirmsEditComponent implements OnInit {
  @ViewChild('weburl') weburl: TextInputComponent;
  @ViewChild('phone') phone: TextInputComponent;  
  @ViewChildren(TextInputComponent) textInputs: QueryList<TextInputComponent>;
  
  role:string = 'create';
  subscription;
  firm: FirmCreate;
  firmData = [];
  mapUrl = 'http://maps.google.com/maps?q=<LATITUDE>,<LONGITUDE>';

  isEditMode = false;
  isLoading = false;
  isPromising = false;
  firmSearchResult: Observable<{title: string, list: any[]}[]>;
  subFirms =  [];

  showEArchivePassword = false;
  showEticketPassword = false;
  firmId: any;
  title: string;

  validation: {
    Name: { isValid: any},
    HasError: { isValid: any},
    Code: { isValid: any},
    ServiceFee: { isValid: any },
    ServiceFeeVat: { isValid: any },
    TicketingFee: { isValid: any },
    TicketingFeeVat: { isValid: any },
    TicketingTrxFee: { isValid: any },
    TicketingTrxFeeVat: { isValid: any },
    InstallmentVat: { isValid: any },
    Vat: { isValid: any },
    Location: { isValid: any }
  } = {
    Name: {
      isValid(): any {
        return this.firm && this.firm.isValid('Name', true);
      }
    },
    HasError: {
      isValid(): any {
        return this.textInputs ? !this.textInputs.toArray().some( item => {return item.hasError}) : true;
      }
    },
    Code: {
      isValid(): any {
        return this.firm && this.firm.Code && this.firm.Code.length === 3;
      }
    },
    ServiceFee: {
      isValid(): any {
        return this.firm && this.firm.ServiceFee >= 0;
      }
    },
    ServiceFeeVat: {
      isValid(): any {
        return this.firm && this.firm.ServiceFeeVat >= 0;
      }
    },
    TicketingFee: {
      isValid(): any {
        return this.firm && this.firm.TicketingFee >= 0;
      }
    },
    TicketingFeeVat: {
      isValid(): any {
        return this.firm && this.firm.TicketingFeeVat >= 0;
      }
    },
    TicketingTrxFee: {
      isValid(): any {
        return this.firm && this.firm.TicketingTrxFee >= 0;
      }
    },
    TicketingTrxFeeVat: {
      isValid(): any {
        return this.firm && this.firm.TicketingTrxFeeVat >= 0;
      }
    },
    InstallmentVat: {
      isValid(): any {
        return this.firm && this.firm.InstallmentVat >= 0;
      }
    },
    Vat: {
      isValid(): any {
        return this.firm && this.firm.Vat >= 0;
      }
    },
    Location: {
      isValid(): any {
        return this.firm && this.firm.Location ? ((this.firm.Location.Longitude >= -90 && this.firm.Location.Longitude <= 90) && (this.firm.Location.Latitude >= -90 && this.firm.Location.Latitude <= 90)) : true;
      }
    }
  };

  get isValid(): boolean {
    if(this.validation
      && this.validation.Name.isValid.call(this)
      && this.validation.HasError.isValid.call(this)
      && this.validation.Code.isValid.call(this)
      && this.validation.ServiceFee.isValid.call(this)
      && this.validation.ServiceFeeVat.isValid.call(this)
      && this.validation.TicketingFee.isValid.call(this)
      && this.validation.TicketingFeeVat.isValid.call(this)
      && this.validation.TicketingTrxFee.isValid.call(this)
      && this.validation.TicketingTrxFeeVat.isValid.call(this)
      && this.validation.InstallmentVat.isValid.call(this)
      && this.validation.Vat.isValid.call(this)
      && this.validation.Location.isValid.call(this)
      ){
      return true;
    }else{
      return false
    }
  };

  constructor(
    private activeRoute: ActivatedRoute,
    private route: Router,
    private entityService: EntityService,
    private firmService: FirmService,
    private notificationService:NotificationService,
    private changeDetector: ChangeDetectorRef,
    @Inject('entitySubService') private entitySubService: EntityService,
    @Inject('parentListService') private parentListService: EntityService,
    @Inject('firmSubService') private firmSubService: FirmService,
    @Inject('localizationService') private localizationService: FirmService,
    public  headerTitleService: HeaderTitleService
  ) {

   }

  ngOnInit() {
    this.headerTitleService.setTitle('Firmalar');
    this.headerTitleService.setLink('/firms');

    this.role = this.activeRoute.snapshot.data['role'];
    this.isEditMode = this.role === 'edit';

    if (this.isEditMode) this.getParentList();
    this.setFirm();
    this.firmServiceDataHandler();
    this.changeDetector.detectChanges();
  }

  toggleVisibility(type: string) {
    if (!type) return;
    switch (type) {
      case 'EArchivePassword':
        this.showEArchivePassword = !this.showEArchivePassword;
        break;
      case 'EticketPassword':
        this.showEticketPassword = !this.showEticketPassword;
        break;
      default:
        break;
    }
  }

  onErrorHandler(notification : {id ?: string, isNew ?: boolean, type:string, text:string, timeOut?: number}) {
    this.notificationService.add(notification);
    this.isPromising = false;
  }
  
  getParentList() {
    this.subscription = this.parentListService.queryParamSubject.subscribe(queryParam => {
      this.parentListService.setCustomEndpoint('GetAll');
      this.parentListService.fromEntity('FFirm')
                            .expand(['Localization'])
                            .where('ParentId', '=', this.activeRoute.snapshot.params['id'])
                            .take(10)
                            .page(0)
                            .executeQuery();
    })
    this.parentListService.data.subscribe(parentList => {
      if(parentList.length > 0) {
        let lists = [];
        for(let parents of parentList)
        {
          lists.push({
            id: parents['Id'],
            name: parents['Localization']['Name'],
            params: {firm:parents}
          })
          this.subFirms.push({Id:parents['Id'],action:'add'});
        }
        this.firmData = lists;
      }
    })
  }

  firmServiceDataHandler() {
    this.entitySubService.data.subscribe(response => {
      if (response.length > 0) {
        let result = []
        for (let firm of response) {
          result.push({
            id: firm['Id'],
            title: firm['Localization']['Name'],
            icon: 'domain',
            params: {firm: firm}
          });
        };
        this.firmSearchResult = Observable.of([{
          title: 'ARAMA SONUÇLARI', list: result
        }]);
      } else {
        this.firmSearchResult = Observable.of([]);
      }
    });
  }
  saveFirm() {
    this.isPromising = true;
    if(this.activeRoute.snapshot.params['id'] && this.isEditMode) {
      this.firmService.update(new FirmCreate(this.firm.getRawData()), 'put').subscribe(       
        result => {
          if(this.subFirms.length > 0)
          {
            this.firmSubService.updateParents(this.subFirms, parseInt(this.activeRoute.snapshot.params['id']));
          }
          this.isPromising = false;
          this.notificationService.add({text:'Firma Düzenleme İşlemi başarılı bir şekilde tamamlandı',type:'success',timeOut:4000});
          this.route.navigate(['/firms']);
        },
        error => {
          this.onErrorHandler({text: `<b>Firma kaydedilemedi</b> Lütfen bütün gerekli alanları doldurun.<br/><small>${error.Message}</small>`, type:'warning', timeOut: 4000});
        }
      )
    }else{      
      this.firmService.flushCustomEndpoint();
      this.firmService.setCustomEndpoint('CreateFirm');
      this.firmService.create(this.firm.getRawData()).subscribe(result => {
        this.notificationService.add({text:'Yeni Firma başarılı bir şekilde oluşturuldu',type:'success',timeOut:4000});
        const firmId = result;    
        this.route.navigate(['/firms']);
      },error => {
        if (error && error.ErrorCode === "SRV0011") {
          error.Message = "Bu Kısa İsim başka firmada kullanılmaktadır.";
        }
        this.onErrorHandler({text: `${error.Message}`, type:'warning', timeOut: 4000});
        this.isPromising = false;
        this.isLoading = false;
      })    
    }
  }
  

  setFirm() {
    if (this.isEditMode && this.activeRoute.snapshot.params && this.activeRoute.snapshot.params['id']) {
      this.firmId = this.activeRoute.snapshot.params['id'];
      this.entityService.setCustomEndpoint('GetAll');
      this.entityService.fromEntity('FFirm').where('Id', '=', this.firmId).expand(['Localization']).take(1).page(0).executeQuery();
      this.isLoading = true;
      this.entityService.data.subscribe(ffirm => {
        if (ffirm && ffirm[0]) {
          this.isLoading = false;
          this.firm = new FirmCreate(ffirm[0]);
          this.getLocalization();
          this.changeDetector.detectChanges();
        }
      }, error => {
        this.onErrorHandler({text: `${error.Message}`, type: 'warning', timeOut: 8000});
      })
    } else {
      this.firm = new FirmCreate({
        "Code": "",
        "IsActive": true,
        "IsSeatSelectionEnabled": true,
        "IsPlatform": false,
        "ApiKey": null,
        "ReservationAvailable": true,
        "ServiceFee": 0,
        "ServiceFeeVat": 0,
        "TicketingFee": 0,
        "TicketingFeeVat": 0,
        "TicketingTrxFee": 0,
        "TicketingTrxFeeVat": 0,
        "InstallmentVat": 0,
        "Vat": 0,
        "Location": {
          "Latitude": 0,
          "Longitude": 0
        },
        "IdentityNumber": 0,
        "Localization": {
          "Name": null,
          "Description": null,
          "Address": null,
          "ShortName": null,
          "Tr": {
            "Name": null,
            "Description": null,
            "Address": null,
            "ShortName": null,
          },
          "En": {
            "Name": null,
            "Description": null,
            "Address": null,
            "ShortName": null
          }
        }
      })
      if (this.title) this.titleChangeHandler(this.title);
    }
  }

  firmActionHandler(event)
  {
    switch(event.action) {
      case "search":
        if(event.data && event.data.length > 0){
          this.entitySubService.setSearch({ key: 'Localization/Name', value: event.data });
          this.subscription = this.entitySubService.queryParamSubject.subscribe(queryParam => {
            this.entitySubService.setCustomEndpoint('GetAll');
            this.entitySubService.fromEntity('FFirm').expand(['Localization']).where('Id','!=',this.activeRoute.snapshot.params['id']).and('ParentId', '=', null).take(10).page(0).search(queryParam['search']['key'],queryParam['search']['value']).executeQuery();            
          })
        }
      break;
      case "remove":
        let filteredRemove = this.subFirms.filter(result => result.Id == event.data.id);
        if(filteredRemove.length !=0)
        {
          var index = this.subFirms.map(result => result.Id).indexOf(filteredRemove[0]['Id']);
          this.subFirms[index] = {Id:filteredRemove[0]['Id'],action:'remove'};
        }
      break;
      case  "add":
        let filteredAdd = this.subFirms.filter(result => result.Id == event.data.id);
        if(filteredAdd.length != 0 )
        {
          var index = this.subFirms.map(result => result.Id).indexOf(filteredAdd[0]['Id']);
          this.subFirms[index] = {Id:filteredAdd[0]['Id'],action:'add'};
        }

      break;
      }
  }

  firmChangeHandler(event) {
    if(event != null || event.length >0)
    {
    let list;
    for(list of event)
    {
      if(this.subFirms.map(result => result.Id).indexOf(list.id) == -1)
      {
        this.subFirms.push({Id:list.id,action:'add'});   
      }
    }       
    }
    else {
      this.subFirms = [];
    }
  }

  titleChangeHandler(value) {
    if (!this.firm) return;
    this.title = value;
    this.firm.set('Name', value.localization ? value.localization : value, true);
  }

  photoChangeHandler(event) {
    if(this.firm) this.firm.Images = event.data || "";
  }

  logoChangeHandler(event) {
    if (this.firm) this.firm.Logo = event.data || '';
  }

  inputChangeHandler(name: string, event) {
    if (!this.firm) return;
    switch (name) {
      case 'Code':
        this.firm['Code'] = event.toUpperCase();
        break;
      case 'Address':
        this.firm.set('Address', event.localization ? event.localization : event, true);
        break;
      case 'ShortName':
        this.firm.set('ShortName', event.localization ? event.localization : event, true);
        break;
      case 'Latitude':
      case 'Longitude':
        if (!this.firm.Location) this.firm.Location = { Latitude: 0, Longitude: 0 };
        let num = parseFloat(event);
        this.firm.Location[name] = isNaN(num) ? 0 : num;
        break;
      case 'ServiceFeeVat':
      case 'TicketingFeeVat':
      case 'TicketingTrxFeeVat':
      case 'Vat':
      case 'InstallmentVat':
        let perCent = event / 100;
        this.firm[name] = isNaN(perCent) ? 0 : perCent;
        break;
      default:
        this.firm[name] = event;
        break;
    }
    this.changeDetector.detectChanges();
  }

  descriptionChangeHandler(event) {
    if (!this.firm)  return;
    this.firm.set('Description', event.localization ? event.localization : event, true);
  }
  submitFirm(event) {
    this.saveFirm();
  }

  cancel(event) {
    if (event) {
      this.route.navigate(['/firms']);
    }
  }
  checkStatusHandler(field: string, event) {
    this.firm[field] = event;
  }

  getMapUrl(lat, lng) {
    lat = parseFloat(lat);
    lng = parseFloat(lng);
    return this.mapUrl.replace('<LATITUDE>', lat).replace('<LONGITUDE>', lng);
  }

  private getLocalization() {
    if (this.firm) {
      this.localizationService.flushCustomEndpoint();
      this.localizationService.find(this.firm['Id'], true);
      this.localizationService.data.subscribe(result => {
        if (result && result[0]) {
          this.firm.setLocalization(result[0]['Localization']);
          this.titleChangeHandler(this.firm.Localization['Name']);
          this.descriptionChangeHandler(this.firm.Localization['Description']);
          this.inputChangeHandler('Address', this.firm.Localization['Address']);
          this.inputChangeHandler('ShortName', this.firm.Localization['ShortName']);
        }
      }, error => {
        console.log(error);
      });
    }
  }
}