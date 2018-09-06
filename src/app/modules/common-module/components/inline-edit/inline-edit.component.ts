import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { Component, OnInit, Input, Output, HostBinding, EventEmitter, ElementRef, ViewChild, Renderer } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-inline-edit',
  templateUrl: './inline-edit.component.html',
  styleUrls: ['./inline-edit.component.scss']
})
export class InlineEditComponent implements OnInit {
  @ViewChild(TextInputComponent) textInput: TextInputComponent;

  @HostBinding('class.c-inline-edit') true ;

  @HostBinding('class.c-inline-edit--error')

  @Input() isError: boolean = false;

  @HostBinding('class.c-inline-edit--editable')
  @Input() isEditing: boolean = false;

  @HostBinding('class.c-inline-edit--processing')
  @Input() isPromising: boolean = false;

  @HostBinding('class.c-inline-edit--underline')
  themeIsUnderline: boolean = false;

  @HostBinding('class.c-inline-edit--dirty')
  get isDirty():boolean {
    return this.value && this.value.length > 0;
  }

  @Output() changeEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() onInputSave : EventEmitter<String> = new EventEmitter<String>();
  @Output() onInputChange : EventEmitter<String> = new EventEmitter<String>();
  @Output() actionEvent: EventEmitter<{action: string, value?:any, hasLocalization?:boolean}> = new EventEmitter<any>();
  
  @Input() data: string;
  @Input() placeholder: string;
  @Input() delay: number = 300;
  @Input() dismissOnFocusOut: boolean = false;

  @Input() value: any;
  @Input() hasLocalization:boolean;
  @Input() action: string;

  @Input('theme') set inputTheme(value: string) {
    this.theme = value;
    this.themeIsUnderline = value == "underline";
  };

  get label():string {
    return this.value ? this.value : this.placeholder;
  }
  
  theme: string;
  
  constructor(
    private elementRef: ElementRef, 
    private renderer: Renderer
  ) { }

  ngOnInit() {
    
  }

  inputReadyEventHandler(input) {
    input.focus();
  }

  inputChangeEventHandler(value){
    this.value = this.hasLocalization ? value.localization : value;
    this.changeEvent.emit(this.value);
    this.onSave();
    this.isEditing = false;
  }

  inputDismissEventHandler(value) {
    this.isEditing = false;
  }

  startEdit(e:MouseEvent){
    if(this.isEditing) return;
    if(this.action) {
      this.actionEvent.emit({action: this.action, value: this.value, hasLocalization: this.hasLocalization})
      return;
    }
    this.isEditing = true;
    let self = this;
    setTimeout(function(){
      self.textInput.focus();
      if(self.hasLocalization) {
        self.textInput.openLocalizationBox();
      }else{
        let tempvalue = self.textInput.input.nativeElement.value;
        self.textInput.input.nativeElement.value = "";
        self.textInput.input.nativeElement.value = tempvalue;
      }
    }, 100);
  }
  
  onSave(){
    this.onInputSave.emit(this.value);
  }

  onChange(val){
    this.data = val;
    this.onInputChange.emit(this.data);
  }

}
