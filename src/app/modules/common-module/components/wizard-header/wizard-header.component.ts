import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';

@Component({
  selector: 'app-wizard-header',
  templateUrl: './wizard-header.component.html',
  styleUrls: ['./wizard-header.component.scss'],
  host: {
    class: "c-wizard-header"
  }
})
export class WizardHeaderComponent implements OnInit {
  @HostBinding('class.c-wizard-header') true;
  
  @Output() actionEvent = new EventEmitter();

  @Input() currentLevel: number;
  @Input() totalLevel: number;
  @Input() historyIsActive: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  emitAction(event: {action: string, params?: any}) {
    this.actionEvent.emit(event);
  }
}
