import { EntityService } from './../../../../services/entity.service';
import { AuthenticationService } from './../../../../services/authentication.service';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { NotificationService } from './../../../../services/notification.service';
import { TetherDialog } from './../../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderTitleService } from './../../../../services/header-title.service';
import { CmsDataService } from './../../../../services/cms-data.service';
import { DatasourceParameterCreateBoxComponent } from './../../../../modules/cms-module/common/datasource-parameter-create-box/datasource-parameter-create-box.component';
import { Component, OnInit, Input, ChangeDetectorRef, Injector, ComponentFactoryResolver, ComponentRef, Inject } from '@angular/core';

@Component({
  selector: 'app-cms-datasource-create',
  templateUrl: './cms-datasource-create.component.html',
  styleUrls: ['./cms-datasource-create.component.scss'],
  providers: [CmsDataService,
    { provide: 'firmEntityService', useClass: EntityService },
  ],
  entryComponents: [DatasourceParameterCreateBoxComponent]
})
export class CmsDatasourceCreateComponent implements OnInit {
  role: string = "create";
	isEditMode: boolean = false;
	isLoading: boolean;
  isPromising: boolean;

  datasource: any;
  @Input() parameters: {
    key: string,
    type: string,
    label: string,
    relatedEntityType: string,
    allowMultiple?: boolean,
    value?: string
  }[];

  parameterCreateBox: DatasourceParameterCreateBoxComponent;
  entityTypes: {text: string, value: any}[];

  firmList: {text: string, value: any}[];
  isSuperAdmin: boolean;

  validation: {
		Name: { isValid: any, message: string },
    Url: { isValid: any, message: string },
    PromoterCode: { isValid: any, message: string }
	} = {
		Name: {
			message: "Veri Kaynağı adı zorunludur.",
			isValid(): boolean {
				return this.datasource && this.datasource.Name && this.datasource.Name.length > 0;
			}
		},
		Url: {
			message: "Promoter Code zorunludur",
			isValid():boolean {
				return this.datasource && this.datasource.Url && this.datasource.Url.length > 0;
			}
    },
    PromoterCode: {
			message: "Promoter Code zorunludur",
			isValid():boolean {
				return this.isSuperAdmin ? this.datasource && this.datasource.PromoterCode : true;
			}
    }
	};

	get isValid():boolean {
		if( this.datasource && this.validation
			&& this.validation.Name.isValid.call(this)
      && this.validation.Url.isValid.call(this)
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
    private appSettingsService: AppSettingsService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    public tether: TetherDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.headerTitleService.setTitle('');
    this.role = this.route.snapshot.data["role"];
    this.isEditMode = this.role == "edit";

    let entityTypes = this.appSettingsService.getLocalSettings('entityTypes');
    this.entityTypes = [];
    this.entityTypes.push({text: "Seçiniz", value: null});
    entityTypes.forEach( item => this.entityTypes.push({text: item.label, value: item.name}));

    this.setDatasource();
  }

  private setDatasource() {
    if(this.route.snapshot.params) {
      if(this.isEditMode && this.route.snapshot.params["id"]){
        let id = this.route.snapshot.params["id"];
        this.cmsDataService.getDatasource(id).subscribe(
          result => {
            this.datasource = result;
            this.setPromoterCode();
            this.parameters = this.datasource.getParameters();
            this.changeDetector.detectChanges();
          },
          error => {

          }
        );
      }else{
        this.datasource = this.cmsDataService.createDatasource();
        this.setPromoterCode();
        this.parameters = this.datasource.getParameters();
      };
    };
  }

  openParameterCreateBox(targetParameter:any = null) {
    let component:ComponentRef<DatasourceParameterCreateBoxComponent> = this.resolver.resolveComponentFactory(DatasourceParameterCreateBoxComponent).create(this.injector);
    this.parameterCreateBox = component.instance;
    this.parameterCreateBox.parameter = targetParameter;
    
    this.tether.modal(component, {
      escapeKeyIsActive: true
    }).then(result => {
      let existParameter = this.parameters.find( item => item.key == result.key);
      if(!existParameter) this.parameters.push(result);
      if(!targetParameter && existParameter) {
        this.notificationService.add({type: 'danger', text: result.key + ' adında başka bir parametre var'});
      }
    }).catch( reason => {
      console.log(reason);
    });
  }

  addNewParameter() {
    this.openParameterCreateBox();
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
      this.datasource.PromoterCode = this.authenticationService.getPromoterCode();
      if(this.datasource.PromoterCode) {
        this.notificationService.add({
          text: this.datasource.PromoterCode + " Promoter Code ile düzenleme yapılıyor.",
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
		if(!target && this.datasource) this.datasource.set(name, event);
    if(target) target[name] = event;
    this.changeDetector.detectChanges();
  }

  parameterActionHandler(event, component) {
    switch(event.action) {
      case "edit":
        this.openParameterCreateBox(event.params.parameter);
      break;
      case "remove":
      let existParameter = this.parameters.find( item => item.key == event.params.parameter.key);
      if(existParameter) this.parameters.splice(this.parameters.indexOf(existParameter), 1);;
      break;
    }
  }

  exit(event) {
    this.router.navigate(["cms", "datasources"]);
  }

  saveDatasource() {
    this.isPromising = true;
    let saveSubscription;
    saveSubscription = this.isEditMode ? this.datasource.save() : this.datasource.create();
    saveSubscription.subscribe(
      result => {
        this.isPromising = false;
        this.notificationService.add({type: 'success', text: 'Veri kaynağı başarıyla kaydedildi.'});
        this.router.navigate(["cms", "datasources"]);
      },
      error => {
        this.isPromising = false;
        this.notificationService.add({type: 'danger', text: 'Veri kaynağı kaydedilemedi: '+error.Message});
      }
    )
  }

}
