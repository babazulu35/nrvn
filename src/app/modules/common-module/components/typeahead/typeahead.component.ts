import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { Component, OnInit, HostBinding, HostListener, Input, Output, EventEmitter, ElementRef, Renderer, ViewChild, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss']
})
export class TypeaheadComponent implements OnInit {
  
  static readonly STATE_DEFAULT: number = 0;
  static readonly STATE_USER_FOCUSED: number = 1;
  static readonly STATE_USER_TYPING: number = 2;
  static readonly STATE_USER_TYPE_END: number = 3;
  static readonly STATE_SEARCHING: number = 4;
  static readonly STATE_SEARCH_END: number = 5;

  @ViewChild(TextInputComponent) textInput: TextInputComponent;

  @ViewChild('searchInput') searchInput:ElementRef;
  @ViewChild('extraField') extraField: ElementRef;

  public searchControl: FormControl;

  @HostBinding('class.c-typeahead') true;
  @HostBinding('style.height') get height() { return this.searchValue && this.searchValue.length > 0 ? "100%" : "auto"};

  @HostListener('document:keydown', ['$event'])
  keyupHandler(event) {
      this.onKeyUp(event);
  }

  @Output() searchInputChangeEvent: EventEmitter<any> = new EventEmitter();
  @Output() searchEvent: EventEmitter<any> = new EventEmitter();
  @Output() resultEvent: EventEmitter<any> = new EventEmitter();
  @Output() dismissEvent: EventEmitter<any> = new EventEmitter();
  @Output() actionEvent: EventEmitter<Object> = new EventEmitter();

  @Input() searchValue: string;
  @Input() presets: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?: any}[] }[]>;
  @Input() searchResults: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?: any}[] }[]>;
  @Input() searchPlaceholder: string;
  @Input() searchIconName: string = "search";
  @Input() feedback: {title: string, description: string, action?: {action: string, label: string, params?: {}}, icon?:{type: string, name: string} };
  @Input() debounceTime: number = 500;
  @Input() isPromising: boolean = false;
  @Input() 
  public set state(value)
  {
    this.stateValue = value;
    this.isPromising = value == TypeaheadComponent.STATE_SEARCHING;
  }

  public set searchData(data: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?: any}[] }[]>) {
    if(this.searchResults == data) return;
    this.searchResults = data;
    this.setItems();
  }

  public set presetsData(data:Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?: any}[] }[]>) {
    if(this.presets == data) return;
    this.presets = data;
    this.setItems();
  }

  public set searchPlaceholderData(value:string) {
    this.searchPlaceholder = value;
  }

  items: Object[];
  selectedItem: {id: any, title: string, icon?: string, description?:string, params?: any};
  stateValue:number = TypeaheadComponent.STATE_DEFAULT;

  public results: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?: any}[] }[]> = this.presets;
  
  public hasResult:boolean = false;
  
  get hasContent():boolean {
    return this.extraField && this.extraField.nativeElement.children && this.extraField.nativeElement.children.length > 0;
  }

  get hasSearchValue(): boolean {
    return this.searchValue ? this.searchValue.length > 0 : false;
  }

  constructor( 
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef 
  ) { }

  ngOnInit() {
    this.textInput.focus();
    if(this.feedback && !this.feedback.icon) this.feedback.icon = {type: "svg", name: "no-data"};
  }

  reset() {
    this.searchValue = "";
    this.results = null;
  }

  typeEventHandler($event) {
    this.searchValue = $event;
    if($event && $event.length > 0) {
      this.state = TypeaheadComponent.STATE_SEARCHING;
    }else{
      this.setItems();
      this.state = TypeaheadComponent.STATE_DEFAULT;
    }
    this.searchInputChangeEvent.emit($event);
    this.searchEvent.emit($event);
  }

  changeEventHandler($event) {
    if(!this.items || !this.items.length) return;
    this.searchValue = $event;
    this.state = TypeaheadComponent.STATE_USER_TYPE_END;
  }

  dismissEventHandler($event) {
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['searchResults'] || changes['presets']) {
      this.setItems();
    }
  }

  public selectItem(item) {
    if(this.selectedItem) this.selectedItem['selected'] = undefined;
    this.selectedItem = item;
    if(this.selectedItem) this.selectedItem['selected'] = true;
    this.actionEvent.emit({action: "selectItem", params: {selectedItem: this.selectedItem}});
  }

  onFocus() {
    this.selectItem(null);
    this.state = TypeaheadComponent.STATE_USER_FOCUSED;
  }

  onFocusOut() {
    this.state = TypeaheadComponent.STATE_DEFAULT;
  }

  resultClick(item, $event) {
    this.selectItem(item);
    this.sendResult();
  }

  onKeyUp($event:KeyboardEvent) {
    switch($event.keyCode) {
      case 9: //TAB
        if(!this.selectedItem && this.items && this.items.length > 0) this.selectItem(this.items[0]);
      break;
      case 13: //Enter
        if(this.textInput.focused) return;
        if(this.selectedItem) this.sendResult();
      break;
      case 27: //ESC
        if(this.selectedItem) {
          this.textInput.focus();
          this.searchValue = "";
          this.selectItem(null);
          this.changeDetector.detectChanges();
        }else {
          this.dismissEvent.emit(this.selectedItem);
        }
      break;
      //case 37: //Left
      case 38: //Top
        $event.preventDefault();
        if(!this.textInput.focused) this.selectPrev();
      break;
      //case 39: //Right
      case 40: //Down
        $event.preventDefault();
        if(!this.textInput.focused) this.selectNext();
      break;
    }
  }

  sendResult() {
    if(this.selectedItem) this.resultEvent.emit(this.selectedItem);
  }

  setItems() {
    this.results = ( !this.searchResults || !this.searchValue || !this.searchValue.length ) ? this.presets : this.searchResults;
    
    this.items = new Array();
    if(this.results && this.results instanceof Observable && this.results["value"]) {
      this.results['value'].forEach(group => group['list'].forEach(item => {
        item.selected = undefined;
        this.items.push(item)
      }));
    }

    this.state = (this.searchValue && this.searchValue.length) ? TypeaheadComponent.STATE_SEARCH_END : TypeaheadComponent.STATE_DEFAULT;
    
    if(this.searchValue && this.searchValue.length > 0) {
      this.hasResult = this.searchResults && this.searchResults["value"] && this.searchResults["value"].length > 0 && this.searchResults["value"][0]["list"] && this.searchResults["value"][0]["list"].length > 0;
    }else {
      this.hasResult = this.presets && this.presets["value"] && this.presets["value"].length > 0
    }
    
    //this.changeDetector.detectChanges();
  }

  selectNext() {
    let index = this.selectedItem ? this.items.indexOf(this.selectedItem) : 0;
    this.selectItem(this.items[Math.min(index+1, this.items.length-1)]);
  }

  selectPrev() {
    let index = this.selectedItem ? this.items.indexOf(this.selectedItem) : this.items.length-1;
    this.selectItem(this.items[Math.max(index-1, 0)]);
  }

  emitAction($event){
    this.actionEvent.emit($event);
  }

}
