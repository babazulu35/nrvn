import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
    selector: 'app-narrow-col-event-calendar',
    templateUrl: './narrow-col-event-calendar.component.html',
    styleUrls: ['./narrow-col-event-calendar.component.scss']
})
export class NarrowColEventCalendarComponent implements OnInit {

    @Input() data: any = [];
    @Input() title: string = "";

    @Input() isLoading: boolean = false;
    @Input() isNoDataContent: boolean = false;

    @Output() onNext: EventEmitter<Object> = new EventEmitter<Object>();
    @Output() onPrevious: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(
    ) {
    }

    ngOnInit() {
        this.isNoDataContent = this.data.length == 0;
    }

    onLeftClick(event?:any) {
        // this.isLoading = true;
        // this.isNoDataContent = false;
        // setTimeout(() => {
        //    this.isLoading = false;
        //    this.data.length == 0 ? this.isNoDataContent = true : this.isNoDataContent = false;
        // }, 1000);
        this.onPrevious.emit({});
    }
    onRightClick(event?:any) {
        // this.isLoading = true;
        // this.isNoDataContent = false;
        // setTimeout(() => {
        //    this.isLoading = false;
        //    this.data.length == 0 ? this.isNoDataContent = true : this.isNoDataContent = false;
        // }, 1000);
        this.onNext.emit({});
    }
}
