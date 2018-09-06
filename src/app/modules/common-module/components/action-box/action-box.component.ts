import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-action-box',
  templateUrl: './action-box.component.html',
  styleUrls: ['./action-box.component.scss']
})
export class ActionBoxComponent implements OnInit {
  @HostBinding('class.c-action-box') true;

  @HostBinding('class.c-action-box--readonly')
  @Input() readonly: boolean;

  @Output() actionEvent: EventEmitter<{action: string, value: any, params?: any}> = new EventEmitter();

  @Input() title: string;
  @Input() description: string;
  @Input() input: {type?: string, placeholder?: string, min?: number, max?: number};
  @Input() buttons: {label: string, action: string, params?: any, theme?: string, isPromising?: boolean}[];
  @Input() value: string = "";
  @Input() isPromising: boolean;


  get inputIsValid():boolean {
    return this.value && this.value.toString().length > 0;
  }

  constructor() { }

  ngOnInit() {

  }

  buttonClickHandler(button:{label: string, action: string, params?: any, theme?: string}, event) {
    if(button) this.actionEvent.emit({action: button.action, value: this.input && this.input.type == "number" ? parseFloat(this.value) : this.value, params: button.params});
  }

  inputFocusHandler(event) {

  }

  inputFocusOutHandler(event) {
    if(this.input.type == "number") {
      if(parseFloat(this.value) < this.input.min) this.value = this.input.min.toString();
      if(parseFloat(this.value) > this.input.max) this.value = this.input.max.toString();
    }
  }

  inputEnterHandler(event) {
    if(!this.buttons){
      this.actionEvent.emit({action: 'enter', value: this.input && this.input.type == "number" ? parseFloat(this.value) : this.value});
    }else{
      if(this.buttons.length == 1) this.actionEvent.emit({action: this.buttons[0].action, value: this.input && this.input.type == "number" ? parseFloat(this.value) : this.value, params: this.buttons[0].params});
    }
  }

  inputEscapeHandler(event) {
    if(!this.buttons) this.actionEvent.emit({action: 'escape', value: null});
  }

}
