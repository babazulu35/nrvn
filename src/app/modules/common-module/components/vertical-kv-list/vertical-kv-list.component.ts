import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';


@Component({
	selector: 'app-vertical-kv-list',
	templateUrl: './vertical-kv-list.component.html',
	styleUrls: ['./vertical-kv-list.component.scss']
})
export class VerticalKvListComponent implements OnInit {
	@HostBinding('class.c-vertical-kv-list') true;

	@HostBinding('class.c-vertical-kv-list--clean') isCleanTheme: boolean;

	@Output() clickEvent: EventEmitter<{}> = new EventEmitter();

	@Input() sections: {
		key: any,
		label: string,
		value: string,
		isActive?: boolean,
		hasAction?: boolean,
		color?: string,
		params?: any
	}[][];

	@Input() set activeItems(items: string[]) {
		this.sections.forEach(section => {
			section.forEach(item => {
				if(items.indexOf(item.key) > -1) {
					item.isActive = true;
				}
			});
		});
	}

	@Input() set theme(value: string) {
		this.isCleanTheme = value == "clean";
	}

	// get items():Object [] { return this.sections };

	constructor( ) { }

	ngOnInit() { }

	emitClickEvent(e, item){
		if(item.hasAction) {
			this.clickEvent.emit(item);
		}
	}
}
