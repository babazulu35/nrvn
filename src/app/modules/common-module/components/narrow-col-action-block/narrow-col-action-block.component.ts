import { Component, EventEmitter, Input, ComponentFactory, ComponentRef, ComponentFactoryResolver, Injector, OnInit, Output, HostBinding } from '@angular/core';
import { TetherDialog } from '../../modules/tether-dialog/tether-dialog';
import { ContextMenuComponent } from '../context-menu/context-menu.component';

@Component({
    selector: 'app-narrow-col-action-block',
    templateUrl: './narrow-col-action-block.component.html',
    styleUrls: ['./narrow-col-action-block.component.scss'],
    entryComponents: [ContextMenuComponent]
})
export class NarrowColActionBlockComponent implements OnInit {
    @HostBinding('class.c-narrow-col-action-block') true;

    @Input() data: any;
    @Input() action: {name: string, iconName: string};
    @Input() contextMenuItems: Array<any>;
    @Output() contextMenuClick: EventEmitter<Object> = new EventEmitter<Object>();
    @Output() actionOnClick: EventEmitter<Object> = new EventEmitter<Object>();
    @Output() actionEvent: EventEmitter<{action: string, data?:any}> = new EventEmitter();

    constructor(
        public tetherService: TetherDialog,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
    ) { }

    ngOnInit() { }
    actionClick() {
        this.actionOnClick.emit({
            action: this.action,
            data: this.data
        });
        this.actionEvent.emit({
            action: this.action.name,
            data: this.data
        });
    }
    openEventsContextMenu(e) {
        this.tetherService.context({data: this.contextMenuItems}, {
            target: e.target,
            attachment: "top right",
            targetAttachment: "top right"
        }).then( result => {
            this.actionEvent.emit({
                action: result["action"],
                data: this.data
            });
        }).catch( reason => {})
    }

}
