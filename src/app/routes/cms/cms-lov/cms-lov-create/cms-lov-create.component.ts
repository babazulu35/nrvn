import { AuthenticationService } from './../../../../services/authentication.service';
import { EntityService } from './../../../../services/entity.service';
import { NotificationService } from './../../../../services/notification.service';
import { TetherDialog } from './../../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { HeaderTitleService } from './../../../../services/header-title.service';
import { CmsDataService } from './../../../../services/cms-data.service';
import { KeyValueItemCreateBoxComponent } from './../../../../modules/cms-module/common/key-value-item-create-box/key-value-item-create-box.component';
import { Component, OnInit, Input, ChangeDetectorRef, Injector, ComponentFactoryResolver, ComponentRef, Inject } from '@angular/core';

@Component({
  selector: 'app-cms-lov-create',
  templateUrl: './cms-lov-create.component.html',
  styleUrls: ['./cms-lov-create.component.scss'],
  providers: [CmsDataService,
    { provide: 'firmEntityService', useClass: EntityService },
  ],
  entryComponents: [KeyValueItemCreateBoxComponent]
})
export class CmsLovCreateComponent implements OnInit {
  role: string = "create";
	isEditMode: boolean = false;
	isLoading: boolean;
  isPromising: boolean;

  lov: any;
  @Input() keyValueItems: {
    key: string,
    label?: string,
    value?: any,
  }[];

  keyValueItemCreateBox: KeyValueItemCreateBoxComponent;

  firmList: {text: string, value: any}[];
  isSuperAdmin: boolean;

  validation: {
		Name: { isValid: any, message: string },
    Id: { isValid: any, message: string },
    KeyValueList: { isValid: any, message: string },
    PromoterCode: { isValid: any, message: string }
	} = {
		Name: {
			message: "Değer listesi adı zorunludur.",
			isValid(): boolean {
				return this.lov && this.lov.Name && this.lov.Name.length > 0;
			}
		},
		Id: {
			message: "Tekil isim zorunludur",
			isValid():boolean {
				return this.lov && this.lov._id && this.lov._id.length > 0;
			}
    },
    KeyValueList: {
			message: "En az bir değer eklenmeli.",
			isValid():boolean {
				return this.keyValueItems && this.keyValueItems.length > 0;
			}
    },
    PromoterCode: {
			message: "Promoter Code zorunludur",
			isValid():boolean {
				return this.isSuperAdmin ? this.lov && this.lov.PromoterCode : true;
			}
    }
	};

	get isValid():boolean {
		if( this.lov && this.validation
			&& this.validation.Name.isValid.call(this)
      && this.validation.Id.isValid.call(this)
      && this.validation.KeyValueList.isValid.call(this)
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

    this.setLov();
  }

  private setLov() {
    if(this.route.snapshot.params) {
      if(this.isEditMode && this.route.snapshot.params["id"]){
        let id = this.route.snapshot.params["id"];
        this.cmsDataService.getLov(id).subscribe(
          result => {
            this.lov = result;
            this.setPromoterCode();
            this.keyValueItems = this.lov.getKeyValueItems();
            this.changeDetector.detectChanges();
          },
          error => {

          }
        );
      }else{
        this.lov = this.cmsDataService.createLov();
        this.setPromoterCode();
        this.keyValueItems = this.lov.getKeyValueItems();
      };
    };
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
      this.lov.PromoterCode = this.authenticationService.getPromoterCode();
      if(this.lov.PromoterCode) {
        this.notificationService.add({
          text: this.lov.PromoterCode + " Promoter Code ile düzenleme yapılıyor.",
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

  openKeyValueItemCreateBox(targetKeyValueItem:any = null) {
    let component:ComponentRef<KeyValueItemCreateBoxComponent> = this.resolver.resolveComponentFactory(KeyValueItemCreateBoxComponent).create(this.injector);
    this.keyValueItemCreateBox = component.instance;
    this.keyValueItemCreateBox.keyValueItem = targetKeyValueItem;
    
    this.tether.modal(component, {
      escapeKeyIsActive: true
    }).then(result => {
      let keyValueItem = this.lov.addKeyValueItem(result);
      if(!targetKeyValueItem && !keyValueItem) {
        this.notificationService.add({type: 'danger', text: result.key + ' anahtar adıyla başka bir değer var'});
      }
    }).catch( reason => {
      console.log(reason);
    });
  }

  addNewKeyValueItem() {
    this.openKeyValueItemCreateBox();
  }

  inputChangeHandler(event, name: string, target?: any) {
		if(!target && this.lov) this.lov.set(name, event);
    if(target) target[name] = event;
    this.changeDetector.detectChanges();
  }

  keyValueItemActionHandler(event, item) {
    switch(event.action) {
      case "edit":
        this.openKeyValueItemCreateBox(event.params.keyValueItem);
      break;
      case "remove":
      this.lov.removeKeyValueItem(event.params.keyValueItem)
      break;
    }
  }

  exit(event) {
    this.router.navigate(["cms", "lovs"]);
  }

  saveLov() {
    this.isPromising = true;
    let saveSubscription;
    saveSubscription = this.isEditMode ? this.lov.save() : this.lov.create();
    saveSubscription.subscribe(
      result => {
        this.isPromising = false;
        this.notificationService.add({type: 'success', text: 'Değer listesi başarıyla kaydedildi.'});
        this.router.navigate(["cms", "lovs"]);
      },
      error => {
        this.isPromising = false;
        this.notificationService.add({type: 'danger', text: 'Değer listesi kaydedilemedi: '+error.Message});
      }
    )
  }

}
