import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';

@Component({
  selector: 'app-narrow-col-status-feedback',
  templateUrl: './narrow-col-status-feedback.component.html',
  styleUrls: ['./narrow-col-status-feedback.component.scss']
})
export class NarrowColStatusFeedbackComponent implements OnInit {
  @HostBinding('class.c-narrow-col-status-feeback') true;
  
  @Input() data:any;
  @Input() action:{name?: string, label: string};

  @Output() actionEvent: EventEmitter<{action: any, data: any}> = new EventEmitter();

  @Output() actionOnClick: EventEmitter < Object > = new EventEmitter < Object > ();
  
  constructor() { }

  ngOnInit() {
  }

  emitAction(){
    this.actionEvent.emit({action: this.action.name, data: this.data});

    this.actionOnClick.emit({
      action: this.action,
      data: this.data
    });
  }  

}
