import { ListItemDirective } from './../../../../directives/list-item.directive';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { Component, OnInit, HostBinding, EventEmitter, Input, Output, HostListener, ViewChild, ViewChildren, QueryList, ElementRef, ChangeDetectorRef } from '@angular/core';
import { setTimeout } from 'timers';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent implements OnInit {
  @ViewChild(TextInputComponent) textInput: TextInputComponent;
  @ViewChildren('listItemElement') listItems: QueryList<ElementRef>;
  @ViewChild('listElement') listElement: ElementRef;
  
  @HostBinding('class.c-autocomplete') true;

  @HostListener('focusout', ['$event']) focusOutHandler(event) {
    if(this.closeListWhenFocusOut) {
      let self = this;
      setTimeout(function(){
        self.closeList();
      }, 30);
    }
  }

  @HostListener('keydown', ['$event']) keyDownHandler(event) {
    switch(event.keyCode) {
      case 9: //TAB
        event.preventDefault();
        if(this.listIsOpen) this.setActive(0);
      break;
      case 13: //Enter
        if(this.activeIndex >= 0) {
          if(this.items && this.items[this.activeIndex]) this.selectItem(this.items[this.activeIndex]);
        }else{
          if(this.listIsOpen) this.setActive(0);
        }
      break;
      case 27: //ESC
        this.closeList();
      break;
      //case 37: //Left
      case 38: //Top
        event.preventDefault();
        this.activatePrev();
      break;
      //case 39: //Right
      case 40: //Down
        event.preventDefault();
        this.activateNext();
      break;
    }
  }

  @Output() selectEvent: EventEmitter<any> = new EventEmitter();

  @Input() labelKey: string = "label";
  @Input() valueKey: string = "value";
  @Input() searchKeys: string[] = ["label", "value"];
  @Input() secondaryLabelKey: string;
  @Input() secondaryLabelPrefix: string = "";
  @Input() secondaryLabelSuffix: string = "";
  @Input() placeholder: string;
  @Input() searchText: string;
  @Input() typeDebounceTime: number;
  @Input() icon: string;
  @Input() list: {label: string, value: any, isActive?: boolean, secondaryLabel?: string, params?: {}}[];
  @Input() featuredList: {label: string, value: any, isActive?: boolean, secondaryLabel?: string, params?: {}}[];
  @Input() closeListWhenFocusOut: boolean = true;

  @Input() set dataSource(data: any[]) {
    this.rawDataSource = data;
    this.setList();
  };

  @Input() set value(value: any) {
    this.rawValue = value;
    this.setList();
  }

  activeIndex: number = -1;
  listIsOpen: boolean;

  private rawDataSource: any;
  private rawValue: any;
  private items: {label: string, value: any, isActive?: boolean, secondaryLabel?: string, params?: {}}[];
  private selectedItem: {label: string, value: any, isActive?: boolean, secondaryLabel?: string, params?: {}};

  constructor(
    private element: ElementRef,
    public changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if(this.rawValue) this.selectItemByValue(this.rawValue, false);
  }

  selectItem(item, forceEmit: boolean = true) {
    this.selectedItem = item;
    this.closeList();
    if(forceEmit && !this.changeDetector["destroyed"]) this.selectEvent.emit(this.selectedItem);
  }

  selectItemByValue(value: any, forceEmit: boolean = true) {
    let existItem = this.rawDataSource.find( item => item[this.valueKey] == value );
    this.selectItem({
      label: existItem[this.labelKey],
      value: value,
      secondaryLabel: this.secondaryLabelKey && existItem[this.secondaryLabelKey] ? this.secondaryLabelPrefix+existItem[this.secondaryLabelKey]+this.secondaryLabelSuffix : null,
      params: {rawData: existItem}
    }, forceEmit);
  }

  itemClickHandler(event, item) {
    //let existItem = this.items.find( i => i.value === item.value );
    this.selectItem(item);
  }

  inputTypeEventHandler(event) {
    if(this.listIsOpen && this.textInput.focused){
      this.searchText = event;
      this.setList();
    }
  }
  inputFocusHandler(event) {
    switch(event.action) {
      case "on":
        this.openList();
      break;
      case "out":
        
      break;
    }
  }

  openList() {
    this.listIsOpen = true;
    this.searchText = "";
    this.setList();
    this.setActive(0);
  }

  closeList() {
    this.listIsOpen = false;    
    if(this.selectedItem) {
      this.searchText = this.selectedItem.label;
      this.rawValue = this.selectedItem.value;
    }
  }

  setActive(index?: number) {
    if(this.items[this.activeIndex]) this.items[this.activeIndex].isActive = false;

    if(index === null){
      index = null;
    }else{
      if(index > this.items.length - 1 ) index = this.items.length - 1;
      if(index < 0 ) index = 0;
    }
    
    this.activeIndex = index;
    
    if(!isNaN(this.activeIndex) && this.items[this.activeIndex]) {
      this.items[this.activeIndex].isActive = true;
    }

    if(this.items[this.activeIndex]) {
      let element:ElementRef = this.listItems.toArray()[this.activeIndex - this.featuredList.length];
      if(element) this.listElement.nativeElement.scrollTop = element.nativeElement.offsetTop - this.listElement.nativeElement.offsetTop;
    }
  }

  activateNext() {
    this.setActive(this.activeIndex+1);
  }

  activatePrev() {
    this.setActive(this.activeIndex-1);
  }


  private setList(){
    if(this.rawDataSource && this.listIsOpen) {
      this.list = [];
      this.items = [];
      this.featuredList = [];
      let value: any;
      let listItem: {label: string, value: any, isActive?: boolean, secondaryLabel?: string, params?: {}};
      this.rawDataSource.forEach( item => {
        value = item[this.valueKey];
        listItem = {
          label: item[this.labelKey],
          value: value,
          secondaryLabel: this.secondaryLabelKey && item[this.secondaryLabelKey] ? this.secondaryLabelPrefix+item[this.secondaryLabelKey]+this.secondaryLabelSuffix : null,
          params: {rawData: item}
        };
        if(this.searchKeys && this.searchKeys.length) {
          listItem.params["searchText"] = "";
          this.searchKeys.forEach( key => listItem.params["searchText"] += this.normalizeSearch( item[key].toString()) );
        }
        if(this.rawValue && this.rawValue == value) {
          this.featuredList.push(listItem);
        }else{
          if(this.searchText && this.searchText.length > 0) {
            if(listItem.params["searchText"] && listItem.params["searchText"].indexOf(this.normalizeSearch(this.searchText)) > -1) {
              this.list.push(listItem);
            }
          }else{
            this.list.push(listItem);
          }
        }
      });
      this.items = this.featuredList ? this.featuredList.concat(this.list) : this.list;
    }
  }

  private normalizeSearch(text:string) {
    //todo convert turkish chracter
    let formattedText = "";
    formattedText += text.toLocaleLowerCase();
    return formattedText;
  }
}
