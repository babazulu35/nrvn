import { Component, Type, Injector, OnInit, HostBinding, HostListener, Input, Output, EventEmitter, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-multi-select-group',
  templateUrl: './multi-select-group.component.html',
  styleUrls: ['./multi-select-group.component.scss']
})

export class MultiSelectGroupComponent implements OnInit {
  @ViewChild('otherMenu', {read: ViewContainerRef})
  otherMenu: ViewContainerRef;

  @HostBinding('class.c-multi-select-group') true;
  @HostBinding('class.c-multi-select-group--times')
  isTime: boolean;

  @HostBinding('class.c-multi-select-group--wide')
  isWideSize: boolean;

  @HostListener('document:click', ['$event'])
  outsideClickHandler(event) {
      let targetElement = event.target;
      if(this.otherMenuIsOpen && targetElement.offsetParent && this.clickCount  > 0){
        this.otherMenuIsOpen = this.otherMenu.element.nativeElement.contains(targetElement);
      }
      this.clickCount++;
  }

  @Output() changeEvent: EventEmitter<Object> = new EventEmitter();

  @Input() data: Object[];
  @Input() maxVisibleCount: number = 5;
  @Input() otherMenuIsOpen: boolean;
  @Input() isSingleSelect: boolean = false;
  @Input() canToggle: boolean = true;
  @Input() itemSize: number;

  @Input() set size(value) {
    this.isWideSize = value == "wide";
  }

  @Input() set type(value){
    this.isTime = value == "time";
  }

  @Input() set actionType(value) {
    this.isSingleSelect = value == "radio";
    this.canToggle = value != "radio";
  }

  @Input()
  set selectedIndexes(list:Array<number>){
    this.data.map(item => item['selected'] = false);
    list.forEach(value => this.data[value]['selected'] = true);
  }

  @Input()
  set selectedValues(list:Array<string>){
    this.data.map(item => item['selected'] = list.indexOf(item['value']) >= 0 );
  }

  @Input()
  set promisingItems(list:Array<string>){
    this.data.map(item => item['promising'] = list.indexOf(item['value']) >= 0 );
  }

  get visibleItems() {
    if(this.maxVisibleCount < this.data.length){
      return this.data.slice(0, this.maxVisibleCount-1);
    }else{
      return this.data;
    }
  }

  get hiddenItems() {
    if(this.maxVisibleCount < this.data.length){
      return this.data.slice(this.maxVisibleCount-1, this.data.length);
    }else{
      return null;
    }
  }

  get selectedItems() {
    return (this.data) ? this.data.filter( item => item["selected"] === true ) : [];
  }

  get hiddenSelectedItems() {
    return(this.hiddenItems) ? this.hiddenItems.filter( item => item["selected"] === true ) : [];
  }

  clickCount:number = 0;

  constructor() { }

  ngOnInit() {
  }

  toggleItem(item, e) {
    if(item.disabled) return;
    if(this.isSingleSelect) this.selectedItems.map(oldItem => {if(oldItem != item ) oldItem['selected'] = false });
    item.selected = !item.selected;
    this.emitChangeEvent();
  }

  toggleOtherMenu() {
    this.clickCount = 0;
    this.otherMenuIsOpen = !this.otherMenuIsOpen;
  }

  emitChangeEvent() {
    if(this.isSingleSelect){
      this.selectedItems.length ? this.changeEvent.emit(this.selectedItems[0]) : this.changeEvent.emit(null);
    }else{
      this.changeEvent.emit(this.selectedItems);
    }
  }
}
