import { NotificationService } from './../../../../services/notification.service';
import { AuthenticationService } from './../../../../services/authentication.service';
import { EntityService } from './../../../../services/entity.service';
import { GetDatasourceBoxComponent } from './../../../../modules/cms-module/common/get-datasource-box/get-datasource-box.component';
import { TetherDialog } from './../../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { EntitySearchBoxComponent } from './../../../../modules/common-module/common/entity-search-box/entity-search-box.component';
import { Router } from '@angular/router';
import { CmsComponentContainerComponent } from './../../../../modules/cms-module/components/cms-component-container/cms-component-container.component';
import { ActivatedRoute } from '@angular/router';
import { HeaderTitleService } from './../../../../services/header-title.service';
import { CmsDataService } from './../../../../services/cms-data.service';
import { Component, OnInit, ChangeDetectorRef, ViewChildren, ComponentRef, Injector, ComponentFactoryResolver, Inject } from '@angular/core';

@Component({
  selector: 'app-cms-content-create',
  templateUrl: './cms-content-create.component.html',
  styleUrls: ['./cms-content-create.component.scss'],
  providers: [CmsDataService,
    { provide: 'firmEntityService', useClass: EntityService },
  ],
  entryComponents: [EntitySearchBoxComponent, GetDatasourceBoxComponent]
})
export class CmsContentCreateComponent implements OnInit {
  @ViewChildren(CmsComponentContainerComponent) componentContainers: CmsComponentContainerComponent[];

  role: string = "create";
	isEditMode: boolean = false;
	isLoading: boolean;
	isPromising: boolean;
  entitySearchBox: EntitySearchBoxComponent;
  getDatasourceBox: GetDatasourceBoxComponent;

  contentType: string;
  contentData: any;
  containerTypes: any[];
  publishingPoints: {label: string, name: string, value: boolean}[];
  relatedEntityList: {name: string, label: string, endpoint: string}[];
  relatedEntities: {id: any, entityType: string, title: string, avatar?: {source?: string, title?: string}}[];
  datasources: {id: any, Id: any, type: string, title: string, params?: {}}[];

  firmList: {text: string, value: any}[];
  isSuperAdmin: boolean;

  validation: {
		Name: { isValid: any, message: string },
    PromoterCode: { isValid: any, message: string },
    Components: { isValid: any, message: string }
	} = {
		Name: {
			message: "İçerik adı zorunludur.",
			isValid(): boolean {
				return this.contentData && this.contentData.Title && this.contentData.Title.length > 0;
			}
		},
		PromoterCode: {
			message: "Promoter Code zorunludur",
			isValid():boolean {
				return this.isSuperAdmin ? this.contentData && this.contentData.PromoterCode : true;
			}
    },
    Components: {
			message: "Bileşenlerde eksik alanlar var",
			isValid():boolean {
        return this.componentContainers ? !this.componentContainers.some( item => !item.isValid ) : true;
			}
    }
	};

	get isValid():boolean {
		if( this.contentData && this.validation
			&& this.validation.Name.isValid.call(this)
      && this.validation.PromoterCode.isValid.call(this)
      && this.validation.Components.isValid.call(this)
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
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    public tether: TetherDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.headerTitleService.setTitle('');
    this.role = this.route.snapshot.data["role"];
    this.isEditMode = this.role == "edit";
    this.setContent();
  }

  private setContent() {
    if(this.route.snapshot.params) {
      if(this.isEditMode && this.route.snapshot.params["id"]){
        let id = this.route.snapshot.params["id"];
        this.cmsDataService.getContent(id).subscribe(
          result => {
            this.contentData = result;
            this.setPromoterCode();
            this.contentType = this.contentData.ContentType;
            this.containerTypes = this.contentData.getContentTypeMeta().getComponentContainerTypes();
            this.publishingPoints = this.contentData.getPublishingPoints();
            this.relatedEntityList = this.contentData.getContentTypeMeta().getRelatedEntityList();

            if(this.relatedEntityList && this.relatedEntityList.length) {
              this.relatedEntities = [];
              let relatedEntities = this.contentData.getRelatedEntities();
              let entityData;
              
              if(relatedEntities) {
                relatedEntities.forEach( item => {
                  if(item.entityData) {
                    item.entityData.subscribe( entityResult => {
                      if(entityResult[0]) {
                        entityData = entityResult[0];
                        this.relatedEntities.push({
                          id: item.EntityId,
                          entityType: item.EntityType,
                          title: entityData.Localization ? entityData.Localization.Name : entityData.Name,
                          avatar: {source: entityData.Images, title: entityData.Localization ? entityData.Localization.Name : entityData.Name}
                        });
                      }
                    }); 
                  }
                });
              }
            }

            let datasourcesList = this.contentData.getContentTypeMeta().getDatasourceList();
            if(datasourcesList && datasourcesList.length) {
              this.datasources = [];
              let datasources = this.contentData.getDatasources();
              let datasource;
              if(datasources) {
                datasources.forEach( item => {
                  if(item.Parameters && Object.keys(item.Parameters).length) {
                    datasource = {
                      id: item.id,
                      Id: item.Id,
                      type: item.Name,
                      title: item.Title,
                      params: {datasource: item }
                    }
                    this.datasources.push(datasource);
                  }
                });
              }
            }

          }, error => { }
        );
      }else{
        if(this.route.snapshot.queryParams) this.contentType = this.route.snapshot.queryParams["contentType"];
        if(this.contentType) {
          this.cmsDataService.createContent(this.contentType).subscribe( 
            result => {
              this.contentData = result;
              this.setPromoterCode();
              this.containerTypes = this.contentData.getContentType().getComponentContainerTypes();
              this.publishingPoints = this.contentData.getContentType().getPublishingPointList();
              this.relatedEntityList = this.contentData.getContentType().getRelatedEntityList();
              this.relatedEntities = this.relatedEntityList && this.relatedEntityList.length ? [] : null;
              let datasourcesList = this.contentData.getContentType().getDatasourceList();
              this.datasources = datasourcesList && datasourcesList.length ? [] : null;

            }, error => { }
          );
        }else{
          this.router.navigate(['cms', 'contents']);
        }        
      }
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
      this.contentData.PromoterCode = this.authenticationService.getPromoterCode();
      if(this.contentData.PromoterCode) {
        this.notificationService.add({
          text: this.contentData.PromoterCode + " Promoter Code ile düzenleme yapılıyor.",
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

  public inputChangeHandler(event, name: string, target?: any) {
    if(!target && this.contentData) this.contentData.set(name, event);
    if(target) target[name] = event;
    this.changeDetector.detectChanges();
	}

  public openEntitySearchBox(event) {
    let component:ComponentRef<EntitySearchBoxComponent> = this.resolver.resolveComponentFactory(EntitySearchBoxComponent).create(this.injector);
    this.entitySearchBox = component.instance;
    this.entitySearchBox.entityTypes = this.relatedEntityList;

    this.tether.modal(component, {
      escapeKeyIsActive: true,
      attachment: "top right",
      targetAttachment: "80px right",
      offset: "0px 25px"

    }).then(result => {
      if(this.relatedEntities) this.relatedEntities.push(result.params.card);
    }).catch( reason => {
      
    });
  }

  public relatedEntityActionHandler(event) {
    switch(event.action) {
      case "remove":
        if(event.params && event.params.entity) {
          let existEntity = this.relatedEntities.find( item => item.id == event.params.entity.id && item.entityType == event.params.entity.entityType);
          if(existEntity) this.relatedEntities.splice( this.relatedEntities.indexOf(existEntity), 1);
        }
      break;
    }
  }

  public openGetDatasourceBox(event, datasource:any = null) {
    let component:ComponentRef<GetDatasourceBoxComponent> = this.resolver.resolveComponentFactory(GetDatasourceBoxComponent).create(this.injector);
    this.getDatasourceBox = component.instance;
    this.getDatasourceBox.datasourcesList = this.isEditMode ? this.contentData.getContentTypeMeta().getDatasourceList() : this.contentData.getContentType().getDatasourceList();
    let existDatasource;
    this.getDatasourceBox.datasourcesList.forEach( item => {
      existDatasource = this.datasources.find( datasource => datasource.id == item.id);
      item.disabled = existDatasource != null;
    });
    this.getDatasourceBox.datasource = datasource;

    this.tether.modal(component, {
      escapeKeyIsActive: true
    }).then(result => {
      let datasource = this.isEditMode ? this.contentData.getContentTypeMeta().createDatasource(result.datasourceType, result.datasource) : this.contentData.getContentType().createDatasource(result.datasourceType, result.datasource);
      if(this.datasources) {
        let existDatasource = this.datasources.find( item => item.Id == datasource.Id);
        if(existDatasource) {
          existDatasource.title = datasource.Title,
          existDatasource.params = {datasource: datasource }
        }else{
          this.datasources.push({
            id: datasource.id,
            Id: datasource.Id,
            type: datasource.Name,
            title: datasource.Title,
            params: {datasource: datasource }
          });
        }
      }
    }).catch( reason => {
      
    });
  }

  public datasourcesActionHandler(event) {
    switch(event.action) {
      case "edit":
        if(event.params && event.params.datasource) {
          this.openGetDatasourceBox(null, event.params.datasource.params.datasource);
        }
      break;
      case "remove":
        if(event.params && event.params.datasource) {
          let existDatasource = this.datasources.find( item => item.Id == event.params.datasource.Id);
          if(existDatasource) this.datasources.splice( this.datasources.indexOf(existDatasource), 1);
        }
      break;
    }
  }

  public containerActionHandler(event) {
    // console.log(event);
    // let container;
    // let component;
    // if(event.params.containerId) container = this.containerTypes.find( container => container._id == event.params.containerId);
    // if(container && event.params.componentId) component = container.getC
    // switch(event.action) {
    //   case "saveComponent":
    //     console.log(container.getComponentInstances());
    //     //if(container && event.params.component) container.saveComponent(event.params.component);
    //     console.log(container.getComponentInstances());
    //   break;
    //   case "deleteComponent":

    //   break;
    // }
  }


  exit(event) {
    this.contentType ? this.router.navigate(["cms", "contents", this.contentType]) : this.router.navigate(["cms", "contents"]);
  }

  saveAndPublsishContent() {
    this.contentData.Active = true;
    this.saveContent();
  }

  saveContent() {
    this.componentContainers.forEach( componentContainer => componentContainer.componentBlocks.forEach( componentBlock => componentBlock.saveComponent()) );
    this.contentData.savePublishingPoints(this.publishingPoints);
    
    let entities: {EntityType: string, EntityId: any}[] = [];
    if(this.relatedEntities) this.relatedEntities.forEach( item => {
      if(item.entityType && item.id) entities.push({EntityType: item.entityType, EntityId: item.id});
    });
    this.contentData.saveRelatedEntities(entities);

    let datasources: any[] = [];
    // if(this.datasources) this.datasources.forEach( item => {
    //   datasources.push(item.params["datasource"]);
    // });
    let datasourceList = this.isEditMode ? this.contentData.getContentTypeMeta().getDatasourceList() : this.contentData.getContentType().getDatasourceList();
    let existDatasource;
    datasourceList.forEach(item => {
      existDatasource = this.datasources.find( datasource => datasource.id == item.id);
      if(existDatasource){
        datasources.push(existDatasource.params.datasource);
      }else{
        datasources.push({
          id: item.id,
          Parameters: {}
        })
      }
    })
    
    this.contentData.saveDatasources(datasources);

    this.isPromising = true;
    if(this.isEditMode){
      this.contentData.save().subscribe( result => {
        this.isPromising = false;
        this.notificationService.add({type: 'success', text: 'İçerik başarıyla kaydedildi.'});
        this.contentType ? this.router.navigate(["cms", "contents", this.contentType]) : this.router.navigate(["cms", "contents"]);
      }, error => {
        this.isPromising = false;
        this.notificationService.add({type: 'danger', text: 'İçerik kaydedilemedi: '+error});
      });
    }else{
      this.contentData.save().subscribe( result => {
        this.isPromising = false;
        this.notificationService.add({type: 'success', text: 'İçerik başarıyla kaydedildi.'});
        this.contentType ? this.router.navigate(["cms", "contents", this.contentType]) : this.router.navigate(["cms", "contents"]);
      }, error => {
        this.isPromising = false;
        this.notificationService.add({type: 'danger', text: 'İçerik kaydedilemedi: '+error.Message});
      });
    };
  };

}
