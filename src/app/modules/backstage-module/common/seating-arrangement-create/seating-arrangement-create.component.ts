import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit, Input, HostBinding } from '@angular/core';

@Component({
  	selector: 'app-seating-arrangement-create',
  	templateUrl: './seating-arrangement-create.component.html',
	styleUrls: ['./seating-arrangement-create.component.scss']
})
export class SeatingArrangementCreateComponent implements OnInit {
  	@HostBinding('class.oc-seating-arrangement-create') true;
  	get totalLevel():number { return this._totalLevel };
  	get level():number { return this.wizardLevel };
  	set level(value:number) {
	    this.wizardLevel = value;
	    if(this.wizardLevel > this._totalLevel) this.wizardLevel = this._totalLevel;
	    if(this.wizardLevel < 1) this.wizardLevel = 1;
	    this.tetherService.position();
  	}
  	public wizardLevel:number = 1;
  	public _totalLevel:number = 4;
  	constructor(
    	public tetherService:TetherDialog
  	) { }
  	ngOnInit() {
 	}
  	forward() {
    	this.level++;
  	}
  	back() {
    	this.level--;
  	}
  	historyClickHandler(){
    	this.back();
	}


	public steps : Object = [
	{
		title: 'TEST',
		level: 1,
		objects: [
        {
        	id: 1,
            text: "Spor Karşılaşması",
            path: "assets/images/icon-grid/seating-arrangement01.jpg"
        },
        {
            id: 2,
            text: "Parti",
            path: "assets/images/icon-grid/seating-arrangement02.jpg"
        },
        {
            id: 3,
            text: "Bölümlü Koltuklar",
            path: "assets/images/icon-grid/seating-arrangement03.jpg"
        },
        {
            id: 4,
            text: "Bölümlü Koltuklar & Ayakta",
            path: "assets/images/icon-grid/seating-arrangement04.jpg"
        },
        {
            id: 5,
            text: "Yemek",
            path: "assets/images/icon-grid/seating-arrangement05.jpg"
        }
        ]
	},
	{
		title: 'TEST 2',
		level: 2,
		objects: []

	},
	{
		title: 'TEST 3',
		level: 3,
		objects: []

	}

	]
}
