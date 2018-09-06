
import { ShoppingCartService } from './../../../../services/shopping-cart.service';
import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { RefreshStateService } from './../../../../services/refresh-state/refresh-state.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-collect-data',
  templateUrl: './collect-data.component.html',
  styleUrls: ['./collect-data.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectDataComponent implements OnInit {
  public collectData;
  collectDataForm = [];
  collection:any;
  public collectForm: FormGroup = new FormGroup({});
  public get isValid():boolean {
    return this.collectForm.valid;
  }; 
  @Input()  set collectionData(collectionData: Object) {
	this.collection= collectionData;
  }
  @Output() resultEvent:EventEmitter<any> = new EventEmitter();
  constructor(private shoppingCartService: ShoppingCartService, private changeDetector: ChangeDetectorRef,private refreshStateService:RefreshStateService) { }

  ngOnInit() {
    
    this.refreshStateService.refreshStateHandler.subscribe(result => {
      if(result) {
        this.resultEvent.emit({
          action:'refreshState',
          data:result
        })
      }
    })

  }

  valueChangeHandler(event,name,metaId,pattern?:any){
    this.collectDataForm.push({
        "MetadataId": metaId,
        "Name":name,
        "Value": event
    
    })


//this.collectDataForm.splice(this.collectDataForm.map(result => {return result['Name']}).findIndex(result => result == name),1); 

this.changeDetector.detectChanges();
let valid:boolean;
if(this.collectDataForm.length == 0)
{
   valid = false;
}
else {
  valid = this.isValid;
}
this.resultEvent.emit({action:'formData',data:this.collectDataForm,isValid:valid})
}

isFieldValid(field: string) {
  console.log("Field",this.collectForm.controls[field]);
  //return !this.collectForm.get(field).valid && this.collectForm.get(field).touched;
}

displayFieldCss(field: string) {
  return {
    'has-error': this.isFieldValid(field),
    'has-feedback': this.isFieldValid(field)
  };
}


}
