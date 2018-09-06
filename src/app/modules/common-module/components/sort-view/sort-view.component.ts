import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-sort-view',
  templateUrl: './sort-view.component.html',
  styleUrls: ['./sort-view.component.scss']
})
export class SortViewComponent implements OnInit {
  	@HostBinding('class') class = 'c-sort-view';
  	@Input() isCardViewActive : boolean = false;
  	@Input() isListViewActive : boolean = true;
    @Input() activeView : any;
    @Output() changeView : EventEmitter<Object> = new EventEmitter<Object>();
  	constructor() {
    }
  	ngOnInit() {
        if(this.activeView){
          let subscriber = this.activeView.subscribe(
            value => this.toggle(value),
          );
        }

  	}

  	toggle(type){
  		if(type === 'card'){
  			this.isCardViewActive = true;
  			this.isListViewActive = false;
  		}else{
  			this.isCardViewActive = false;
  			this.isListViewActive = true;
  		}
  		this.changeView.emit({isCardViewActive:this.isCardViewActive, isListViewActive:this.isListViewActive});
  	}
}
