import { DialogBoxComponent } from './components/dialog-box/dialog-box.component';
import { TextInputComponent } from './components/text-input/text-input.component';
import { SelectboxComponent } from './components/selectbox/selectbox.component';
import { RadioGroupComponent } from './components/radio-group/radio-group.component';
import { PromiseIconComponent } from './components/promise-icon/promise-icon.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { ButtonComponent } from './components/button/button.component';
import { PipesModule } from './../pipes.module';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LocalizationBoxComponent } from './components/localization-box/localization-box.component';
import { TextAreaComponent } from './components/text-area/text-area.component';
import { TimeInputComponent } from './components/time-input/time-input.component';
import { FileUploadBoxComponent } from './components/file-upload-box/file-upload-box.component';
import { ListboxComponent } from './components/listbox/listbox.component';
import { StickyDirective } from '../../directives/sticky.directive';



@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule, PipesModule,
  ],
  declarations: [
    ButtonComponent,
    CheckboxComponent,
    PromiseIconComponent,
    RadioGroupComponent,
    SelectboxComponent,
    TextInputComponent,
    DialogBoxComponent,
    LocalizationBoxComponent,
    TextAreaComponent,
    TimeInputComponent,
    FileUploadBoxComponent,
    ListboxComponent,
    StickyDirective
  ],
  exports: [
    ButtonComponent,
    CheckboxComponent,
    PromiseIconComponent,
    RadioGroupComponent,
    SelectboxComponent,
    TextInputComponent,
    DialogBoxComponent,
    LocalizationBoxComponent,
    TextAreaComponent,
    TimeInputComponent,
    FileUploadBoxComponent,
    ListboxComponent,
    StickyDirective
  ]
})

export class BaseComponentsModule { };