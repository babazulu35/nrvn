import { isEqual } from 'lodash';
import { GenericListItem } from './../../../../models/generic-list-item';
import { Component, OnInit, HostBinding, HostListener, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-listbox',
  templateUrl: './listbox.component.html',
  styleUrls: ['./listbox.component.scss']
})
export class ListboxComponent implements OnInit {
  @HostBinding('class.c-listbox') true;

  @HostListener('document:keydown', ['$event'])
  keydownHandler(event: KeyboardEvent) {
    switch(event.keyCode) {
      case 12:
      case 91:
      case 17:
        if(!this.multiSelectIsActive) this.multiSelectIsActive = true;
      break;
    }
  }

  @HostListener('document:keyup', ['$event'])
  keyupHandler(event: KeyboardEvent) {
    switch(event.keyCode) {
      case 12:
      case 91:
      case 17:
        if(this.multiSelectIsActive) this.multiSelectIsActive = false;
      break;
    }
  }
  
  @Input() list: GenericListItem[];
  @Input() multiSelectEnabled: boolean = true;
  @Input() toggleSelectEnabled: boolean = true;
  @Input() emptyText: string;
  @HostBinding('class.c-listbox--has-footer')
  @Input() hasSelectAll: boolean = true;

  @Input() set selectedIds(ids: any[]) { this.selectItemByIds(ids) };
  @Input() set selectedIndexes(indexes: number[]) { this.selectItemByIndexes(indexes) };
  @Input() set selectedValues(values: any[]) { this.selectItemByValues(values) };

  @Output() selectEvent: EventEmitter<GenericListItem> = new EventEmitter();
  @Output() selectListEvent: EventEmitter<GenericListItem[]> = new EventEmitter();
  
  selectedItem: GenericListItem;
  selectedItems: GenericListItem[];

  private multiSelectIsActive: boolean;

  constructor() { }

  ngOnInit() {
  }

  getItemById(id:any):GenericListItem {
    if(!this.list) return null;
    let existItem:GenericListItem;
    existItem = this.list.find( item => item.Id == id);
    return existItem;
  }

  getItemByValue(value: any):GenericListItem {
    if(!this.list) return null;
    let existItem:GenericListItem;
    existItem = this.list.find( item => isEqual(item.Value, value));
    return existItem;
  }

  getItemByIndex(index: number):GenericListItem {
    if(!this.list) return null;
    let existItem:GenericListItem;
    if(index >= 0 && index < this.list.length) existItem = this.list[index];
    return existItem;
  }

  selectItem(item: GenericListItem) {
    if(!this.list) return;
    if(item) {
      if(item.Disabled) return;
      if(this.multiSelectEnabled && this.multiSelectIsActive) {
        if(item) item.Selected = this.toggleSelectEnabled ? !item.Selected : true;
      }else{
        if(item) this.list.map( listItem => listItem.Selected = listItem == item ? (this.toggleSelectEnabled ? !item.Selected : true) : false );
      }
    }else{
      this.list.map( listItem => listItem.Selected = false);
    }
    this.selectedItems = this.list.filter( listItem => { return listItem.Selected });
    this.selectedItem = item.Selected ? item : null;
    this.selectEvent.emit(this.selectedItem);
    this.selectListEvent.emit(this.selectedItems);
  }

  selectItemById(id: any) {
    this.selectItem(this.getItemById(id));
  }

  selectItemByIds(ids: any[]) {
    if(ids && ids.length) {
      ids.forEach( id => this.selectItemById(id));
    }
  }

  selectItemByValue(value: any) {
    this.selectItem(this.getItemByValue(value));
  }

  selectItemByValues(values: any[]) {
    if(values && values.length) {
      values.forEach( value => this.selectItemByValue(value));
    }
  }

  selectItemByIndex(index: number) {
    this.selectItem(this.getItemByIndex(index));
  }

  selectItemByIndexes(indexes: number[]) {
    if(indexes && indexes.length) {
      indexes.forEach( index => this.selectItemByIndex(index));
    }
  }

  selectAll() {
    if(!this.list) return;
    this.list.map( listItem => listItem.Selected = !listItem.Disabled);
    this.selectedItems = this.list.filter( listItem => { return listItem.Selected });
    this.selectListEvent.emit(this.selectedItems);
  }

  addItem(item, index?:number):GenericListItem {
    if(!this.list || !item) return;
    if(isNaN(index)) index = this.list.length-1;
    this.list.splice(index, 0, item);
    return item;
  }

  removeItem(item):GenericListItem {
    if(!this.list || !item) return;
    let index = this.list.indexOf(item);
    if(index >= 0 && index < this.list.length) this.list.splice(index, 1);
    return item;
  }

  itemClickHandler(event, item:GenericListItem) {
    if(!item.Disabled) this.selectItem(item);
  }

}
