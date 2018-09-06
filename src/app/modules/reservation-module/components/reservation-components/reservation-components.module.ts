import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerSeatInfoBoxComponent } from '../customer-seat-info-box/customer-seat-info-box.component';
import { ExpirationDatePickerBoxComponent } from '../expiration-date-picker-box/expiration-date-picker-box.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../../pipes.module';
import { BaseComponentsModule } from '../../../base-module/base-components.module';
import { CommonComponentsModule } from '../../../common-module/common-components.module';
import { BackstageComponentsModule } from '../../../backstage-module/backstage-components.module';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    PipesModule,
    BaseComponentsModule,
    CommonComponentsModule,
    BackstageComponentsModule
  ],
  declarations: [
    CustomerSeatInfoBoxComponent,
    ExpirationDatePickerBoxComponent,
  ]
})
export class ReservationComponentsModule { }
