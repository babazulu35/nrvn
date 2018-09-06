import { Component, OnInit, Inject, Input, Output, EventEmitter, ComponentRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { ContextMenuComponent } from './../../../../modules/common-module/components/context-menu/context-menu.component';
import { TetherDialog } from './../../../../modules/common-module/modules/tether-dialog/tether-dialog';
import * as moment from 'moment';
import { CreateHallBoxComponent } from '../../components/create-hall-box/create-hall-box.component';
import { Hall } from '../../../../models/hall';
import { HallService } from '../../services/hall.service'
import { EntityService } from './../../../../services/entity.service';
import { EntityAttributeService } from '../../../../services/entity-attribute.service';

@Component({
  selector: 'app-hall-row',
  templateUrl: './hall-row.component.html',
  styleUrls: ['./hall-row.component.scss'],
  entryComponents: [ContextMenuComponent],
  providers: [HallService, EntityAttributeService,
    { provide: 'entityTypeEntityService', useClass: EntityService }]
})
export class HallRowComponent implements OnInit {

  events;
  performances;
  perfPerEvent;
  attributes: any[];
  entityTypeId: number;
  componentCreateBox: CreateHallBoxComponent;

  @Input() hall;
  @Output() editEvent: EventEmitter<any> = new EventEmitter();
  @Output() removeEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tetherService: TetherDialog,
    private hallService: HallService,
    private entityAttributeService: EntityAttributeService,
    @Inject('entityTypeEntityService') private entityTypeEntityService: EntityService
  ) { }

  ngOnInit() {

    this.performances = [];
    this.events = [];
    this.perfPerEvent = [];

    this.attributes = this.hall.Attributes;

    if (!this.hall.Templates) return;

    for (let temp of this.hall.Templates) {

      if (!temp.Performances ||  (temp.Performances && temp.Performances.length === 0)) break;

      temp.Performances.forEach(perf => {

        this.performances.push(perf);
        if (perf.Event) this.events.push(perf.Event);

      });

    }

    this.performances.forEach(perf => {

      this.addToDic(perf);

    });

  }

  addToDic(performance) {

    if (!performance.Event) return;

    if (this.perfPerEvent && this.perfPerEvent.length > 0) {

      let isExists = false;

      for (let dic of this.perfPerEvent) {
        if (performance.Event && dic.key.Id === performance.Event.Id) {
          isExists = true;
          dic.value.push(performance);
          break;
        }
      }

      if (!isExists) {
        this.perfPerEvent.push({
          key: performance.Event,
          value: [performance]
        });
      }

    } else {
      this.perfPerEvent.push({
        key: performance.Event,
        value: [performance]
      });
    }

  }

  public getNameFromEventId(eventId) {

    this.events.forEach(evt => {

      if (evt.Id === eventId) return evt.Localization.Name;

    });

  }

  openEventsContextMenu(e) {
    let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector)
    let instance: ContextMenuComponent = component.instance;

    instance.data = [
      { label: 'Düzenle', icon: 'edit', action: 'editEvent', group: 'events' },
      { label: 'Sil', icon: 'delete', action: 'removeEvent', group: 'events' }
    ]

    this.tetherService.context(component,
      {
        target: e.target,
        attachment: 'top right',
        targetAttachment: 'top right',
        targetOffset: '-13px 0px'
      }
    ).then(result => {
      if (result) {
        switch (result['action']) {
          case 'editEvent':
            this.editEvent.emit(this.hall);
          break;
          case 'removeEvent':
            this.removeEvent.emit(this.hall.Id);
          break;
        }
      }
    }).catch(reason => {
      console.log('dismiss reason : ', reason);
    });
  }
}
