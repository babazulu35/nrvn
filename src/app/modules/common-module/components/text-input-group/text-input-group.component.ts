import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { Component, OnInit, HostBinding, Input, ViewChildren, Output, EventEmitter, QueryList, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-text-input-group',
  templateUrl: './text-input-group.component.html',
  styleUrls: ['./text-input-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextInputGroupComponent implements OnInit {
  @ViewChildren(TextInputComponent) textInputs: QueryList<TextInputComponent>;

  @HostBinding ('class.c-text-input-group') true;

  @HostBinding('class.c-text-input-group--error') get hasError():boolean { return this.anyTouched && !this.isValid };

  @HostBinding('class.c-text-input-group--disabled') @Input() isDisabled: boolean;

  @Output() changeEvent: EventEmitter<{values: any[], formattedValue: string, valid: boolean}> = new EventEmitter();

  @Input() required: boolean;
  @Input() valueSeperatorChar: string = "-";
  @Input() displaySeperatorChar: string = "-";
  @Input() textAlign: string;
  @Input() inputList: {
    type: string,
    value?: any,
    width?: string,
    textAlign?: string,
    settings?: {}
  }[];
  @Input() set values(values: any[]) {
    this.rawValues = values;
    if(this.inputList && this.rawValues && this.rawValues.length) {
      this.inputList.map( (item, index) => {
        item.value = this.rawValues[index];
      });
    }
  };

  @Input() set type(type: string) {
    this.rawType = type;
    switch(this.rawType) {
      case "ipv4":
        this.valueSeperatorChar = ".";
        this.displaySeperatorChar = "•"
        this.textAlign = "center";
        this.inputList = [];
        this.inputList.push({type: "numeric", settings: {min: 1, max: 255, maxlength: 3, isTypeEmitting: true, required: true}});
        this.inputList.push({type: "numeric", settings: {min: 0, max: 255, maxlength: 3, isTypeEmitting: true, required: true}});
        this.inputList.push({type: "numeric", settings: {min: 0, max: 255, maxlength: 3, isTypeEmitting: true, required: true}});
        this.inputList.push({type: "numeric", settings: {min: 0, max: 255, maxlength: 3, isTypeEmitting: true, required: true}});
      break;
      default: 
        if(!this.valueSeperatorChar) this.valueSeperatorChar = "-";
      break;
    }
  };

  @Input() set value(value: string ) {this.formattedValue = value };
  @Input() set formattedValue(value: string) {
    if(!value) {
     this.values = null;
     return; 
    };
    let valueParts: string[] = value.split(this.valueSeperatorChar);
    if(!this.inputList){
      this.inputList = [];
      valueParts.forEach( item => this.inputList.push({type: "text"}));
    }
    this.values = valueParts;
  }
  @Input() size: string = "md";
  @Input() theme: string;

  get values(): any[] {
    let values: any[] = [];
    this.inputList.forEach( item => values.push(item.value));
    return values;
  }
  get formattedValue(): string {
    return this.values.join(this.valueSeperatorChar);
  }
  get value(): string {
    return this.formattedValue;
  }

  get allTouched():boolean {
    return this.textInputList && this.textInputList.filter( item => item.isDirty ).length == this.textInputList.length;
  }

  get anyTouched():boolean {
    return this.textInputList && this.textInputList.some( item => item.isDirty );
  }

  get isValid():boolean {
    let valid: boolean = true;
    let inputValid: boolean = this.textInputList ? !this.textInputList.some( item => item.hasError) : true;
    switch(this.rawType) {
      case "ipv4":
        valid = inputValid && !this.values.some(item => isNaN(item));
      break;
    }
    return valid;
  }

  rawType: string;
  rawValues: any[];
  textInputList: TextInputComponent[];

  constructor( private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.textInputs.changes.subscribe( result => {
      this.textInputList = result;
    });
    if(!this.textInputList) this.textInputList = this.textInputs.toArray();
  }

  changeEventHandler(event, inputData, textInput) {
    inputData.value = event;
    this.changeDetector.detectChanges();
    this.changeEvent.emit({values: this.values, formattedValue: this.formattedValue, valid: this.isValid});
  }

  typeEventHandler(event, inputData, textInput) {
    if(!event) return;
    inputData.value = event;
    this.changeDetector.detectChanges();
    this.checkInputType(textInput);
    this.changeEvent.emit({values: this.values, formattedValue: this.formattedValue, valid: this.isValid});
  }

  dismissEventHandler(event, inputData, textInput) {
    
  }

  focusEventHandler(event, inputData, textInput) {
    
  }

  private checkInputType(textInput: TextInputComponent) {
    if(!this.textInputList) return;
    switch(this.rawType) {
      case "ipv4":
        if(parseInt(textInput.value) >= 100 && parseInt(textInput.value) <=255 && textInput.isValid) {
          let nextInput: TextInputComponent = this.getNextInput(textInput);
          if(nextInput) nextInput.focus();
        } 
      break;
    }
  }

  private getNextInput(textInput, isCarousel:boolean = true):TextInputComponent {
    if(!this.textInputList) return null;
    let index: number = this.textInputList.indexOf(textInput);
    index++;
    return index < this.textInputs.length ? this.textInputList[index] : this.textInputList[0];
  }

  private getPreviousInput(textInput, isCarousel:boolean = true):TextInputComponent {
    if(!this.textInputList) return null;
    let index: number = this.textInputList.indexOf(textInput);
    index--;
    return index > -1 ? this.textInputList[index] : this.textInputList[0];
  }

}
