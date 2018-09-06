import { RoleGroupSettingsService } from './../../role-group-settings.service';
import { GroupService } from './../../../../services/group.service';

import { Group } from './../../../../models/group';
import { Component, OnInit, Input,AfterViewInit,AfterContentInit } from '@angular/core';
import { MainLoaderService } from '../../../../services/main-loader.service';


@Component({
  selector: 'app-role-group-list',
  templateUrl: './role-group-list.component.html',
  styleUrls: ['./role-group-list.component.scss'],

})
export class RoleGroupListComponent implements OnInit,AfterViewInit {
  
  roleGroupList;
  
  isLoading:boolean = false;
  isSelected = [];

  @Input() groupList;
  constructor( private mainLoaderService:MainLoaderService,private groupService:GroupService,private roleGroupSettingsService:RoleGroupSettingsService) { }

  ngOnInit() {
    this.isLoading = true;
  }

  ngAfterViewInit() {
    
    this.groupList.subscribe(groupListResult => {
      if(groupListResult) {
        this.roleGroupList = groupListResult;
        this.isLoading = false;
        this.mainLoaderService.updateLoading(false);
      }
      
    })   
    
    this.groupService.groupData.subscribe(result => {
      if(result) {
        this.mainLoaderService.updateContentStatus(true);
        this.isSelected = [];
        result['Id'] == 0 ? this.isSelected = [] : this.isSelected[result['Id']] = true;
      }
    });

    this.roleGroupSettingsService.resetData.subscribe(result => {
      
      if(result) {
        this.isSelected = [];
      }
    })
  }

  onClickedGroup(list:Group[]) {
    this.groupService.groupData.next(list);
  }
}
