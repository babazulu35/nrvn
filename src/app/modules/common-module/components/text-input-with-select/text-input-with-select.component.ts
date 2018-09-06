import { SelectboxComponent } from './../../../base-module/components/selectbox/selectbox.component';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { Component, OnInit, HostBinding, Input, ViewChild, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-text-input-with-select',
  templateUrl: './text-input-with-select.component.html',
  styleUrls: ['./text-input-with-select.component.scss']
})
export class TextInputWithSelectComponent implements OnInit {
  @HostBinding('class.c-text-input-with-select') true;
  @ViewChild(TextInputComponent) textInput: TextInputComponent;
  @ViewChild(SelectboxComponent) selectbox: SelectboxComponent;

  @Output() changeEvent:EventEmitter<{option: any, value: any}> = new EventEmitter();
  @Output() selectEvent:EventEmitter<any> = new EventEmitter();

  @Input() resetOnSelect:boolean;
  
  @Input() selectOptions: { value: any, text: string }[];
  @Input() selectValue: any;
  @Input() inputValue: any;
  @Input() isDisabled: boolean;

  constructor() { }

  ngOnInit() {
  }

  selectChangeHandler(event) {
    if(this.textInput && this.resetOnSelect) this.textInput.value = "";
    this.selectEvent.emit(this.selectbox.value);
    this.changeEvent.emit({option: this.selectbox.value, value: this.textInput.value});
  }

  inputChangeHandler(event) {
    this.changeEvent.emit({option: this.selectbox.value, value: this.textInput.value});
  }

}
