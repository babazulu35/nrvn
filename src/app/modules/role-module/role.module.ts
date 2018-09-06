import { BackstageComponentsModule } from './../backstage-module/backstage-components.module';

import { CommonComponentsModule } from './../common-module/common-components.module';
import { BaseComponentsModule } from './../base-module/base-components.module';
import { PipesModule } from './../pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoleRoutingModule } from './role-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleComponent } from './role/role.component';
import { RoleListComponent } from './role/role-list/role-list.component';
import { RoleGroupComponent } from './role/role-group/role-group.component';
import { RoleGroupListComponent } from './components/role-group-list/role-group-list.component';
import { RoleGroupSettingsComponent } from './components/role-group-settings/role-group-settings.component';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    BaseComponentsModule,
    CommonComponentsModule,   
    RoleRoutingModule,
    BackstageComponentsModule,
    PipesModule,
  ],
  declarations: [RoleComponent, RoleListComponent, RoleGroupComponent, RoleGroupListComponent, RoleGroupSettingsComponent],


})
export class RoleModule { }
