import { MainComponent } from './../../routes/main/main.component';
import { MultiplePerformanceCreateCapacityComponent } from './multiple-performance/multiple-performance-create/multiple-performance-create-capacity/multiple-performance-create-capacity.component';
import { MultiplePerformanceCreateProductsComponent } from './multiple-performance/multiple-performance-create/multiple-performance-create-products/multiple-performance-create-products.component';
import { MultiplePerformanceCreatePerformancesComponent } from './multiple-performance/multiple-performance-create/multiple-performance-create-performances/multiple-performance-create-performances.component';
import { MultiplePerformanceCreateComponent } from './multiple-performance/multiple-performance-create/multiple-performance-create.component';
import { MultiplePerformanceComponent } from './multiple-performance/multiple-performance.component';
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MultiplePerformanceCreateEventComponent } from './multiple-performance/multiple-performance-create/multiple-performance-create-event/multiple-performance-create-event.component';
import { AuthGuardService } from '../../services/auth-guard.service';

const multiplePerformanceRoutes: Routes = [
  { path: '', component: MultiplePerformanceComponent,canActivate: [AuthGuardService], canActivateChild: [AuthGuardService], children: [
      { path: 'create', component: MultiplePerformanceCreateComponent, children: [
          {path: 'event', component: MultiplePerformanceCreateEventComponent },
          {path: 'performances', component: MultiplePerformanceCreatePerformancesComponent },
          {path: 'products', component: MultiplePerformanceCreateProductsComponent },
          {path: 'capacity', component: MultiplePerformanceCreateCapacityComponent },
          {path: '', redirectTo: 'event', pathMatch: "full" }
      ]}
  ]},
];

@NgModule({
  imports: [
    RouterModule.forChild(multiplePerformanceRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class MultiplePerformanceRoutingModule {} 