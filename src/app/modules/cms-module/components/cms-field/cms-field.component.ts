import { FileUploadBoxComponent } from './../../../base-module/components/file-upload-box/file-upload-box.component';
import { TimeInputComponent } from './../../../base-module/components/time-input/time-input.component';
import { SelectboxComponent } from './../../../base-module/components/selectbox/selectbox.component';
import { CheckboxComponent } from './../../../base-module/components/checkbox/checkbox.component';
import { TextAreaComponent } from './../../../base-module/components/text-area/text-area.component';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { Component, OnInit, Input, HostBinding, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-cms-field',
  templateUrl: './cms-field.component.html',
  styleUrls: ['./cms-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CmsFieldComponent implements OnInit {
  @ViewChild(TextInputComponent) textInput: TextInputComponent;
  @ViewChild(TextAreaComponent) textArea: TextAreaComponent;
  @ViewChild(CheckboxComponent) checkbox: CheckboxComponent;
  @ViewChild(SelectboxComponent) selectbox: SelectboxComponent;
  @ViewChild(FileUploadBoxComponent) fileUploadBox: FileUploadBoxComponent;
  @ViewChild(TimeInputComponent) timeInput: TimeInputComponent;

  @HostBinding('class.c-cms-field') true;

  @Input() data: any;
  @Input() component: any;
  @Input() value: any;
  @Input() name: string;
  @Input() hasLocalization: boolean;

  get isValid() {
    let valid: boolean = this.data != null;
    if(valid && this.data.Required) {
      switch(this.data.FieldType) {
        case "Text":
        // case "TextField":
        case "DateTime":
        case "Number":
          if(this.textInput) valid = this.textInput.isValid;
        break;
        // case "TextArea":
        case "FormattedText":
          if(this.textArea) valid = this.textArea.isValid;
        break;
        case "Time":
          if(this.timeInput) valid = this.timeInput.isValid;
        break;
        case "Selectbox":
          if(this.selectbox) valid = this.selectbox.value != null && this.selectbox.value != -1;
        break;
        case "Image":
          if(this.fileUploadBox) valid = this.fileUploadBox.value != null && this.fileUploadBox.value.length > 0;
        break;
      }
    }
    return valid;
  }

  constructor(
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if(!this.name) this.name = this.data.UniqueName;
    if(!this.value) this.value = this.data.Value;
    
    if(this.data) {
      let allowMultiLang = this.data.Settings ? this.data.Settings.allowMultiLang : this.data["MultiLang"];
      switch(this.data.FieldType) {
        case "Image":
          if(!this.hasLocalization) this.hasLocalization = allowMultiLang;
        break;
        case "Text":
        // case "TextField":
        // case "TextArea":
        case "FormattedText":
          if(!this.hasLocalization) this.hasLocalization = allowMultiLang === false ? false : true;
        break;
        default:
          this.hasLocalization = false;
        break;
      }
    }
  }

  valueChangeHandler(event) {
    this.value = this.hasLocalization ? event.localization : event;
    this.changeDetector.detectChanges();
  }

}
