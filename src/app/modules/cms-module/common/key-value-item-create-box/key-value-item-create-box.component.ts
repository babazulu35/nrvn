import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { Component, OnInit, ViewChild, HostBinding, HostListener, Input, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-key-value-item-create-box',
  templateUrl: './key-value-item-create-box.component.html',
  styleUrls: ['./key-value-item-create-box.component.scss']
})
export class KeyValueItemCreateBoxComponent implements OnInit {
  @ViewChild(TextInputComponent) firstTextInput: TextInputComponent;
  
  @HostBinding('class.oc-key-value-item-create-box') true;

  @HostListener('keyup.enter') enterHandler(){
    if(this.isValid) this.submitClickHandler(null);
  };

  @Input() title: string;
  @Input() keyValueItem: {
    key: string,
    value?: any,
    label?: string
  };
  @Input() isEditMode: boolean = false;

  public validation: {
    keyValueItem: { isValid: any, message: string }
  } = {
    keyValueItem: {
      message: "Bütün alanlar zorunludur",
      isValid(): boolean {
        return this.keyValueItem && this.keyValueItem.label && this.keyValueItem.key && this.keyValueItem.value
      }
    }
  };

  public get isValid():boolean {
    if( this.validation
      && this.validation.keyValueItem.isValid.call(this)
      ){
      return true;
    }else{
      return false
    }
  };

  constructor(
    public tetherService: TetherDialog,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isEditMode = this.keyValueItem != null;
    
    if(this.isEditMode) {
      if(!this.title) this.title = "Değer Düzenle";
    }else{
      if(!this.title) this.title = "Değer Ekle";
      this.keyValueItem = {
        key: null,
        value: null,
        label: null
      }
    }

    let self = this;
    setTimeout(function() {
      if(self.firstTextInput) self.firstTextInput.focus();
    }, 150);
  }

  inputChangeHandler(event:any, name:string, target?:any) {
    switch(name){
      default: 
        target ? target[name] = event : this.keyValueItem[name] = event;
    }
  }

  submitClickHandler(event){
    if(this.isValid) this.tetherService.close(this.keyValueItem);
  }

}