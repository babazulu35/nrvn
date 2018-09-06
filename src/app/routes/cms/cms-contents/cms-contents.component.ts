import { NotificationService } from './../../../services/notification.service';
import { TreeViewComponent } from './../../../modules/common-module/components/tree-view/tree-view.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HeaderTitleService } from './../../../services/header-title.service';
import { CmsDataService } from './../../../services/cms-data.service';
import { Component, OnInit, ChangeDetectorRef, HostBinding, ViewChild } from '@angular/core';

@Component({
  selector: 'app-cms-contents',
  templateUrl: './cms-contents.component.html',
  styleUrls: ['./cms-contents.component.scss'],
  providers: [CmsDataService]
})
export class CmsContentsComponent implements OnInit {
  @ViewChild(TreeViewComponent) contentTypeMenu: TreeViewComponent;
  contents: {}[];
  selectedItems: {}[];
  contentTypeList: {id: any, text: string, params?: {}}[];
  selectedContentType: any;
  contentType: any = null;

  searchText: string;

  isLoading: boolean;
  contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];

  pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '30', value: 30 }, { text: '50', value: 50 }];
  pageSize: number = this.pageSizes[2]['value'];
  currentPage: number = 1;
  count: number = 0;

  selectedContentTypeFilter = null;
  contentTypeFilters: Array<any> = [
    { text: 'AKTİF', filter: true, isActive: true},
    { text: 'PASİF', filter: false, isActive: false}
  ];

  get canAddNewContent(): boolean {
    return this.selectedContentType && !this.selectedContentType.MaxCount ? true : this.selectedContentType && this.selectedContentType.MaxCount > this.count;
  };

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
        this.contentTypeList = [];
        result.forEach( item => {
          this.contentTypeList.push({
            id: item["_id"],
            text: item["Name"],
            params: {contentType: item}
          })
        });

        this.route.params.subscribe( result => {
          this.contentType = result.id ? result.id : null;
          let contentType = this.contentTypeList.find( type => type.id == result.id);
          this.selectedContentType = contentType ? contentType.params["contentType"] : null;
          this.currentPage = 1;
          if(!this.contentType) {
            this.router.navigate(['cms', 'contents', this.contentTypeList[0].id]);
          }else{
            this.getContents();
          }
        });

        this.isLoading = false;
      }
    });
  }

  getContents() {
    if(this.contentTypeMenu) this.contentTypeMenu.selectedItemKey = this.contentType;
    this.isLoading = true;

    let params = {}
    if (this.contentType) {
      params['PageSize'] = this.pageSize;
      params['PageNo'] = this.currentPage;
    }

    if (this.searchText) {
      params["Query.Field"] = "Title";
      params["Query.Search"] = this.searchText;
    }

    params["IsActive"] = this.selectedContentTypeFilter && this.selectedContentTypeFilter.filter;
    params["Paging"]=true;

    this.cmsDataService.getContentsByContentType(this.contentType, params).subscribe(result => {
      if (this.contentType) {
        this.contents = result.Data;
        this.count = result.Paging.TotalRecordCount
      } else {
        this.contents = result;
      }

      this.selectedItems = [];
      this.isLoading = false;
    });
  }

  contentTypeChangeHandler(event) {
    if(event && event.id) {
      this.router.navigate(['cms', 'contents', event.id]);
    }else{
      this.router.navigate(['cms', 'contents']);
    }
  }

  transistPage(event){
    this.currentPage = event;
    this.getContents();
  }

  changePageSize(event) {
    this.pageSize = event;
    this.currentPage = 1;
    this.getContents();
  }

  addNewContent(event){
    // let actions: {label: string, contentType: string}[] = [];
    // this.contentTypeList.forEach( item => actions.push({label: item.text, contentType: item.id}));
    // this.tetherService.context({title: "İçerik Biçimi Seç", data:actions}, {
    //   target: event.currentTarget
    // }).then(
    //   result => {
    //     this.router.navigate(['cms', 'content', 'create'], {queryParams: {contentType: result['contentType']}});
    //   }
    // ).catch( reason => {});
    this.router.navigate(['cms', 'content', 'create'], {queryParams: {contentType: this.selectedContentType["_id"]}});
  }

  gotoContentTypeCreate($event) {
    this.router.navigate(['cms', 'content-type', 'create']);
  }

  filterChangeHandler(event) {
    this.selectedContentTypeFilter = event;
    this.getContents();
  }

  toggleSortTitle(event) {

  }

  selectItem(event, content) {

  }

  openContextMenu(event, content) {
    this.tetherService.context({
			title: "İŞLEMLER",
			data: this.contextMenuData
		}, {
      target: event.target
    }).then(
      result => {
        this.doAction(result['action'], content);
      }
    ).catch( reason => {});
  }

  doAction(action: string, content) {
    switch (action) {
      case "edit":
        this.router.navigate(['cms', 'content', content._id, 'edit']);
      break;
      case "delete":
        this.tetherService.confirm({
          title: "Silmek istediğinizden emin misiniz?",
          description: `${content.Title || content.title} isimli içerik kalıcı olarak silinecektir.`,
          confirmButton: {
            label: "SİL",
            type: "danger"
          },
          dismissButton: {
            label: "VAZGEÇ"
          }
        }).then( confirmResult => {
          this.cmsDataService.deleteContent(content._id).subscribe( result => {
            this.notificationService.add({
              text: `${content.Title || content.title} isimli içerik başarıyla silindi.`,
              type: "success"
            });
          }, error => {
            this.notificationService.add({
              text: `${content.Title || content.title} isimli içerik silinemedi. <br/>${error.Message}`,
              type: "danger"
            });
          });
        }).catch( confirmReason => {});
        
      break;
    }
  }

  onInputChange(event) {
    this.searchText = event;
    this.getContents();
  }

}
