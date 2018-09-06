import { SelectboxComponent } from './../../../base-module/components/selectbox/selectbox.component';
import { Component, OnInit, Input, Output, EventEmitter, HostBinding, ViewChild } from '@angular/core';
import { InlineSearchInputComponent } from '../inline-search-input/inline-search-input.component';

@Component({
  selector: 'app-header-large-search',
  templateUrl: './header-large-search.component.html',
  styleUrls: ['./header-large-search.component.scss']
})
export class HeaderLargeSearchComponent implements OnInit {
  @ViewChild(InlineSearchInputComponent) searchInput: InlineSearchInputComponent;
  @ViewChild(SelectboxComponent) selectbox: SelectboxComponent;

  @HostBinding('class.c-header-large-search') true;

  @Input() isPromising:boolean = false;
  @Output() onTypeChange : EventEmitter<any> = new EventEmitter<any>();
  @Output() onDataChange : EventEmitter<any> = new EventEmitter<any>();
  @Output() onDataSave : EventEmitter<any> = new EventEmitter<any>();
  @Input() options: Array<any>;
  @Input() inputType: string = "string";
  @Input() placeholder: Object;
  @Input() data: string = "";
  public selectedPlaceholder:string;

  constructor() {
  }
  ngOnInit() {
    this.selectedPlaceholder = this.placeholder[this.inputType];
  }

  onSelectboxChange(event){
    this.inputType = event;
    this.searchInput.data = "";
    this.selectedPlaceholder = this.placeholder[this.inputType];
    this.onTypeChange.emit({searchType: this.inputType});
  }

  onInputChange(event){
  	console.log(event);
    if (this.inputType == "date" && event) {
      event = this.searchInput.pikaday.getMoment().format();
    }
    this.onDataChange.emit({searchType: this.inputType, searchValue: event});
  }

  onSave(event){
    this.onDataSave.emit({searchType: this.inputType, searchValue: event});
  }

}
