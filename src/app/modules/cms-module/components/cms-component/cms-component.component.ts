import { CmsFieldComponent } from './../cms-field/cms-field.component';
import { ExpandableBlockComponent } from './../../../common-module/components/expandable-block/expandable-block.component';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter, HostBinding, ViewChildren, QueryList } from '@angular/core';

@Component({
  selector: 'app-cms-component',
  templateUrl: './cms-component.component.html',
  styleUrls: ['./cms-component.component.scss']
})
export class CmsComponentComponent implements OnInit {
  @ViewChild(ExpandableBlockComponent) expandableBlock: ExpandableBlockComponent;
  @ViewChildren(CmsFieldComponent) cmsFields: QueryList<CmsFieldComponent>;

  @HostBinding('class.c-cms-component') true;

  @Output() actionEvent : EventEmitter<Object> = new EventEmitter<Object>();

  @Input() contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  @Input() data: any;
  
  fields: any[];

  get isValid() {
    let valid: boolean = true;
    if(this.cmsFields) {
      let cmsFields: CmsFieldComponent[] = this.cmsFields.toArray();
      if(cmsFields.length) {
        valid = !cmsFields.some( item => !item.isValid );
      }
    }
    return valid;
  }
  
  constructor() { }

  ngOnInit() {
    if(this.data) {
      this.fields = this.data.getFields();    
      this.contextMenuData = [];
      this.contextMenuData.push({action: "removeComponent", label: "SİL", params: {component: this.data}});
    }
  }

  ngAfterViewInit() {
    this.saveComponent();
  }

  public collapse() {
    if(this.expandableBlock) this.expandableBlock.collapse();
  }

  public expand() {
    if(this.expandableBlock) this.expandableBlock.expand();
  }

  saveComponent() {
    if(!this.cmsFields) return;
    let fields: {UniqueName:string, Value:any }[] = [];
    this.cmsFields.forEach( cmsField => {
      fields.push({
        UniqueName: cmsField.name,
        Value: cmsField.value || null
      })
    });
    this.data.setFields(fields);
    this.actionEvent.emit({action: "saveComponent", params: {component: this.data}});
  }

  resetFields() {
    this.cmsFields.forEach( cmsField => cmsField.value=null);
  }

  emitAction(event) {
    if(!event.params) event.params = {};
    event.params.componentId = this.data.instanceId;
    this.actionEvent.emit(event);
  }

}
