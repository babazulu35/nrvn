import { Component, OnInit,Input,EventEmitter,Output,ViewChild,ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-number-picker',
  templateUrl: './number-picker.component.html',
  styleUrls: ['./number-picker.component.css']
})
export class NumberPickerComponent implements OnInit {
  @ViewChild('input') input: ElementRef;
  
  @Input() min:number;
  @Input() max:number;
  @Input() currentQuantity:number;
  @Input() inputDisabled: boolean;
  @Input() label;
  disableInc:boolean = false;
  disableDec:boolean = false;

  @Output() actionEvent = new EventEmitter<number>();
  
  numberStep: FormControl;
  value:number;
  constructor() { }

  ngOnInit() {
   
    this.numberStep = new FormControl({value:this.min, disabled: this.inputDisabled});
    if(this.inputDisabled == null) {
      this.inputDisabled = false;
    }
    if(this.min == null) {
      this.min = 0
    }
    this.currentQuantity == undefined ? this.value = this.min : this.value = this.currentQuantity;

    this.numberStep.valueChanges.map( items => {return items}).debounceTime(100).distinctUntilChanged().subscribe(result => 
      {
       
        result  == this.min ? this.disableDec = true : this.disableDec = false;
        result  == this.max ? this.disableInc = true : this.disableInc = false;

        if(result > this.max)
        {
          this.value = this.max;
          result = this.max;  
          this.numberStep.setValue(result);
             
        }
        else if( result == "" || result == null)
        {
          this.value = this.min
          result = this.min;
          this.numberStep.setValue(result);      
        }
        this.actionEvent.emit(result);
      });
  }

  ngAfterViewInit() {
  }

  increase() {
    var current = this.numberStep.value;  
    if(current < this.max)
    {
      current++;
      this.value = current;
      this.numberStep.setValue(current);      
    }
  }

  decrease() {
    var current = this.numberStep.value;
    if(current > this.min) {
      current--;
      this.value = current;
      this.value == this.min ? this.disableDec = true : this.disableDec = false; 
      this.numberStep.setValue(current);
    }
  }
  getValue(): number {
    return this.numberStep.value;
  }
}
