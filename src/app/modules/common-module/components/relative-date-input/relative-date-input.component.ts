import { SelectboxComponent } from './../../../base-module/components/selectbox/selectbox.component';
import { Component, OnInit, HostBinding, Input, Output, EventEmitter, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-relative-date-input',
  templateUrl: './relative-date-input.component.html',
  styleUrls: ['./relative-date-input.component.scss']
})
export class RelativeDateInputComponent implements OnInit {
  @ViewChildren(SelectboxComponent) selectboxes: SelectboxComponent[];

  @HostBinding('class.c-relative-date-input') true;

  @Output() changeEvent: EventEmitter<{value: number, date?: string}> = new EventEmitter();

  @Input() date: Date;
  @Input() hasBefore: boolean = true;
  @Input() hasAfter: boolean = true;
  @Input() set value(value: number) {
    if(isNaN(this.unitValue) && this.unitOptions && this.unitOptions[0]) this.unitValue = this.unitOptions[0].value;
    if(isNaN(value) || isNaN(this.unitValue)) {
      this.durationValue = 0;
    }else{
      this.durationValue = Math.abs(value / this.unitValue);
    }

    if(!this.relativeTimeType) {
      if(this.hasBefore && this.hasAfter) {
        this.relativeTimeType = this.durationValue > 0 ? 1 : -1;
      }else{
        this.relativeTimeType = this.hasBefore && !this.hasAfter ? -1 : 1;
      }
    }
  }

  get value(): number {
    let result: number = this.durationValue * this.unitValue;
    if(this.hasBefore) result *= this.relativeTimeType;
    return result;
  }

  relativeTimeTypes: {text: string, value: any}[];
  unitOptions: {text: string, value: any}[];
  relativeTimeType: number;
  unitValue: number;
  durationValue: number;

  constructor(
    private changeDetector: ChangeDetectorRef
  ) {
    this.relativeTimeTypes = [];
    if(this.hasBefore) this.relativeTimeTypes.push({text: "Önce", value: -1});
    if(this.hasAfter) this.relativeTimeTypes.push({text: "Sonra", value: 1});

    this.unitOptions = [];
    // this.unitOptions.push({text: "Dakika", value: 1 });
    this.unitOptions.push({text: "Saat", value: 60 });
    this.unitOptions.push({text: "Gün", value: 60*24 });
    this.unitOptions.push({text: "Hafta", value: 60*24*7 });
    this.unitOptions.push({text: "Ay", value: 60*24*30 });
  }

  ngOnInit() {
    if(isNaN(this.relativeTimeType)) this.relativeTimeType = this.relativeTimeTypes[0].value;
    if(isNaN(this.unitValue)) this.unitValue = this.unitOptions[0].value;
  }

  inputChangeHandler(event, name:string) {
    switch(name) {
      case 'relativeTimeType':
        this.relativeTimeType = event;
      break;
      case 'unitValue':
        this.unitValue = event; 
      break;
      case "durationValue":
        this.durationValue = event;
      break;
    }
    let relativeDate: string;
    if(this.date) relativeDate = moment(this.date).add('minute', this.value).toISOString();
    this.changeEvent.emit({value: this.value, date: relativeDate});
  }

}