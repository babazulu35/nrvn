import { FormControl, FormGroup } from '@angular/forms';
import { TextInputComponent } from './../text-input/text-input.component';
import { Component, OnInit, HostBinding, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-time-input',
  templateUrl: './time-input.component.html',
  styleUrls: ['./time-input.component.scss']
})
export class TimeInputComponent implements OnInit {
  @ViewChild('hour') hourInput: TextInputComponent;
  @ViewChild('minute') minuteInput: TextInputComponent;

  @HostBinding('class.c-time-input') true;

  @HostBinding('class.c-time-input--error')
  get hasError():boolean { 
    return  this.hourInput && this.hourInput.formControl && !this.hourInput.formControl.valid && this.hourInput.required && (this.hourInput.formControl.touched || this.hourInput.formControl.dirty) && 
            this.minuteInput && this.minuteInput.formControl && !this.minuteInput.formControl.valid && this.minuteInput.required && (this.minuteInput.formControl.touched || this.minuteInput.formControl.dirty) 
  }

  @HostBinding('class.c-time-input--disabled')
  @Input() isDisabled: boolean;

  @HostBinding('class.c-time-input--underline')
  isUnderline: boolean = false;

  @HostBinding('class.c-time-input--no-border')
  isNoBorder: boolean = false;

  @HostBinding('class.c-time-input--focused')
  isFocused: boolean;

  @Output() changeEvent:EventEmitter<any> = new EventEmitter();
  @Output() typeEvent:EventEmitter<any> = new EventEmitter();

  @Input() form:FormGroup;
  @Input() name: string;
  @Input() required:boolean;

  @Input() set theme(value: string) {
    this.isUnderline = value == 'underline';
    this.isNoBorder = value == "no-border";
  }

  @Input() set disabled(value: boolean) {
    this.isDisabled = value;
  }

  @Input() set value(value: string) {
    if(value && value.split) {
      let parts: string[] = value.split(':');
      this.setTime(parts[0], parts[1]);
    }
  };

  get value():string { return this.formattedHour + ":" + this.formattedMinute };

  get isValid() {
    return this.hourInput && this.minuteInput && this.hourInput.isValid && this.minuteInput.isValid;
  }

  hour: number;
  minute: number;
  formattedHour: string;
  formattedMinute: string;
  
  public formControl: FormControl = new FormControl({value: this.value, disabled: this.isDisabled});

  constructor(
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if(this.form && this.name) {
      this.form.addControl(this.name, this.formControl);
      this.changeDetector.detectChanges();
      this.formControl.statusChanges.subscribe( status => {
        this.isDisabled = status == "DISABLED";
      });
    }
  }

  ngOnChanges(changes) {
    if(changes.isDisabled && this.formControl) {
      changes.isDisabled.currentValue ? this.formControl.disable() : this.formControl.enable();
      if(!this.formControl.disabled) this.hourInput.focus();
    }
  }

  ngOnDestroy() {
    if(this.formControl && this.form) {
      this.form.removeControl(this.name);
      this.formControl = null;
    }
  }

  typeEventHandler(event, name: string) {
    if(isNaN(event)) event = 0;
    switch(name) {
      case "hour":
        this.setTime(event, null);
      break;
      case "minute":
        this.setTime(null, event);
      break;
    }
    this.typeEvent.emit(this.value);
  }

  changeEventHandler(event, name: string) {
    if(isNaN(event)) event = 0;
    switch(name) {
      case "hour":
        this.setTime(event, null);
      break;
      case "minute":
        this.setTime(null, event);
      break;
    }
    this.changeEvent.emit(this.value);
  }

  focusEventHandler(event) {
    this.isFocused = event.action == "on";
    this.changeDetector.detectChanges();
  }

  private setTime(hour: any = null, minute: any = null) {
    hour = parseInt(hour);
    minute = parseInt(minute);
    if(!isNaN(hour)){
      this.hour = parseInt(hour);
      if(this.hour < 0) this.hour = 0;
      if(this.hour > 23) this.hour = 23;
      this.formattedHour = !isNaN(this.hour) ? (this.hour < 10 ? "0"+this.hour : this.hour).toString() : "";
      this.hourInput.value = this.formattedHour;
    }

    if(!isNaN(minute)){
      this.minute = parseInt(minute);
      if(this.minute < 0) this.minute = 0;
      if(this.minute > 59) this.minute = 59;
      this.formattedMinute = !isNaN(this.minute) ? (this.minute < 10 ? "0"+this.minute : this.minute).toString() : "";
      this.minuteInput.value = this.formattedMinute;
    }
    this.changeDetector.detectChanges();
  }
}
