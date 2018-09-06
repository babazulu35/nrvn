import { BackstageComponentsModule } from './../../../backstage-module/backstage-components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationCreateComponent } from './routes/reservation-create/reservation-create.component';
import { ReservationCreateIndexComponent } from './routes/reservation-create/reservation-create-index/reservation-create-index.component';
import { ReservationCreateSeatEditorComponent } from './routes/reservation-create/reservation-create-seat-editor/reservation-create-seat-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../../pipes.module';
import { BaseComponentsModule } from '../../../base-module/base-components.module';
import { CommonComponentsModule } from '../../../common-module/common-components.module';
import { CustomerCapacitySelectListComponent } from './components/customer-capacity-select-list/customer-capacity-select-list.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: ':role', component: ReservationCreateComponent, 
      children: [
          {path: 'seat-editor', component: ReservationCreateSeatEditorComponent},
          {path: '', component: ReservationCreateIndexComponent}
      ]
  },
];

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    PipesModule,
    BaseComponentsModule,
    CommonComponentsModule,
    BackstageComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    ReservationCreateComponent, 
    ReservationCreateIndexComponent,
    ReservationCreateSeatEditorComponent, 
    CustomerCapacitySelectListComponent
  ]
})
export class ReservationCreateModule { }
