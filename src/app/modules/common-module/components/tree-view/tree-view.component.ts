import { Component, OnInit,EventEmitter, Output, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss']
})

export class TreeViewComponent implements OnInit {
  @HostBinding('class.c-tree-view') true ;
  @Output() selectEvent : EventEmitter<any> = new EventEmitter<any>();
  @Input() list: Array<any>;
  @Input() isAllEnabled: Boolean = true;
  @Input() title: String;
  @Input() selectedItemKey: any;
  
  constructor() { }
  ngOnInit() {}

  select(value){
    if(value == null || value.id == this.selectedItemKey ){
      this.selectedItemKey = null;
      this.selectEvent.emit(null);
    } else{
      this.selectedItemKey = value.id;
      this.selectEvent.emit(value)
    }
  }
}
