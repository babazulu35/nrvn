import { Component, OnInit, HostBinding, ViewChild, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

import { InlineEditComponent } from '../inline-edit/inline-edit.component';

@Component({
  selector: 'app-header-inline-edit',
  templateUrl: './header-inline-edit.component.html',
  styleUrls: ['./header-inline-edit.component.scss']
})
export class HeaderInlineEditComponent implements OnInit {
  @ViewChild(InlineEditComponent) inlineEdit: InlineEditComponent;

  @HostBinding('class.c-header-inline-edit') true ;

  @Output() changeEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() actionEvent: EventEmitter<{action: string, value?:any, hasLocalization?:boolean}> = new EventEmitter<any>();

  changeEventSubscription;

  @Input() breadcrumbs: Array<Object>;
  @Input() placeholder: string;
  @Input() value: string;
  @Input() hasLocalization:boolean;
  @Input() isPromising:boolean = false;
  @Input() action: string;
  
  constructor(
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
   
  }
  
  changeEventHandler(event) {
    this.changeEvent.emit(event);
  }

  actionEventHandler(event:any) {
    if(this.action) this.actionEvent.emit({action: event.action, value: event.value, hasLocalization: event.hasLocalization});
  }

}
