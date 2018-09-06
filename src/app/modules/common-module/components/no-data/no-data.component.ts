import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  styleUrls: ['./no-data.component.scss']
})
export class NoDataComponent implements OnInit {
  @HostBinding('class.c-no-data') true;

  @HostBinding('class.c-no-data--container')
  @Input() hasContainer: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() title: string;
  @Input() description: string;
  @Input() icon: {type: string, name: string} = {type: "svg", name: "no-data"};
  @Input() action: {action: string, label: string, theme?: string, params?: {}};
  @Input() iconSize: string = "md";

  @Output() actionEvent: EventEmitter<Object> = new EventEmitter();
  
  // @HostBinding('class.c-no-data--dashed-container') addDashed:boolean = false;
  // @Input() isDashedBorder:boolean = false;

  constructor() { }

  ngOnInit() {

    // if(this.isDashedBorder == true){
    //   this.addDashed = this.isDashedBorder;
    // }
    
  }

  emitAction($event) {
    if(this.action) this.actionEvent.emit(this.action);
  }

}
