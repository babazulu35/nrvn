import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-narrow-col-action-offer',
    templateUrl: './narrow-col-action-offer.component.html',
    styleUrls: ['./narrow-col-action-offer.component.scss']
})
export class NarrowColActionOfferComponent implements OnInit {
    @Input() theme: string;
    @Input() data: any;
    @Output() actionOnClick: EventEmitter<Object> = new EventEmitter<Object>();

    constructor() {
        
    }

    actionClick(event?:any) {
        this.actionOnClick.emit({
            action: this.data
        });
    }

    ngOnInit() {
    }

}
