import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonComponentsModule } from './../common-module/common-components.module';
import { BaseComponentsModule } from './../base-module/base-components.module';
import { PipesModule } from './../pipes.module';
import { CmsTextInputComponent } from './components/cms-text-input/cms-text-input.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsComponentContainerComponent } from './components/cms-component-container/cms-component-container.component';
import { CmsComponentComponent } from './components/cms-component/cms-component.component';
import { CmsFieldComponent } from './components/cms-field/cms-field.component';
import { GetDatasourceBoxComponent } from './common/get-datasource-box/get-datasource-box.component';
import { CmsComponentContainerCardComponent } from './components/cms-component-container-card/cms-component-container-card.component';
import { CmsComponentSettingsBlockComponent } from './components/cms-component-settings-block/cms-component-settings-block.component';
import { CmsFieldCardComponent } from './components/cms-field-card/cms-field-card.component';
import { CmsComponentCreateBoxComponent } from './common/cms-component-create-box/cms-component-create-box.component';
import { CmsFieldCreateBoxComponent } from './common/cms-field-create-box/cms-field-create-box.component';
import { DatasourceParameterCreateBoxComponent } from './common/datasource-parameter-create-box/datasource-parameter-create-box.component';
import { KeyValueItemCreateBoxComponent } from './common/key-value-item-create-box/key-value-item-create-box.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PipesModule,
    BaseComponentsModule,
    CommonComponentsModule
  ],
  declarations: [
    CmsTextInputComponent,
    CmsComponentContainerComponent,
    CmsComponentComponent,
    CmsFieldComponent,
    GetDatasourceBoxComponent,
    CmsComponentContainerCardComponent,
    CmsComponentSettingsBlockComponent,
    CmsFieldCardComponent,
    CmsComponentCreateBoxComponent,
    CmsFieldCreateBoxComponent,
    DatasourceParameterCreateBoxComponent,
    KeyValueItemCreateBoxComponent
  ],
  exports: [
    CmsTextInputComponent,
    CmsComponentContainerComponent,
    CmsComponentComponent,
    CmsFieldComponent,
    GetDatasourceBoxComponent,
    CmsComponentContainerCardComponent,
    CmsComponentSettingsBlockComponent,
    CmsFieldCardComponent,
    CmsComponentCreateBoxComponent,
    CmsFieldCreateBoxComponent,
    DatasourceParameterCreateBoxComponent,
    KeyValueItemCreateBoxComponent
  ]
})
export class CmsComponentsModule { }
