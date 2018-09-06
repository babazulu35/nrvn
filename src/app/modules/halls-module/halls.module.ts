import { HallRowComponent } from './components/hall-row/hall-row.component';
import { CommonComponentsModule } from './../common-module/common-components.module';
import { BaseComponentsModule } from './../base-module/base-components.module';
import { PipesModule } from './../pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HallsRoutingModule } from './halls-routing.module';
import { HallsComponent } from './halls/halls.component';
import { EntityService } from '../../services/entity.service';
import { CreateHallBoxComponent } from './components/create-hall-box/create-hall-box.component';
import { BackstageComponentsModule } from '../../modules/backstage-module/backstage-components.module';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    HallsRoutingModule,
    PipesModule,
    BaseComponentsModule,
    CommonComponentsModule,  
    BackstageComponentsModule
  ],
  declarations: [HallsComponent,HallRowComponent, CreateHallBoxComponent],
  providers: [ EntityService ]
})
export class HallsModule { }
