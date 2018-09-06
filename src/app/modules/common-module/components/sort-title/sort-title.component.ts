import { Component, OnInit, Output, Input , EventEmitter, HostBinding } from '@angular/core';
/**
 * Sort title button. Bubbles 'toggleSortTitle()' event to parent component and shows correct sort status of title.
 *
 * @param {string} sortTitle - visible text
 * @param {string} sortBy - name of query param
 * ### Example
 * <app-sort-title sortTitle='Kişiler' sortBy='people'></app-sort-title>
 */
@Component({
	selector: 'app-sort-title',
	templateUrl: './sort-title.component.html',
	styleUrls: ['./sort-title.component.scss']
})

export class SortTitleComponent implements OnInit {
	@Input() sortTitle : string;
	@Input() sortBy : string;
	@Input() activeTitle;
	@Output() toggleSortTitle : EventEmitter<Object> = new EventEmitter<Object>();
	@HostBinding('class') class  = 'c-sort-title';
	subscription;
	sortType : string = '';

	@HostBinding('class.c-sort-title--down') get isDesc() : boolean{
		return (this.sortType === 'desc') ? true : false;
	}
	@HostBinding('class.c-sort-title--up') get isAsc() : boolean{
		return (this.sortType === 'asc') ? true : false;
	}
	@HostBinding('class.c-sort-title--selected') get hasSort() : boolean{
		return (this.sortType !== '') ? true : false;
	}

	constructor() { }

	toggle(event?:any) {
		this.subscription = this.activeTitle.subscribe(
			params => {
				if(!params.sort || !(params.sort.length > 0)  || (params.sort[0] && params.sort[0].sortBy != this.sortBy)){
					this.sortType = '';
				}
			}
		);
		this.sortType = (this.isDesc || !this.hasSort) ? 'asc' : 'desc';
		this.toggleSortTitle.emit({ sortBy: this.sortBy, type: this.sortType });
	}

	ngOnInit() {
	}
	ngOnDestroy() {
		if(this.subscription){
			this.subscription.unsubscribe();
		}
	}
}
