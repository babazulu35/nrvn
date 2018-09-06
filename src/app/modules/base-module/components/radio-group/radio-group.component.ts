import { FormGroup, FormControl } from '@angular/forms';
import { CheckboxComponent } from './../checkbox/checkbox.component';
import { Component, OnInit, ContentChild, ContentChildren, Input, Output, EventEmitter, HostBinding, QueryList } from '@angular/core';

@Component({
  selector: 'app-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrls: ['./radio-group.component.scss']
})
export class RadioGroupComponent implements OnInit {
  @ContentChildren(CheckboxComponent) items:QueryList<CheckboxComponent>;

  @HostBinding('class.c-radio-group') true;

  @HostBinding('class.c-radio-group--disabled')
  @Input() isDisabled: boolean;

  @Output() changeEvent: EventEmitter<any> = new EventEmitter();

  @Input() form: FormGroup;
  @Input() name: string;

  @Input() 
  set value(value: string){
      if(this.checkedValue == value) return;
      this.checkedValue = value;
      
      if(!this.items || this.items.length == 0) return;
      this.items.map( item => {
        item.isChecked = item.value == this.checkedValue;
      });
      this.changeEvent.emit(this.checkedValue);
  };
  get value():string { return this.checkedValue };


  public formControl: FormControl = new FormControl({name: this.name, value:this.value, disabled:this.isDisabled});

  checkedValue: string;
  
  
  constructor() { }

  ngOnInit() {
    if(this.form && this.name) {
      this.form.addControl(this.name, this.formControl);
    }
  }

  ngAfterContentInit(){
    this.items.map( item => this.setItem(item));
    this.items.changes.subscribe( items => this.setItem(items.last));
  }

  setItem(item: CheckboxComponent) {
    item.inputType = "radio";
    item.name = this.name;
    item.isChecked = this.checkedValue == item.value;
    item.changeEvent.subscribe( value => {
      this.value = value;
    });
    item.changeDetector.detectChanges();
  }

}
