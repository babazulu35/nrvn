import { NotificationService } from './../../../services/notification.service';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderTitleService } from './../../../services/header-title.service';
import { CmsDataService } from './../../../services/cms-data.service';
import { Component, OnInit, ChangeDetectorRef, Type } from '@angular/core';

@Component({
  selector: 'app-cms-datasources',
  templateUrl: './cms-datasources.component.html',
  styleUrls: ['./cms-datasources.component.scss']
})
export class CmsDatasourcesComponent implements OnInit {

  isLoading: boolean;
  contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  datasources: {}[];

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

    this.contextMenuData = [];
    this.contextMenuData.push({action: "edit", label: "Düzenle", icon: 'edit'});
    //this.contextMenuData.push({action: "delete", label: "Sil", icon: 'delete'});

    this.cmsDataService.getDataSources().subscribe( result => {
      if(result && result.length) {
        this.datasources = result;
      }
      this.isLoading = false;
    });
  }

  addNewDatasource(event) {
    this.router.navigate(['cms', 'datasource', 'create']);
  }

  openContextMenu(event, datasource) {
    this.tetherService.context({
			title: "İŞLEMLER",
			data: this.contextMenuData
		}, {
      target: event.target
    }).then(
      result => {
        this.doAction(result['action'], datasource);
      }
    ).catch( reason => {});
  }

  doAction(action: string, datasource) {
    switch (action) {
      case "edit":
        this.router.navigate(['cms', 'datasource', datasource._id, 'edit']);
      break;
      case "delete":
        this.tetherService.confirm({
          title: "Silmek istediğinizden emin misiniz?",
          description: `${datasource.Name || datasource.name} isimli veri kaynağı kalıcı olarak silinecektir.`,
          confirmButton: {
            label: "SİL",
            type: "danger"
          },
          dismissButton: {
            label: "VAZGEÇ"
          }
        }).then( confirmResult => {
          this.cmsDataService.deleteDatasource(datasource._id).subscribe( result => {
            this.notificationService.add({
              text: `${datasource.Name || datasource.name} isimli veri kaynağı başarıyla silindi.`,
              type: "success"
            });
          }, error => {
            this.notificationService.add({
              text: `${datasource.Name || datasource.name} isimli veri kaynağı silinemedi. <br/>${error.Message}`,
              type: "danger"
            });
          });
        }).catch( confirmReason => {});
        
      break;
    }
  }

}
