import { GroupSaleSettingsComponent } from './routes/group-sale/group-sale-settings/group-sale-settings.component';
import { GroupSaleSeatEditorComponent } from './routes/group-sale/group-sale-seat-editor/group-sale-seat-editor.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes.module';
import { BaseComponentsModule } from '../base-module/base-components.module';
import { CommonComponentsModule } from '../common-module/common-components.module';
import { BackstageComponentsModule } from '../backstage-module/backstage-components.module';
import { Routes, RouterModule } from '@angular/router';
import { GroupSaleComponent } from './routes/group-sale/group-sale.component';

const routes: Routes = [
  { path: '', component: GroupSaleComponent, 
      children: [
        { path: 'seat-editor', component: GroupSaleSeatEditorComponent },
        { path: 'settings', component: GroupSaleSettingsComponent },
        { path: '', redirectTo: "seat-editor", pathMatch: "full" }
      ]
  },
];

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    RouterModule.forChild(routes),
    PipesModule,
    BaseComponentsModule,
    CommonComponentsModule,
    BackstageComponentsModule,
  ],
  declarations: [
    GroupSaleSeatEditorComponent,
    GroupSaleSettingsComponent,
    GroupSaleComponent
  ]
})
export class GroupSaleModule { }
