import {   
  Component,
  ComponentFactory,
  ComponentRef,
  ComponentFactoryResolver,
  Type,
  ViewContainerRef,
  Injector,
  OnInit,
  HostBinding,
  Input,
  Output,
  EventEmitter } from '@angular/core';

import {TetherDialog} from '../../modules/tether-dialog/tether-dialog';
import {ContextMenuComponent} from '../context-menu/context-menu.component';

@Component({
  selector: 'app-mini-card',
  templateUrl: './mini-card.component.html',
  styleUrls: ['./mini-card.component.scss'],
  entryComponents: [ ContextMenuComponent ]
})
export class MiniCardComponent implements OnInit {
  @HostBinding('class.c-mini-card') true;

  @Output() actionEvent: EventEmitter<{}> = new EventEmitter();

  @HostBinding('class.c-mini-card--active')
  @Input() set isActive(value: boolean) {
    this.icon = value ? "visibility" : "visibility_off"
  }

  @Input() icon: string;
  @Input() title: string;
  @Input() subTitle: string;
  @Input() date: string;
  @Input() avatar: {letters: string, source: string};
  @Input() actions: {action: string, label: string, icon: string, params?: {}}[];

  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private viewContainer: ViewContainerRef,
    public tetherService: TetherDialog,    
  ) { }

  ngOnInit() {
  }

  emitAction(action) {
    this.actionEvent.emit(action);
  }

  openActionsMenu(event) {
    this.tetherService.context({
      data: this.actions
    }, {
      target: event.currentTarget
    })
  }
  
}
