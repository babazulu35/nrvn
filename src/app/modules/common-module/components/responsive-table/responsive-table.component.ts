import { Component, OnInit, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-responsive-table',
  templateUrl: './responsive-table.component.html',
  styleUrls: ['./responsive-table.component.scss']
})
export class ResponsiveTableComponent implements OnInit {
	@HostBinding('class.c-responsive-table') true;
    @HostBinding('class.c-responsive-table--with-action-btn')
    @Input() hasAction: boolean = false;
    @HostBinding('class.c-responsive-table--promising')
    @Input() isLoading: boolean = false;
  	constructor() { }

    ngOnInit() {
    }
}