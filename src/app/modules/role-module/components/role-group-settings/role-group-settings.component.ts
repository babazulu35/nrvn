import { NotificationService } from './../../../../services/notification.service';
import { UserGroup } from '../../models/user-group';
import { RoleGroupSettings } from '../../models/role-group-settings';
import { ActivatedRoute } from '@angular/router';
import { Firm } from './../../../../models/firm';
import { EntityFirm } from './../../../../models/entity-firm';
import { RoleGroup } from '../../models/role-group';
import { RoleGroupService } from './../../role-group.service';
import { Observable } from 'rxjs/Observable';
import { SUser } from './../../../../models/suser';

import { Group } from './../../../../models/group';
import { RoleType } from './../../../../models/role-type.enum';
import { RoleService } from './../../../../services/role.service';
import { GroupService } from './../../../../services/group.service';
import { Component, OnInit, Input, HostBinding, OnDestroy, Inject } from '@angular/core';
import { MainLoaderService } from '../../../../services/main-loader.service';
import { Role } from '../../../../models/role';
import { Subscription } from 'rxjs/Subscription';
import { UserGroupService } from '../../user-group.service';
import { UserService } from './../../../../services/user.service';
import { RoleGroupSettingsService } from '../../role-group-settings.service';


@Component({
  selector: 'app-role-group-settings',
  templateUrl: './role-group-settings.component.html',
  styleUrls: ['./role-group-settings.component.scss'],
  providers:[RoleService,UserGroupService,UserService,RoleGroupService,{provide: 'userSearchService', useClass: UserService }]
})
export class RoleGroupSettingsComponent implements OnInit,OnDestroy {
  @Input() data;
  @HostBinding('class.c-role-group-settings') true;
  
  @Input() mod:any;

  subscriptionRole:Subscription;
  subscriptionUserGroup:Subscription;
  subscriptionUser:Subscription;
  subscriptionRoleGroup:Subscription;
  subscription:Subscription;

  selectAllText:string = "TÜMÜNÜ SEÇ";

  roleType = RoleType;
  roleList:Role[];
  roleTypeList:Role[];
  groupData;
  

  roleGroupSettings:{ 
    group: Group[],roleGroupList: RoleGroup[],userGroup: UserGroup[]
  } = {group:[],roleGroupList:[],userGroup:[]};


  userPresets:{title: string, list: any[]}[];
  userSearchResult: Observable<{title: string, list: any[]}[]>;  

  userList: {id: any, name: string, type?: any, params?: any}[] = [];
  
  isRoleChecked = [];

  roleGroupData = [];

  hasData:boolean;

  isLoading:boolean;
  roleListLoaded:boolean;
  userListLoaded:boolean;
  isAllRolesSelected:boolean = false;

  userServiceResponse: boolean = false;
  userServiceTimeout;

  roleTypeEnum = RoleType;
  
  constructor(
    private roleService:RoleService,
    private mainLoadingService:MainLoaderService,
    private userGroupService: UserGroupService,
    private groupService: GroupService,
    private userService: UserService,
    private roleGroupService: RoleGroupService,
    private activatedRoute:ActivatedRoute,
    @Inject('userSearchService') public userSearchService:UserService,
    private roleGroupSettingsService:RoleGroupSettingsService,
    private notificationService:NotificationService
  ) { }

  ngOnInit() {
    this.hasData = false;

    // ROLELIST;
    this.subscriptionRole = this.roleService.queryParamSubject.subscribe(response => {
      this.roleListLoaded = true;
      this.userListLoaded = true;      
      
      //this.updateLocalParams(response);
      if(response) {        
        let query = this.roleService.fromEntity('Role').whereRaw(`(Type eq cast('${this.roleTypeEnum["Standart"]}', Nirvana.Shared.Enums.RoleType ))`).take(1000).page(response['page']);
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
      if(error) this.notificationService.add({text:error['Message'],type:'danger'});
      this.mainLoadingService.updateContentStatus(false);
      
    });   
    this.roleService.data.subscribe(result => {
          if(result) 
          {
            this.roleListLoaded = false;
            
            let roleList = result.filter(result => result['IsActive'] == true );
            
            this.roleList = roleList;
          } {

          }      
    },error => {
      if(error) this.notificationService.add({text:error['Message'],type:'danger'});
    });

    
    // Seçili Rol litesini getirme
    this.roleGroupSettingsService.resetData.subscribe(result => {
      
      if(result) {
        this.resetSettings();
        this.hasData = false;
      }
    })

    this.groupService.groupData.subscribe(result => {

      this.isLoading = true;   
      this.isRoleChecked = [];
      this.isAllRolesSelected = false;
      this.resetSettings();  
      if(result && Object.keys(result).length && result['Id'] > 0)
      {
        
        this.hasData = true;
        this.resetSettings();
        this.groupData = result;

        this.roleGroupSettings.group.push(<Group>{Name:this.groupData['Name'],Id:this.groupData['Id']});
        this.roleGroupSettingsService.data.next(this.roleGroupSettings);
  
        // Get User Group
        this.subscriptionUserGroup = this.userGroupService.queryParamSubject.subscribe(response => {
          if(response) {
            let query = this.userGroupService.fromEntity('UserGroup').whereRaw(`GroupId eq ${this.groupData['Id']}`).take(1000).page(0);
            query.executeQuery();
          }
        },error => {
          if(error) this.notificationService.add({text:error['Message'],type:'danger'}); 
        }); 
        
        // Get Role Groups
        this.subscriptionRoleGroup = this.roleGroupService.queryParamSubject.subscribe(response => {
          if(response) {
            let query = this.roleGroupService.fromEntity('RoleGroup').whereRaw(`GroupId eq ${this.groupData['Id']}`).take(1000).page(0);
            query.executeQuery();
          }
        },error => {
          if(error) this.notificationService.add({text:error['Message'],type:'danger'});
        })       
        
      } 
      
      else {
        result['Id'] == 0 ? this.hasData = true: this.hasData = false;
        this.isLoading = false;
        this.resetSettings();

        this.isRoleChecked = [];
        this.userList = [];
        this.groupData = [];

      }

    },error => {
      if(error) this.notificationService.add({text:error['Message'],type:'danger'});
    })
  
    this.roleGroupService.data.subscribe(roleGroupServiceResult => {
      
      if(roleGroupServiceResult && roleGroupServiceResult.length) {
        this.isLoading = false;
        this.isRoleChecked = [] ;
        roleGroupServiceResult.forEach(result => {
          
          this.isRoleChecked[result.RoleId] = true;   
          let fil = this.isRoleChecked.filter(result => result == true);
          
          if(this.isRoleChecked.length == this.roleList.length) {
            this.isAllRolesSelected = true;
          } 
          this.roleGroupSettings.roleGroupList.push(<RoleGroup>{GroupId:this.groupData['Id'],RoleId:result.RoleId});         
          this.roleGroupSettingsService.data.next(this.roleGroupSettings);
        })
      }
      else {
        this.isRoleChecked = [];
        this.isLoading = false;
      }
    },error => {
      if(error) this.notificationService.add({text:error['Message'],type:'danger'});
    })     

    this.userGroupService.data.subscribe(groupServiceResult => {
      this.userList = [];
      this.userListLoaded = true;
      if(groupServiceResult && groupServiceResult.length) {
          this.isLoading = false;
          
          this.subscriptionUser = this.userService.queryParamSubject.subscribe(result => {
            if(result) {
              this.userService.setCustomEndpoint('GetSUSers');
              let query = this.userService.fromEntity('FFirm').take(result['pageSize']).page(result['page']);                 
              for(let i = 0;  i < groupServiceResult.length; i++)
              {
                if(i == 0) {
                  query.where('Id', '=', groupServiceResult[i].UserId)
                }
                else {
                  query.or('Id','=',groupServiceResult[i].UserId.toString());
                }
              }
              query.executeQuery();
              // start timeout   
              this.userServiceResponse = false;
              this.userServiceTimeout = setTimeout( () =>{     
                if(!this.userServiceResponse){
                  this.userListLoaded = false;
                }                
              }, 15000);        
            }
            
          },error => {
            if(error) this.notificationService.add({text:error['Message'],type:'danger'});
          });    
    }else {
      this.isLoading = false;
      this.userListLoaded = false;
    }
  
  },error => {
      if(error) this.notificationService.add({text:error['Message'],type:'danger'});
    });

    this.userService.data.subscribe(response => {
      this.userServiceResponse = true;
      clearTimeout(this.userServiceTimeout);
      if (response) {
        this.isLoading = false;
        this.userListLoaded = false;
        this.userList = [];
        response.forEach(result => {
          this.userList.push({id:result['Id'],name:`${result['FirstName']} ${result['LastName']} (${result['UserName']})`,type:0,params:{user:result}})
          this.roleGroupSettings.userGroup.push(<UserGroup>{UserId:result['Id'],GroupId:this.groupData['Id']})
          
          this.roleGroupSettingsService.data.next(this.roleGroupSettings);
        })      
      }else {
        this.userListLoaded = false;
      }
    }, error => {
        this.userServiceResponse = true;
        clearTimeout(this.userServiceTimeout);
        if(error) this.notificationService.add({text:error['Message'],type:'danger'});
    });
    this.userServiceDataHandler();
  }

  ngOnDestroy() {
    if(this.subscriptionRole) this.subscriptionRole.unsubscribe();
    if(this.subscriptionUserGroup) this.subscriptionUserGroup.unsubscribe();
    if(this.subscriptionUser) this.subscriptionUser.unsubscribe();
  }

  resetSettings() {
    this.groupData = [];
    this.roleGroupSettings.roleGroupList = [];
    this.roleGroupSettings.group = [];
    this.roleGroupSettings.userGroup = [];
    this.isRoleChecked =  [];
  }

  inputChangeHandler(event) {
    this.roleGroupSettings.group = [];
    if(this.groupData['Name'] != event.trim()) {
        this.roleGroupSettings.group.push(<Group>{Id:this.groupData['Id'],Name:event.trim()});
        this.roleGroupSettingsService.data.next(this.roleGroupSettings);
    }
  }
  
  

  checkAction(event,selectedRole) {
    
    if(event) {
      this.roleGroupSettings.roleGroupList.push(<RoleGroup>{GroupId:this.groupData['Id'],RoleId:selectedRole});
      this.roleGroupSettingsService.data.next(this.roleGroupSettings);
    }
    else {
      let index = this.roleGroupSettings.roleGroupList.findIndex(result => result.RoleId === selectedRole);
      this.roleGroupSettings.roleGroupList.splice(index,1);
      this.roleGroupSettingsService.data.next(this.roleGroupSettings);
    }

  }  
	userChangeHandler(event:{params: {entityFirm?: EntityFirm, user?: SUser}}[]) {
    if(!event && event.length == 0) return;
    this.userList = [];
    this.roleGroupSettings.userGroup = [];
    event.forEach(result => {
      
      let checkIfExists = this.roleGroupSettings.userGroup.find(uId => uId.UserId == result['id']);
      if(!checkIfExists)
      {
        this.userList.push({
          id:result['id'],
          name:result['name'],
          type:result['type'] ,
          params:{user: result.params.user}
        })
        this.roleGroupSettings.userGroup.push(<UserGroup>{UserId:result['id'],GroupId:this.groupData['Id']});
        this.roleGroupSettingsService.data.next(this.roleGroupSettings);
    }else {
      this.notificationService.add({text:'Aynı kullanıcı tekrar eklenemez',type:'warning'});
    }
    })
  }  

	userServiceDataHandler() {
		this.userPresets = null;
		this.userSearchService.data.subscribe(response => {

			if (response.length > 0) {
        let result = [];
				for (let user of response) {
          let isAddedBefore = this.userList.find(result => result.params.user['UserName'] == user['UserName'] );
          if(!isAddedBefore)
          {        
					result.push({
						id: user['Id'],
						title:  `${user['FirstName']} ${user['LastName']} (${user['UserName']})`,
						icon: "vpn_key",
            params: {user: user}
          });
        }
				};
				this.userSearchResult = Observable.of([{
					title: 'ARAMA SONUÇLARI', list: result
				}]);
			} else {
				this.userSearchResult = Observable.of([]);
			}
		});
  }  
  
	userActionHandler(event: {action: string, data: any[]}) {
		switch(event.action) {
      case "search":
				if(event.data && event.data.length > 0){
          this.userSearchService.setCustomEndpoint('GetSUSers');
          this.userSearchService.query({ page: 0, pageSize: 10, search: { key: 'UserName', value: event.data } })
				}
			break;
      case "remove":
        let index = this.roleGroupSettings.userGroup.findIndex(result => result.UserId == event.data['id']);
        this.roleGroupSettings.userGroup.splice(index,1);
        break;
      case "exist":
        this.notificationService.add({text:'Aynı kullanıcı tekrar eklenemez',type:'warning'});
			break;
		}
  }  

  createNew() {
    this.groupData = {Name: "Yeni Rol Grubu", Id: 0};
    this.groupService.groupDataDetail(this.groupData); 
   }

   selectAll() {
    this.roleGroupSettings.roleGroupList = []; 
    this.roleList.forEach(roleListResult => {
      
      this.isRoleChecked[roleListResult.Id] = true;
      this.roleGroupSettings.roleGroupList.push(<RoleGroup>{GroupId:this.groupData['Id'],RoleId:roleListResult.Id});
      this.roleGroupSettingsService.data.next(this.roleGroupSettings);
      this.isAllRolesSelected = true;

     })
   }

   deSelectAll() {
     if(this.isAllRolesSelected) {
       this.isRoleChecked = [];
       this.roleGroupSettings.roleGroupList =  [];
       this.roleGroupSettingsService.data.next(this.roleGroupSettings);
       this.isAllRolesSelected = false;
     }
   }

   checkChangeAction(event,selectedRole) {

     if(event) {
      this.roleGroupSettings.roleGroupList.push(<RoleGroup>{GroupId:this.groupData['Id'],RoleId:selectedRole});
      this.roleGroupSettingsService.data.next(this.roleGroupSettings);
      this.isRoleChecked[selectedRole] = event;
    }
    else {
      let index = this.roleGroupSettings.roleGroupList.findIndex(result => result.RoleId === selectedRole);
      this.roleGroupSettings.roleGroupList.splice(index,1);
      this.roleGroupSettingsService.data.next(this.roleGroupSettings);
    }     
   }

}
