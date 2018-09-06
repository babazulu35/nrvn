import { CmsFieldCardComponent } from './../cms-field-card/cms-field-card.component';
import { ExpandableBlockComponent } from './../../../common-module/components/expandable-block/expandable-block.component';
import { Component, OnInit, HostBinding, ViewChild, ViewChildren, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cms-component-settings-block',
  templateUrl: './cms-component-settings-block.component.html',
  styleUrls: ['./cms-component-settings-block.component.scss']
})
export class CmsComponentSettingsBlockComponent implements OnInit {
  @ViewChild(ExpandableBlockComponent) expandableBlock: ExpandableBlockComponent;
  @ViewChildren(CmsFieldCardComponent) cmsFieldCard: CmsFieldCardComponent[];
  
  @HostBinding('class.c-cms-component-settings-block') true;

  @Output() actionEvent : EventEmitter<Object> = new EventEmitter<Object>();

  @Input() contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  @Input() set data(value: any) {
    this.componentData = value;
    if(this.componentData) {
      this.fields = this.componentData.getFields();
      this.contextMenuData = [];
      this.contextMenuData.push({action: "editComponent", label: "Düzenle", params: {component: this.componentData}});
      this.contextMenuData.push({action: "removeComponent", label: "Sil", params: {component: this.componentData}});
    }
  };
  
  componentData: any;
  fields: any[];
  cmsFields: any[];

  constructor() { }

  ngOnInit() {
    
  }

  collapse() {
    if(this.expandableBlock) this.expandableBlock.collapse();
  }

  expand() {
    if(this.expandableBlock) this.expandableBlock.expand();
  }

  addNewField() {
    this.actionEvent.emit({
      action: "addNewField",
      params: {component: this.componentData}
    })
  }

  saveComponent() {
    let fields: {UniqueName:string, Value:any }[] = [];
    
    //this.actionEvent.emit({action: "saveComponent", params: {component: this.componentData}});
  }

  emitAction(event) {
    if(!event.params) event.params = {};
    if(!event.params.component) event.params.component = this.componentData;
    this.actionEvent.emit(event);
  }

}
