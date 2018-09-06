import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, ViewChild, HostBinding, Input, HostListener, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-cms-component-create-box',
  templateUrl: './cms-component-create-box.component.html',
  styleUrls: ['./cms-component-create-box.component.scss']
})
export class CmsComponentCreateBoxComponent implements OnInit {
  @ViewChild(TextInputComponent) firstTextInput: TextInputComponent;

  @HostBinding('class.oc-cms-component-create-box') true;

  @HostListener('keyup.enter') enterHandler(){
    if(this.isValid) this.submitClickHandler(null);
  };

  @Input() title: string;
  @Input() component: {
    Name: string,
    UniqueName: string,
    AllowMultiple?: boolean
  };
  @Input() isEditMode: boolean = false;

  componentForm: FormGroup = new FormGroup({});

  public validation: {
		ComponentForm: { isValid: any, message: string }
	} = {
		ComponentForm: {
			message: "Bütün alanlar zorunludur",
			isValid(): boolean {
				return this.componentForm && this.componentForm.valid
			}
		}
	};

	public get isValid():boolean {
		if( this.validation
			&& this.validation.ComponentForm.isValid.call(this)
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
    this.isEditMode = this.component != null;
    if(this.isEditMode) {
      if(!this.title) this.title = "Bileşen Düzenle";
    }else{
      if(!this.title) this.title = "Bileşen Ekle";
      this.component = {
        Name: null,
        UniqueName: null,
        AllowMultiple: true
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
        target ? target[name] = event : this.component[name] = event;
    }
  }

  submitClickHandler(event){
    if(this.isValid) this.tetherService.close(this.component);
  }

}
