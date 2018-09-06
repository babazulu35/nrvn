import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonComponentsModule } from '../common-module/common-components.module';
import { BaseComponentsModule } from '../base-module/base-components.module';
import { PipesModule } from '../pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MultiplePerformanceComponent } from './multiple-performance/multiple-performance.component';
import { BackstageComponentsModule } from './../backstage-module/backstage-components.module';
import { MultiplePerformanceRoutingModule } from './multiple-performance-routing.module';
import { MultiplePerformanceCreateComponent } from './multiple-performance/multiple-performance-create/multiple-performance-create.component';
import { MultiplePerformanceCreateEventComponent } from './multiple-performance/multiple-performance-create/multiple-performance-create-event/multiple-performance-create-event.component';
import { MultiplePerformanceCreateProductsComponent } from './multiple-performance/multiple-performance-create/multiple-performance-create-products/multiple-performance-create-products.component';
import { MultiplePerformanceCreatePerformancesComponent } from './multiple-performance/multiple-performance-create/multiple-performance-create-performances/multiple-performance-create-performances.component';
import { MultiplePerformanceCreateCapacityComponent } from './multiple-performance/multiple-performance-create/multiple-performance-create-capacity/multiple-performance-create-capacity.component';
import { AddMultiplePerformanceComponent } from './components/add-multiple-performance/add-multiple-performance.component';
import { PerformanceProductBlockComponent } from './components/performance-product-block/performance-product-block.component';
import { RelativeProductPriceBlockComponent } from './components/relative-product-price-block/relative-product-price-block.component';
import { SetDurationComponent } from './components/set-duration/set-duration.component';
import { PerformanceCellBoxComponent } from './components/performance-cell-box/performance-cell-box.component';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MultiplePerformanceRoutingModule,
    PipesModule,
    BaseComponentsModule,
    CommonComponentsModule,
    BackstageComponentsModule
  ],

  declarations: [
    MultiplePerformanceComponent, 
    MultiplePerformanceCreateComponent, 
    MultiplePerformanceCreateEventComponent, 
    MultiplePerformanceCreateProductsComponent, 
    MultiplePerformanceCreatePerformancesComponent, 
    MultiplePerformanceCreateCapacityComponent, 
    PerformanceProductBlockComponent, 
    RelativeProductPriceBlockComponent,
    AddMultiplePerformanceComponent,
    SetDurationComponent,
    PerformanceCellBoxComponent
  ],
  exports: [
    PerformanceProductBlockComponent,
    RelativeProductPriceBlockComponent
  ]

})
export class MultiplePerformanceModule { }
