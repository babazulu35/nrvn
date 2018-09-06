import { Component, OnInit, HostBinding, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';
declare var Pikaday;

@Component({
  selector: 'app-inline-search-input',
  templateUrl: './inline-search-input.component.html',
  styleUrls: ['./inline-search-input.component.scss']
})
export class InlineSearchInputComponent implements OnInit {
  @HostBinding('class.c-inline-search-input') true;
  @HostBinding('class.c-inline-search-input--focus')
  public isFocused:boolean;

  @HostBinding('class.c-inline-search-input--border')
  @Input() hasBorder: boolean = false;

  @ViewChild('timepicker') timepicker: ElementRef;

  @Output() onInputSave : EventEmitter<String> = new EventEmitter<String>();
  @Output() onInputChange : EventEmitter<String> = new EventEmitter<String>();

  @Input() data: string;
  @Input() placeholder: String;
  @Input() isEditing: boolean = false;
  @Input() isPromising: boolean = false;
  @Input() delay: number = 300;
  @Input() isIconAlignLeft:boolean = false;
  @Input() isDate:boolean = false;
  @Input() pikadayOptions: object = {};
  @Input() iconName: string;

  public inputValue: string;

  picker:any;
  public get pikaday():any { return this.picker };


  constructor(
    private elementRef: ElementRef
  ) {
    const stream = Observable.fromEvent(elementRef.nativeElement, 'input').map(() => this.inputValue)
      .debounceTime(this.delay)
      .distinctUntilChanged();

    stream.subscribe(input => this.onChange(input))
  }

  onFocus() {
    if(this.picker) this.picker.show();
    this.isFocused = true;
  }

  onFocusOut() {
    if(this.picker) this.picker.hide();
    this.isFocused = false;
  }

  ngOnInit() {
    if(this.isDate) this.addPicker();
  }

  ngOnDestroy() {
    this.removePicker();
  }

  ngOnChanges(changes:any){
    if(changes["data"]) {
      this.inputValue = this.data;
      if(this.picker && this.inputValue == "") this.picker.gotoToday();
    }

    if(changes["isDate"]) {
      this.isDate ? this.addPicker() : this.removePicker();
    }
  }

  onSave(value){
    this.onInputSave.emit(value);
  }

  onChange(val){
    if(this.data == val) return;
    this.data = val;
    this.onInputChange.emit(this.data);
  }

  addPicker() {
    if(this.picker) return;
    let self = this;
    let format = this.pikadayOptions['format'] || 'DD.MM.YYYY, dddd HH:mm';
    let defaults = {
      field: this.timepicker.nativeElement,
      showTime: true,
      showMinutes: true,
      showSeconds: false,
      use24hour: true,
      incrementHourBy: 1,
      incrementMinuteBy: 5,
      autoClose: true,
      format: format,
      onSelect: function(date) {
        self.data = moment(date).format(format);
      },
      i18n: {
        previousMonth : 'Previous Month',
        nextMonth     : 'Next Month',
        months        : moment.localeData()["_months"],
        weekdays      : moment.localeData()["_weekdays"],
        weekdaysShort : moment.localeData()["_weekdaysShort"]
      }
    }
    Object.assign(defaults, this.pikadayOptions)
    this.picker = new Pikaday(defaults);
  }

  removePicker() {
    if(!this.picker) return;
    this.picker.destroy();
    this.picker = null;
  }

}
