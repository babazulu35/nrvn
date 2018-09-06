import { NotificationService } from './../../../services/notification.service';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderTitleService } from './../../../services/header-title.service';
import { CmsDataService } from './../../../services/cms-data.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-cms-component-containers',
  templateUrl: './cms-component-containers.component.html',
  styleUrls: ['./cms-component-containers.component.scss'],
  providers: [CmsDataService]
})
export class CmsComponentContainersComponent implements OnInit {

  isLoading: boolean;
  componentContainers: {
    Name: string,
    Description: string,
    Components: {
      AllowMultiple: boolean,
      Name: string,
      UniqueName: string,
      Fields: {
        FieldType: string,
        Name: string,
        UniqueName: string
      }[]
    }[]
  }[];
  groupComponentContainers: {}[];
  singleComponentContainers: {}[];

  constructor(
    private cmsDataService: CmsDataService,
    private headerTitleService: HeaderTitleService,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private tetherService: TetherDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.headerTitleService.setTitle('');
    this.isLoading = true;
    this.cmsDataService.getAllComponentContainerTypes().subscribe( result => {
      if(result && result.length) {
        this.componentContainers = [];
        this.groupComponentContainers = [];
        this.singleComponentContainers = [];
        result.forEach( item => {
          let fields: any[] = [];
          this.componentContainers.push(this.cmsDataService.createComponentContainerType(item));
          // if(item.Components) item.Components.forEach( component => {
          //   if(component.Fields) component.Fields.forEach( field => fields.push(field));
          // });
          // fields.length > 1 ? this.groupComponentContainers.push(item) : this.singleComponentContainers.push(item);
        });
      }
      this.isLoading = false;
    });
  }

  addNewComponentContainer(event) {
    this.router.navigate(['cms', 'component-container', 'create']);
  }

  componentContainerCardActionHandler(event) {
    switch(event.action) {
      case "editComponentContainer":
        this.router.navigate(['cms', 'component-container', event.params.componentContainer['_id'], 'edit']);
      break;
      case "removeComponentContainer":
        this.tetherService.confirm({
          title: "Silmek istediğinizden emin misiniz?",
          confirmButton: { label: "SİL"},
          dismissButton: { label: "VAZGEÇ"}
        }).then(result => {
          event.params.componentContainer.delete().subscribe( deleteResult => {
            
          },
          deleteError => {
            this.notificationService.add({type:"danger", text: deleteError.Message});
          });
        }).catch(resason => {});
      break;
    }
  }
}
