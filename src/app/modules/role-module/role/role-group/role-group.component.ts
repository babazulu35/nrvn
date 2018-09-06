import { NotificationService } from './../../../../services/notification.service';
import { Subscription } from 'rxjs/Subscription';
import { RoleGroup } from './../../models/role-group';
import { RoleGroupService } from './../../role-group.service';
import { RoleGroupSettingsService } from './../../role-group-settings.service';
import { Group } from './../../../../models/group';
import { Component, OnInit, Inject,OnDestroy  } from '@angular/core';
import { HeaderTitleService } from '../../../../services/header-title.service';
import { GroupService } from '../../../../services/group.service';
import { MainLoaderService } from '../../../../services/main-loader.service';
import { Router } from '@angular/router';
import { RoleGroupSettings } from '../../models/role-group-settings';



@Component({
  selector: 'app-role-group',
  templateUrl: './role-group.component.html',
  styleUrls: ['./role-group.component.scss'],
  providers:[GroupService,RoleGroupSettingsService,RoleGroupService,{provide: 'createGroupDataService', useClass: GroupService}]
})
export class RoleGroupComponent implements OnInit,OnDestroy {

  constructor(
    private headerTitleService: HeaderTitleService,
    public groupService:GroupService,
    private mainLoaderService:MainLoaderService,
    private router:Router,
    private roleGroupSettingsService:RoleGroupSettingsService,
    private roleGroupService:RoleGroupService,
    @Inject('createGroupDataService') private createGroupDataService: GroupService,
    private notifiacationService: NotificationService
  ) { }
  
  roleGroupSettingsData;
  subscriptionGroupService:Subscription;
  refreshSubscriptionGroupService:Subscription;
  contentLoader:boolean = false;
  groupData;

  isValid:boolean;
  isPromising:boolean = false;
  
  groupSettingsRequest:RoleGroupSettings = new RoleGroupSettings();


  ngOnInit() {
    this.isValid = false;
    this.headerTitleService.setTitle('Rol Grupları');
    this.headerTitleService.setLink('/role/group');   
    

    
   this.subscriptionGroupService = this.groupService.queryParamSubject.subscribe(response => {
      this.mainLoaderService.updateLoading(true);
      if(response) {
        let query = this.groupService.fromEntity('Group').take(1000).page(response['page']).orderBy('Id','desc');
        query.executeQuery();
      }
    },error => {
      if(error) {
        this.notifiacationService.add({text:error['Message'] ,type:'danger'});
      }
      this.mainLoaderService.updateLoading(false);
    });


    this.groupService.groupData.subscribe(result => {
      if(result && Object.keys(result).length) {
          this.groupData = result;  
          this.groupData['Id'] == 0 ? this.isValid = false : this.isValid = true;    
      }
    })

    this.roleGroupSettingsService.data.subscribe(result => {
      if(result && Object.keys(result).length > 0) {
        console.log("======= Role Group Data ==========",result);  
        if(result.group.length > 0 && result.roleGroupList.length > 0 )
        {
          this.isValid = true;
          this.roleGroupSettingsData = result;
          
        }
        else {
          this.isValid = false;
        }
      }
})    

  }

  createNew() {
   this.groupData = {Name: "Yeni Rol Grubu", Id: 0};
   this.groupService.groupDataDetail(this.groupData); 
  }

  saveRoleGroup(e) {
    if(this.groupData['Id'] == 0) {
      this.isPromising = true;
      this.createGroupDataService.flushCustomEndpoint();
      let creation = this.createGroupDataService.save(<Group>{Name:this.roleGroupSettingsData.group[0]['Name']});
      creation.subscribe(result => {

        if(result && typeof result == 'number') {

          this.prepareToSend(result);
          this.createGroupDataService.setCustomEndpoint('SetGroupDetail');
          this.createGroupDataService.save(this.groupSettingsRequest).subscribe(updateResult => {
            console.log("Create Result",updateResult);
            console.log("=== FINAL REQUEST ON CREATE DATA =====",this.groupSettingsRequest); 
            this.roleGroupSettingsService.setResetData(true);
            this.isValid = false;
            this.isPromising = false;
            this.groupData.Name= '';
            this.refreshGroupServiceSubscribe();
            this.notifiacationService.add({text:'Yeni Kayıt işleminiz başarılı bir şekilde tamamlandı!',type:'success'});
          },error => {
            if(error) {
              this.notifiacationService.add({text:error['Message'],type:'danger'});
              this.isPromising = false;
            }
            
          });          
           

        }
      })

    }
    else {
      this.isPromising = true;
      this.prepareToSend();
      this.createGroupDataService.setCustomEndpoint('SetGroupDetail');
      this.createGroupDataService.save(this.groupSettingsRequest).subscribe(updateResult => {
        console.log("Update Result",updateResult);
        
        console.log("=== FINAL REQUEST DATA =====",this.groupSettingsRequest);
        this.roleGroupSettingsService.setResetData(true);
        this.isValid = false;
        this.isPromising = false;
        this.groupData.Name= '';
        this.refreshGroupServiceSubscribe();
        this.notifiacationService.add({text:'Düzenleme işleminiz başarılı bir şekilde tamamlandı!',type:'success'});
      },error => {
        if(error) {
          this.notifiacationService.add({text:error['Message'],type:'danger'});
          this.isPromising = false;
        }
      });
    
    }
  }

  prepareToSend(id?:number) {
    let roleId = [];
    let userId = []
    this.groupSettingsRequest.Id =  id ? id :this.roleGroupSettingsData.group[0].Id;
    this.groupSettingsRequest.Name = this.roleGroupSettingsData.group[0].Name;
    this.roleGroupSettingsData.roleGroupList.forEach(element => {
      roleId.push(element.RoleId);
    });
    
    this.roleGroupSettingsData.userGroup.forEach(element => {
      userId.push(element.UserId);
    });
    
    this.groupSettingsRequest.Roles = roleId;
    this.groupSettingsRequest.Users = userId;
  }

  ngOnDestroy() {
    if(this.subscriptionGroupService) this.subscriptionGroupService.unsubscribe();
    if(this.refreshSubscriptionGroupService) this.refreshSubscriptionGroupService.unsubscribe();
  }

  refreshGroupServiceSubscribe() {
    this.refreshSubscriptionGroupService = this.groupService.queryParamSubject.subscribe(response => {
      this.mainLoaderService.updateLoading(true);
      if(response) {
        let query = this.groupService.fromEntity('Group').orderBy('Id','desc').take(1000).page(response['page']);
        query.executeQuery();
      }
    },error => {
      if(error) {
        this.notifiacationService.add({text:error['Message'],type:'danger'})
      }
      this.mainLoaderService.updateLoading(false);
    });
  }

}
