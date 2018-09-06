import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-single-tag',
  templateUrl: './single-tag.component.html',
  styleUrls: ['./single-tag.component.scss']
})
export class SingleTagComponent implements OnInit {
  @HostBinding('class.c-single-tag') true;

  @Output() actionEvent: EventEmitter<{action: string, data: any}> = new EventEmitter();

  @HostBinding('class.c-single-tag--deactive')
  @Input() isDisabled: boolean;

  @HostBinding('class.c-single-tag--empty')
  @Input() isEmpty: boolean;

  @HostBinding('class.c-single-tag--primary') isPrimary: boolean;
  @HostBinding('class.c-single-tag--secondary') isSecondary: boolean;

  @Input() data: {id: any, name: string, params?: {}};
  @Input() action: {name: string, icon: string, params?: {}};
  @Input() canBeRemoved: boolean = true;
  @Input() icon: string;
  
  @Input() set name(value: string) {
    if(this.data) this.data.name = value;
  }

  @Input() set theme(value: string){
    this.isPrimary = value == "primary";
    this.isSecondary = value == "secondary";
  }

  constructor() { }

  ngOnInit() {
    if(!this.action && this.canBeRemoved) this.action = {name: "remove", icon: "close", params: this.data }
  }

  emitAction() {
    if(this.action) this.actionEvent.emit({action: this.action.name, data: this.action.params || this.data});
  }

}
