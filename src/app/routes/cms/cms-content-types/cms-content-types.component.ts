import { NotificationService } from './../../../services/notification.service';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderTitleService } from './../../../services/header-title.service';
import { CmsDataService } from './../../../services/cms-data.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-cms-content-types',
  templateUrl: './cms-content-types.component.html',
  styleUrls: ['./cms-content-types.component.scss']
})
export class CmsContentTypesComponent implements OnInit {

  isLoading: boolean;
  contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  contentTypes: {}[];

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

    this.cmsDataService.getAllContentTypes().subscribe( result => {
      if(result && result.length) {
        this.contentTypes = [];
        result.forEach( item => {
          let fields: any[] = [];
          this.contentTypes.push(item);
          //this.contentTypes.push(this.cmsDataService.createContentType(item));
        });
      }
      this.isLoading = false;
    });
  }

  addNewContentType(event) {
    this.router.navigate(['cms', 'content-type', 'create']);
  }
  
  openContextMenu(event, contentType) {
    this.tetherService.context({
			title: "İŞLEMLER",
			data: this.contextMenuData
		}, {
      target: event.target
    }).then(
      result => {
        this.doAction(result['action'], contentType);
      }
    ).catch( reason => {});
  }

  doAction(action: string, contentType) {
    switch (action) {
      case "edit":
        this.router.navigate(['cms', 'content-type', contentType._id, 'edit']);
      break;
      case "delete":
        this.tetherService.confirm({
          title: "Silmek istediğinizden emin misiniz?",
          description: `${contentType.Name || contentType.name} isimli içerik kalıcı olarak silinecektir.`,
          confirmButton: {
            label: "SİL",
            type: "danger"
          },
          dismissButton: {
            label: "VAZGEÇ"
          }
        }).then( confirmResult => {
          this.cmsDataService.deleteContentType(contentType._id).subscribe( result => {
            this.notificationService.add({
              text: `${contentType.Name || contentType.name} isimli içerik başarıyla silindi.`,
              type: "success"
            });
          }, error => {
            this.notificationService.add({
              text: `${contentType.Name || contentType.name} isimli içerik silinemedi. <br/>${error.Message}`,
              type: "danger"
            });
          });
        }).catch( confirmReason => {});
        
      break;
    }
  }

  getItemActions(contentType) {
    let actions = [
      { label: 'Düzenle', icon: 'edit', action: "edit"},
    ]
    return actions;
  }

}
