import { InvitationsComponent } from './routes/invitations/invitations.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes.module';
import { BaseComponentsModule } from '../base-module/base-components.module';
import { CommonComponentsModule } from '../common-module/common-components.module';
import { BackstageComponentsModule } from '../backstage-module/backstage-components.module';
import { Routes, RouterModule } from '@angular/router';
import { BoxofficeComponentsModule } from '../boxoffice-module/boxoffice-components.module';

const routes: Routes = [
  { path: 'create', loadChildren: "./modules/reservation-create-module/reservation-create.module#ReservationCreateModule"},
  { path: '', component: InvitationsComponent }
];

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    RouterModule.forChild(routes),
    PipesModule,
    BaseComponentsModule,
    CommonComponentsModule,
    BackstageComponentsModule,
    BoxofficeComponentsModule
  ],
  declarations: [
    InvitationsComponent
  ]
})
export class InvitationModule { }
