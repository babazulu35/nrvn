import { GridListComponent } from './../grid-list/grid-list.component';
import { Component, OnInit, Input, Output, EventEmitter, HostBinding, ViewChild } from '@angular/core';

@Component({
  selector: 'app-icon-grid',
  templateUrl: './icon-grid.component.html',
  styleUrls: ['./icon-grid.component.scss']
})
export class IconGridComponent implements OnInit {
  @ViewChild(GridListComponent) gridList: GridListComponent;

  @HostBinding('class.c-icon-grid') true;

  //todo iptal olacak blok
  @Output() iconOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() newButtonOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() actionOnClickEvent: EventEmitter<any> = new EventEmitter<any>();
  //---------------------

  @Output() actionEvent: EventEmitter<{action: string, params?:any}> = new EventEmitter();

  @Input() isNewButtonEnabled: boolean = false;
  @Input() newButtonLabel: string = "Yeni";
  @Input() data: Array<any>;
  selectedItemKey: any;

  constructor() {
  }

  ngOnInit() {
  }

  select(event, value, index){
    event.stopPropagation();
    this.selectedItemKey = (index == this.selectedItemKey ) ? null: index;
    //todo iptal olacak blok
    this.iconOnClick.emit({
      event: (index == this.selectedItemKey ) ? "selected": "unselected",
      object: value
    });
    //--------------------
    this.actionEvent.emit({action: "select", params: {
      selected: index == this.selectedItemKey,
      object: value
    }});
  }

  newButtonClick(){
    //todo iptal olacak blok
    this.newButtonOnClick.emit({newButtonClicked:true});
    //----------------------
    this.actionEvent.emit( {action: "new"} );
  }

  actionOnClick(event, item, value){
    event.stopPropagation();
    //todo iptal olacak blok
    this.actionOnClickEvent.emit(value);
    //---------------------
    this.actionEvent.emit( {action: "action", params: {object: item, value: value}});
  }

  position() {
    if(this.gridList) this.gridList.render();
  }

}
