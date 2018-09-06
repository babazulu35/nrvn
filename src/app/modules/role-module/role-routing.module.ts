import { RoleListComponent } from './role/role-list/role-list.component';
import { RoleComponent } from './role/role.component';
import { AuthGuardService } from './../../services/auth-guard.service';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { RoleGroupComponent } from './role/role-group/role-group.component';

const roleRouting:Routes = [
  { path: '', component: RoleComponent,canActivate: [AuthGuardService], canActivateChild: [AuthGuardService], children: [
    {path: 'list',component: RoleListComponent},
    {path: 'group', component: RoleGroupComponent},
    {path: '', redirectTo: 'list', pathMatch: "full" }
]},
]


@NgModule({
  imports: [
    RouterModule.forChild(roleRouting)
  ],
  exports: [
    RouterModule
  ]
})
export class RoleRoutingModule { }
