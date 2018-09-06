import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, HostBinding, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MockService } from '../../../../services/mock.service';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit {
  @ViewChild('input') input: ElementRef;
  @HostBinding('class.c-checkbox') true;

  @HostBinding('class.c-checkbox--disabled')
  @Input() isDisabled: boolean;
  
  @Output() checkedAction : EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() changeEvent : EventEmitter<any> = new EventEmitter();

  @Input() form:FormGroup;
  @Input() name: string;
  @Input() value: string;
  @Input() isChecked: boolean;
  @Input() theme: string = "light";
  @Input() type: string = "circle";
  @Input() size: string = "md";
  @Input() label: string;
 
  @Input() inputType: string = "checkbox"; // checkbox | radio
  
  @Input() set boxType(value:string) {
    this.inputType = value;
  }


  public formControl: FormControl = new FormControl({name: this.name, value:this.value, disabled:this.isDisabled});

  constructor(
    public changeDetector: ChangeDetectorRef
  ) {
    //mockService.fillInputs(this, {});
  }

  ngOnInit() {
    if(this.form && this.name) {
      this.form.addControl(this.name, this.formControl);
    }
  }

  ngAfterViewInit(){ }

  emitCheckEvent(value) {
    this.isChecked = value;
    this.formControl.setValue(this.isChecked);
    this.checkedAction.next(this.isChecked);
    this.changeEvent.emit(this.value != null ? this.value : this.isChecked);
  }
}