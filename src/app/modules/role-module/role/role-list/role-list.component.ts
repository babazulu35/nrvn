import { RoleType } from './../../../../models/role-type.enum';

import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { Role } from './../../../../models/role';
import { RoleService } from './../../../../services/role.service';
import { Component, OnInit, HostBinding, ComponentRef, ComponentFactoryResolver,Injector } from '@angular/core';
import { HeaderTitleService } from '../../../../services/header-title.service';
import { MainLoaderService } from '../../../../services/main-loader.service';
import { ContextMenuComponent } from '../../../common-module/components/context-menu/context-menu.component';
import { NotificationService } from './../../../../services/notification.service';


@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss'],
  entryComponents:[ContextMenuComponent],
  providers:[RoleService]
})
export class RoleListComponent implements OnInit {
  @HostBinding('class.or-role-list') true;
  subscription;
  roleList:Role[];
  selectedItems: Array<Object> = [];
  roleType = RoleType;

  count: number;
  pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
  pageSize: number = 10;
  currentPage: number = 0;

  isContentLoading:boolean;

  noDataInContent:boolean = false;

  roleAction: ContextMenuComponent;
	sortParams: Array<any> = [
		{ text: 'BAŞLIĞA GÖRE', value: JSON.stringify({ sortBy: "Name", type: "asc" }) },
		{ text: 'STATÜSE GÖRE', value: JSON.stringify({ sortBy: "IsActive", type: "asc" }) }
	];  
  constructor(private headerTitleService:HeaderTitleService,public roleService:RoleService,private mainLoadingService:MainLoaderService,
  private resolver: ComponentFactoryResolver,private injector: Injector,private tether:TetherDialog,private notificationService:NotificationService) { 
    roleService.flushFilter();
    roleService.setQueryParams({protectedFilter: null, sort : [], pageSize: this.pageSize, page : 1});    
  }

  ngOnInit() {
    this.headerTitleService.setTitle('Roller');
    this.headerTitleService.setLink('/role');  
    this.mainLoadingService.updateContentStatus(true);
    this.subscription = this.roleService.queryParamSubject.subscribe(response => {
        this.mainLoadingService.updateContentStatus(true);
        
        this.updateLocalParams(response);
        if(response) {
          let query = this.roleService.fromEntity('Role').whereRaw(`(Type eq cast('${this.roleType["Standart"]}', Nirvana.Shared.Enums.RoleType ))`).orderBy('Name','asc').take(response['pageSize']).page(response['page']);
          if(response['search']) {
            query.search(response['search']['key'],response['search']['value']);
          }

          let sort = response["sort"] ? (typeof response["sort"] == 'string'  ? JSON.parse(response["sort"]) : response["sort"]) : null;
          if(sort && sort[0]) {
            query.orderBy(sort[0]["sortBy"],sort[0]["type"])
          }
     
          query.executeQuery();
        }
    },error => {
      this.mainLoadingService.updateContentStatus(false);
      this.notificationService.add({text:error,type:'danger'});
    });

    this.roleService.data.subscribe(roleList => {
      this.mainLoadingService.updateContentStatus(true);
      if(roleList && roleList.length > 0) {
        this.noDataInContent = false;

        this.selectedItems = [];
        this.mainLoadingService.updateContentStatus(false);
        this.roleList = roleList;

      }
      else {
        this.noDataInContent = true;
        this.mainLoadingService.updateContentStatus(false);
      }
    },error => {
      this.mainLoadingService.updateContentStatus(false);
      this.notificationService.add({text:error,type:'danger'});
    })

    this.roleService.getCount().subscribe(
      count => { 
          this.count = count;
      },
      error => {
        this.mainLoadingService.updateContentStatus(false);
        this.notificationService.add({text:error,type:'danger'});
      }
  );
  
    this.mainLoadingService.contentLoadingHandler.subscribe(loadingStatus => {
        this.isContentLoading = loadingStatus.contentLoading;
    })
    
  }

  ngOnDestroy() {
    if(this.subscription) this.subscription.unsubscribe();
  }


  onInputChange(event) {
    this.roleService.setSearch({key:'Name',value:event});
  }

  inputChangeHandler(event,role) {

    this.roleService.roleStatusUpdate(<Role>{IsActive:event},role.Id).then(result => {
              
      if(result) {
        this.notificationService.add({text:'Role Statüsü başarılı bir şekilde güncellendi',type:'success'})
      }
      else {
        this.notificationService.add({text:'Role Statüsü güncelemesi başarısız',type:'danger'})
      }
    }).catch(onreject => {
      this.notificationService.add({text:onreject.message,type:'danger'})
    })
  }

  sortBy(sortValue) {
    if(sortValue){
      this.roleService.setOrder(sortValue, true);
    } else {
      this.roleService.flushOrder();
    }    
  }
  
  toggleSortTitle(sort) {
    this.roleService.setOrder(sort, true);
}

  changePageSize(pageSize) {
    this.roleService.setPageSize(pageSize);
  }

  transistPage(page) {
    this.roleService.setPage(page);
  } 
  
  updateLocalParams(params: Object = {}) {
    this.currentPage = params['page'] ? params['page'] : 0
    this.pageSize = params['pageSize'] ? params['pageSize'] : 10
}  

}
