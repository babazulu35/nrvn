import { SimpleTreeviewNodeComponent } from './simple-tree-view-node.component';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, HostBinding, Input, ViewChildren } from '@angular/core';

@Component({
  selector: 'simple-treeview-children',
  template: `
    <simple-treeview-node *ngFor="let item of data"
      [data]="item"></simple-treeview-node>
  `
})
export class SimpleTreeviewChildrenComponent implements OnInit {
  @ViewChildren(SimpleTreeviewNodeComponent) nodes: SimpleTreeviewNodeComponent[];
  
  @HostBinding('class.c-simple-treeview__children') true;
  
  @Input() node: SimpleTreeviewNodeComponent;
  @Input() index: number;
  @Input() data: {key: string, title: string, level: number, isSelected?:boolean, extraFieldType?: string, extraFieldValue?: any, params?:any}[];

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    
  }

}
