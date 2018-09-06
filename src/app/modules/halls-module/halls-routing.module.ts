import { AuthGuardService } from './../../services/auth-guard.service';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HallsComponent } from './halls/halls.component';

const hallsRoutes:Routes = [
  { path: '', component: HallsComponent,canActivate: [AuthGuardService], canActivateChild: [AuthGuardService]}
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(hallsRoutes)
  ],
  exports:[
    RouterModule
  ]
})
export class HallsRoutingModule { }
