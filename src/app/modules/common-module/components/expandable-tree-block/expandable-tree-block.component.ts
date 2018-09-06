import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-expandable-tree-block',
  templateUrl: './expandable-tree-block.component.html',
  styleUrls: ['./expandable-tree-block.component.scss']
})
export class ExpandableTreeBlockComponent implements OnInit {
  @HostBinding('class.c-expandable-tree-block') true;

  @HostBinding('class.c-expandable-tree-block--expanded')
  @Input() isExpanded: boolean = true;
  
  @Input() isInactive: boolean;

  @Output() actionEvent : EventEmitter<Object> = new EventEmitter<Object>();

  @Input() title: string;
  @Input() info: string;
  @Input() canBeAddedNewItem: boolean = true;
  @Input() contextMenu: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  @Input() isDraggable: boolean;
  @Input() mainItem;

  
  @Input() items: {
    title: string,
    icon?: string,
    info?: string,
    infoType?: string,
    isDraggable?: boolean,
    isExpanded?:boolean,
    canBeAddedNewItem?: boolean,    
    contextMenu?: {action: string, label: string, icon?: string, params?: any}[]
    items?: {
      title: string,
      icon?: string,
      info?: string,
      infoType?: string,
      isDraggable?: boolean,
      contextMenu?: {action: string, label: string, icon?: string, params?: any}[]
    }[];
  }[];

  constructor(
    public tetherService: TetherDialog
  ) { }

  ngOnInit() {

  }

  public collapse() {
    this.isExpanded = false;
  }

  public expand() {
    this.isExpanded = true;
  }

  toggleExpand(event, item=null) {
    item ? item.isExpanded = !item.isExpanded : this.isExpanded = !this.isExpanded;
  }

  openContextMenu(event, data) {
    if(!this.contextMenu || this.contextMenu.length == 0) return;

    this.tetherService.context({
			title: "İŞLEMLER",
			data: data
		}, {
      target: event.target
    }).then( result => this.actionEvent.emit(result)).catch( reason => {});

  }

}
