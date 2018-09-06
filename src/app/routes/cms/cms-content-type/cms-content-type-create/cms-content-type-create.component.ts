import { EntityService } from './../../../../services/entity.service';
import { AuthenticationService } from './../../../../services/authentication.service';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { NotificationService } from './../../../../services/notification.service';
import { TetherDialog } from './../../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderTitleService } from './../../../../services/header-title.service';
import { CmsDataService } from './../../../../services/cms-data.service';
import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';

@Component({
  selector: 'app-cms-content-type-create',
  templateUrl: './cms-content-type-create.component.html',
  styleUrls: ['./cms-content-type-create.component.scss'],
  providers: [
    { provide: 'firmEntityService', useClass: EntityService },
  ]
})
export class CmsContentTypeCreateComponent implements OnInit {

  role: string = "create";
	isEditMode: boolean = false;
	isLoading: boolean;
  isPromising: boolean;

  contentTypeData: any;
  componentContainers: {}[];
  selectedComponentContainers: {}[];
  
  relatedEntities: {
    name: string,
    label: string,
    endpoint: string,
    selected?: boolean
  }[];

  relatedDatasources: {
    id: string,
    label: string,
    datasource: any,
    selected?: boolean
  }[];

  private hasCustomSlug: boolean;

  firmList: {text: string, value: any}[];
  isSuperAdmin: boolean;

  validation: {
		Name: { isValid: any, message: string },
    PromoterCode: { isValid: any, message: string }
	} = {
		Name: {
			message: "İçerik adı zorunludur.",
			isValid(): boolean {
				return this.contentTypeData && this.contentTypeData.Name && this.contentTypeData.Name.length > 0;
			}
		},
		PromoterCode: {
			message: "Promoter Code zorunludur",
			isValid():boolean {
				return this.isSuperAdmin ? this.contentTypeData && this.contentTypeData.PromoterCode : true;
			}
    }
	};

	get isValid():boolean {
		if( this.contentTypeData && this.validation
			&& this.validation.Name.isValid.call(this)
      // && this.validation.PromoterCode.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
	};

  constructor(
    private cmsDataService: CmsDataService,
    @Inject('firmEntityService') private firmEntityService: EntityService,
    private authenticationService: AuthenticationService,
    private headerTitleService: HeaderTitleService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    public tether: TetherDialog,
    private notificationService: NotificationService,
    private appSettings: AppSettingsService
  ) { }

  ngOnInit() {
    this.headerTitleService.setTitle('');
    this.role = this.route.snapshot.data["role"];
    this.isEditMode = this.role == "edit";
    this.isLoading = true;
    
    this.componentContainers = [];
    this.cmsDataService.getAllComponentContainerTypes().subscribe( result => {
      if(result && result.length) {
        result.forEach( item => this.componentContainers.push(this.cmsDataService.createComponentContainerType(item)));
      }
      this.setContentType();
    });
  }

  private setContentType() {
    if(this.route.snapshot.params) {
      if(this.isEditMode && this.route.snapshot.params["id"]){
        let id = this.route.snapshot.params["id"];
        this.cmsDataService.getRawContentType(id).subscribe(
          result => {
            this.contentTypeData = result;
            this.setPromoterCode();
            this.selectedComponentContainers = this.contentTypeData.getComponentContainers();
            this.relatedEntities = this.contentTypeData.getRelatedEntities();
            this.relatedDatasources = this.contentTypeData.getRelatedDatasources();
            console.log(this.contentTypeData);
            this.checkSelectedComponentContainers();
            this.isLoading = false;
            this.changeDetector.detectChanges();
          },
          error => {
            this.isLoading = false;
          }
        );
      }else{
        this.contentTypeData = this.cmsDataService.createContentType();
        this.setPromoterCode();
        this.selectedComponentContainers = this.contentTypeData.getComponentContainers();
        this.relatedEntities = this.contentTypeData.getRelatedEntities();
        this.relatedDatasources = this.contentTypeData.getRelatedDatasources();
        this.isLoading = false;
        this.changeDetector.detectChanges();
      };
    };
  }

  private checkSelectedComponentContainers() {
    if(!this.selectedComponentContainers) return;
    this.componentContainers.map( item => {
      item["selected"] = this.selectedComponentContainers.some( selectedItem => selectedItem["_id"] == item["_id"] );
    });
  }

  private checkSelectedRelatedDatasources() {
    if(!this.relatedDatasources || !this.contentTypeData) return;
    let relatedDatasources = this.contentTypeData.getRelatedDatasources();
    this.relatedDatasources.map( item => item.selected = relatedDatasources.some( relateDatasource => relateDatasource._id == item.id));
  }

  addToSelectedComponentContainers(event, componentContainer) {
    if(!this.selectedComponentContainers.some( item => item["_id"] == componentContainer['_id'])){
      this.selectedComponentContainers.push(componentContainer);
      this.checkSelectedComponentContainers();
    }
  }

  selectedComponentCantainerCardActionHandler(event, componentContainer) {
    switch(event.action) {
      case "delete":
      case "remove":
        if(this.selectedComponentContainers.some( item => item["_id"] == componentContainer['_id'])){
          this.selectedComponentContainers.splice(this.selectedComponentContainers.indexOf(componentContainer), 1);
          this.checkSelectedComponentContainers();
        }   
      break;
    }
  }

  setPromoterCode() {
    this.isSuperAdmin = this.authenticationService.roleHasAuthenticate("SuperAdmin");
    if(this.isSuperAdmin) {
      this.firmEntityService.data.subscribe( entities => {
        if(entities && entities.length) {
          this.firmList = [];
          this.firmList.push({text: "Seçiniz", value: '-1'});
          entities.forEach( item => this.firmList.push({text: item.Localization.Name + " (" + item.Code + ")", value: item.Code}));
        }
      });

      this.firmEntityService.setCustomEndpoint('GetAll');
      this.firmEntityService
        .fromEntity('FFirm')
        .expand(['Localization'])
        .take(10000).page(0).executeQuery();
    }else{
      this.contentTypeData.PromoterCode = this.authenticationService.getPromoterCode();
      if(this.contentTypeData.PromoterCode) {
        this.notificationService.add({
          text: this.contentTypeData.PromoterCode + " Promoter Code ile düzenleme yapılıyor.",
          type: 'info'
        });
      }else{
        this.notificationService.add({
          text: "Kullanıcı Promoter Code bilgisi bulunamadı",
          type: 'warning'
        });
      }
    }
  }

  inputChangeHandler(event, name: string, target?: any) {
    if(!this.contentTypeData) return;
    switch(name) {
      default:
        if(!target && this.contentTypeData) this.contentTypeData.set(name, event);
        if(target) target[name] = event;
      break;
    }
    this.changeDetector.detectChanges();
  }

  gotoComponentContainerCreate(event) {
    this.tether.confirm({
      title: "Sayfadan ayrılmak üzeresiniz!",
      description: "Kaydetmediğiniz veriler kaybolabilir. Yine de devam etmek istiyor musunuz?",
      dismissButton: {label: "VAZGEÇ"},
      confirmButton: {label: "TAMAM", theme: "danger"}
    }).then( result => this.router.navigate(['cms', 'component-container', 'create']) ).catch(reoson=>{});
  }
  
  exit(event) {
    this.router.navigate(["cms", "content-types"]);
  }

  saveContentType() {
    this.isPromising = true;
    this.contentTypeData.saveComponentContainerTypes();
    this.contentTypeData.saveRelatedEntities();
    this.contentTypeData.saveRelatedDatasources();
    let saveSubscription;
    saveSubscription = this.isEditMode ? this.contentTypeData.save() : this.contentTypeData.create();
    saveSubscription.subscribe(
      result => {
        this.isPromising = false;
        this.notificationService.add({type: 'success', text: 'İçerik tipi başarıyla kaydedildi.'});
        this.router.navigate(["cms", "content-types"]);
      },
      error => {
        this.isPromising = false;
        this.notificationService.add({type: 'danger', text: 'İçerik tipi kaydedilemedi: '+error.Message});
      }
    )
  }

}
