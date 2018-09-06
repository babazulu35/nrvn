import { AuthenticationService } from './../../../../services/authentication.service';
import { EntityService } from './../../../../services/entity.service';
import { CmsFieldCreateBoxComponent } from './../../../../modules/cms-module/common/cms-field-create-box/cms-field-create-box.component';
import { CmsComponentCreateBoxComponent } from './../../../../modules/cms-module/common/cms-component-create-box/cms-component-create-box.component';
import { NotificationService } from './../../../../services/notification.service';
import { CmsComponentSettingsBlockComponent } from './../../../../modules/cms-module/components/cms-component-settings-block/cms-component-settings-block.component';
import { TetherDialog } from './../../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderTitleService } from './../../../../services/header-title.service';
import { CmsDataService } from './../../../../services/cms-data.service';
import { Component, OnInit, ChangeDetectorRef, Injector, ComponentFactoryResolver, ViewChildren, ComponentRef, Inject } from '@angular/core';

@Component({
  selector: 'app-cms-component-container-create',
  templateUrl: './cms-component-container-create.component.html',
  styleUrls: ['./cms-component-container-create.component.scss'],
  entryComponents: [CmsComponentCreateBoxComponent, CmsFieldCreateBoxComponent],
  providers: [
    { provide: 'firmEntityService', useClass: EntityService }
  ]
})
export class CmsComponentContainerCreateComponent implements OnInit {
  @ViewChildren(CmsComponentSettingsBlockComponent) componentSettingsBlocks: CmsComponentSettingsBlockComponent[];

  role: string = "create";
	isEditMode: boolean = false;
	isLoading: boolean;
  isPromising: boolean;

  componentContainerData: any;
  components: {
    Name: string,
    UniqueName: string,
    AllowMultiple: boolean
  }[];

  componentCreateBox: CmsComponentCreateBoxComponent;
  fieldCreateBox: CmsFieldCreateBoxComponent;

  firmList: {text: string, value: any}[];
  isSuperAdmin: boolean;

  validation: {
    Id: { isValid: any, message: string },
    Name: { isValid: any, message: string },
    PromoterCode: { isValid: any, message: string }
	} = {
    Id: {
			message: "İçerik adı zorunludur.",
			isValid(): boolean {
				return this.componentContainerData && this.componentContainerData._id && this.componentContainerData._id.length > 0;
			}
		},
		Name: {
			message: "İçerik adı zorunludur.",
			isValid(): boolean {
				return this.componentContainerData && this.componentContainerData.Name && this.componentContainerData.Name.length > 0;
			}
		},
		PromoterCode: {
			message: "Promoter Code zorunludur",
			isValid():boolean {
				return this.isSuperAdmin ? this.componentContainerData && this.componentContainerData.PromoterCode : true;
			}
    }
	};

	get isValid():boolean {
		if( this.componentContainerData && this.validation
      && this.validation.Id.isValid.call(this)
      && this.validation.Name.isValid.call(this)
      // && this.validation.PromoterCode.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
	};

  get allBlockCollapsed():boolean {
		let expandedPriceBlock:CmsComponentSettingsBlockComponent = this.componentSettingsBlocks.find( block => block.expandableBlock.isExpanded );
		return expandedPriceBlock ? false : true;
  }
  
  constructor(
    @Inject('firmEntityService') private firmEntityService: EntityService,
    private authenticationService: AuthenticationService,
    private cmsDataService: CmsDataService,
    private headerTitleService: HeaderTitleService,
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
    this.setComponent();
  }

  private setComponent() {
    if(this.route.snapshot.params) {
      if(this.isEditMode && this.route.snapshot.params["id"]){
        let id = this.route.snapshot.params["id"];
        this.cmsDataService.getComponentContainerType(id).subscribe(
          result => {
            this.componentContainerData = result;
            this.components = this.componentContainerData.getComponents();
            this.setPromoterCode();
            this.changeDetector.detectChanges();
          },
          error => {

          }
        );
      }else{
        this.componentContainerData = this.cmsDataService.createComponentContainerType();
        this.components = this.componentContainerData.getComponents();
        this.setPromoterCode();
      };
    };
  }

  openCmsComponentCreateBox(targetComponent:any = null) {
    let component:ComponentRef<CmsComponentCreateBoxComponent> = this.resolver.resolveComponentFactory(CmsComponentCreateBoxComponent).create(this.injector);
    this.componentCreateBox = component.instance;
    this.componentCreateBox.component = targetComponent;
    
    this.tether.modal(component, {
      escapeKeyIsActive: true
    }).then(result => {
      let existComponent = this.componentContainerData.getComponentById(result.UniqueName);
      if(!existComponent) this.componentContainerData.addComponent(result);
      if(!targetComponent && existComponent) {
        this.notificationService.add({type: 'danger', text: result.UniqueName + ' tekil isminde başka bir bileşen var'});
      }
    }).catch( reason => {
      console.log(reason);
    });
  }

  openCmsFieldCreateBox(targetComponent: any, targetField:any = null) {
    let component:ComponentRef<CmsFieldCreateBoxComponent> = this.resolver.resolveComponentFactory(CmsFieldCreateBoxComponent).create(this.injector);
    this.fieldCreateBox = component.instance;
    this.fieldCreateBox.component = targetComponent;
    this.fieldCreateBox.field = targetField;
    
    this.tether.modal(component, {
      escapeKeyIsActive: true
    }).then(result => {
      let existCompnent = this.componentContainerData.getComponentById(result.component.UniqueName);
      let existField = existCompnent.getFieldById(result.field.UniqueName);
      if(existField) {
        if(!targetField) this.notificationService.add({type: 'danger', text: result.field.UniqueName + ' tekil isminde başka bir alan var'});
        this.components = null;
        if(this.isEditMode) {
          let self = this;
          setTimeout(function() {
            self.components = self.componentContainerData.getComponents();
          }, 0);
        }
      }else{
        existCompnent.addField(result.field);
      }
    }).catch( reason => {
      console.log(reason);
    });
  }

  addNewComponent() {
    this.openCmsComponentCreateBox();
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
      this.componentContainerData.PromoterCode = this.authenticationService.getPromoterCode();
      if(this.componentContainerData.PromoterCode) {
        this.notificationService.add({
          text: this.componentContainerData.PromoterCode + " Promoter Code ile düzenleme yapılıyor.",
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
		if(!target && this.componentContainerData) this.componentContainerData.set(name, event);
    if(target) target[name] = event;
    this.changeDetector.detectChanges();
  }

  componentSettingsBlockActionHandler(event, component) {
    switch(event.action) {
      case "addNewField":
        this.openCmsFieldCreateBox(event.params.component);
      break;
      case "editField":
        this.openCmsFieldCreateBox(event.params.component, event.params.field);
      break;
      case "removeField":
        event.params.component.removeField(event.params.field);
      break;
      case "editComponent":
        this.openCmsComponentCreateBox(event.params.component);
      break;
      case "removeComponent":
        this.componentContainerData.removeComponent(event.params.component);
      break;
    }
  }

  toggleAllComponentSettingsBlock() {
		this.allBlockCollapsed ? this.componentSettingsBlocks.forEach( block => block.expand() ) : this.componentSettingsBlocks.forEach( block => block.collapse() );
	}
  
  exit(event) {
    this.router.navigate(["cms", "component-containers"]);
  }

  saveComponentContainer() {
    this.isPromising = true;
    let saveSubscription;
    saveSubscription = this.isEditMode ? this.componentContainerData.save() : this.componentContainerData.create();
    saveSubscription.subscribe(
      result => {
        this.isPromising = false;
        this.notificationService.add({type: 'success', text: 'Bileşen grubu başarıyla kaydedildi.'});
        this.router.navigate(["cms", "component-containers"]);
      },
      error => {
        this.isPromising = false;
        this.notificationService.add({type: 'danger', text: 'Bileşen grubu kaydedilemedi: '+error.Message});
      }
    )
  }

}
