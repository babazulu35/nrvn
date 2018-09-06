import { ReservationsComponent } from './routes/reservations/reservations.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes.module';
import { BaseComponentsModule } from '../base-module/base-components.module';
import { CommonComponentsModule } from '../common-module/common-components.module';
import { BackstageComponentsModule } from '../backstage-module/backstage-components.module';
import { Routes, RouterModule } from '@angular/router';
import { CustomerSeatInfoBoxComponent } from './components/customer-seat-info-box/customer-seat-info-box.component';
import { ExpirationDatePickerBoxComponent } from './components/expiration-date-picker-box/expiration-date-picker-box.component';
import { ReservationComponentsModule } from './components/reservation-components/reservation-components.module';

const routes: Routes = [
  { path: 'create', loadChildren: "./modules/reservation-create-module/reservation-create.module#ReservationCreateModule"},
  { path: '', component: ReservationsComponent }
];

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    RouterModule.forChild(routes),
    PipesModule,
    BaseComponentsModule,
    CommonComponentsModule,
    BackstageComponentsModule,
    ReservationComponentsModule,
  ],
  declarations: [
    ReservationsComponent,
  ]
})
export class ReservationModule { }
