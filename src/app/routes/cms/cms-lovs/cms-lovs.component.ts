import { NotificationService } from './../../../services/notification.service';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderTitleService } from './../../../services/header-title.service';
import { CmsDataService } from './../../../services/cms-data.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-cms-lovs',
  templateUrl: './cms-lovs.component.html',
  styleUrls: ['./cms-lovs.component.scss']
})
export class CmsLovsComponent implements OnInit {

  isLoading: boolean;
  contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  lovs: {}[];

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

    this.cmsDataService.getLovs().subscribe( result => {
      if(result && result.length) {
        this.lovs = result;
      }
      this.isLoading = false;
    });
  }

  addNewLov(event) {
    this.router.navigate(['cms', 'lov', 'create']);
  }
  
  openContextMenu(event, lov) {
    this.tetherService.context({
			title: "İŞLEMLER",
			data: this.contextMenuData
		}, {
      target: event.target
    }).then(
      result => {
        this.doAction(result['action'], lov);
      }
    ).catch( reason => {});
  }

  doAction(action: string, lov) {
    switch (action) {
      case "edit":
        this.router.navigate(['cms', 'lov', lov._id, 'edit']);
      break;
      case "delete":
        this.tetherService.confirm({
          title: "Silmek istediğinizden emin misiniz?",
          description: `${lov.Name || lov.name} isimli değer listesi kalıcı olarak silinecektir.`,
          confirmButton: {
            label: "SİL",
            type: "danger"
          },
          dismissButton: {
            label: "VAZGEÇ"
          }
        }).then( confirmResult => {
          this.cmsDataService.deleteLov(lov._id).subscribe( result => {
            this.notificationService.add({
              text: `${lov.Name || lov.name} isimli değer listesi başarıyla silindi.`,
              type: "success"
            });
          }, error => {
            this.notificationService.add({
              text: `${lov.Name || lov.name} isimli değer listesi silinemedi. <br/>${error.Message}`,
              type: "danger"
            });
          });
        }).catch( confirmReason => {});
        
      break;
    }
  }

}
