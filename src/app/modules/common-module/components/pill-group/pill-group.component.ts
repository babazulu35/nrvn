import { Component, OnInit, HostBinding, EventEmitter, Output, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


/**
 * Pill button groups.
 *
 * @param {array} pills - Pills have to be an iterable array. Each array item must have { {number} count, {string} text, {boolean} isActive } variables.
 */
@Component({
	selector: 'app-pill-group',
	templateUrl: './pill-group.component.html',
	styleUrls: ['./pill-group.component.scss']
})
export class PillGroupComponent implements OnInit {
	@HostBinding('class') class = 'c-pill-group';
	@Input() pills : Array<any>;
	@Input() theme:string;
	@Input() isIcon?:boolean;

	@Output() selectPillFilterAction : EventEmitter<Array<any>> = new EventEmitter<Array<any>>();
	@Output() changeEvent : EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

	@Input() selectedPill = null;
	@Input() canToggle: boolean = true;

	@Input() set setSelectedPill(pill) {
		if(pill) {
			this.selectedPill = pill;
			this.selectPillFilterAction.emit(this.selectedPill);
		}
	}

	constructor(
		private route: ActivatedRoute
	) {
	}

	ngOnInit() {
		if(!this.canToggle && !this.selectedPill) this.selectedPill = this.pills[0];
	}

	toggle(pill: any){
		if(this.selectedPill == pill) return;
		if(this.selectedPill == pill && this.canToggle){
			this.selectedPill = null;
		} else {
			this.selectedPill = pill;
		}
		this.selectPillFilterAction.emit(pill);
		this.changeEvent.emit(this.selectedPill);
	}
}
