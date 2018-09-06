import { Component, OnInit, EventEmitter, Input, Output, HostBinding } from '@angular/core';

@Component({
    selector: 'app-basic-button-group',
    templateUrl: './basic-button-group.component.html',
    styleUrls: ['./basic-button-group.component.scss']
})
export class BasicButtonGroupComponent implements OnInit {
    @HostBinding('class.c-basic-button-group') true;
    
    @Input() actions: {name:string, label: string, isSelected?: boolean, isDisabled?: boolean, params?: Object}[];
    @Input() isNarrow: boolean = false;
    @Input() iconName: string;

    @Input() groupDisabled:boolean = false;
    
    @Output() actionEvent: EventEmitter<Object> = new EventEmitter<Object>();


    constructor() {
    }

    ngOnInit() {
        
    }

    emitAction(action) {
        if(action.isDisabled) return;
        this.actionEvent.emit(action);
    }

}
