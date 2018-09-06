import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-narrow-col-timer',
	templateUrl: './narrow-col-timer.component.html',
	styleUrls: ['./narrow-col-timer.component.scss']
})
export class NarrowColTimerComponent implements OnInit {
	@Input() expiresIn;

	@Output() timeEndEvent = new EventEmitter<{isTimeEnd:boolean}>();

	expiresInFormatted;
	constructor() { }

	ngOnInit() {
		let self = this;
		if(!isNaN(self.expiresIn)){
			let timer = setInterval(function(){
				let min = Math.floor(self.expiresIn / 60),
					sec = self.expiresIn - min*60;
				self.expiresInFormatted = ("0" + min).slice(-2) + ':' + ("0" + sec).slice(-2);
				self.expiresIn -= 1;
				if(self.expiresIn < 0){
					self.timeEndEvent.emit({
						isTimeEnd:true
					});					
					clearInterval(timer);
				}
			}, 1000);
		}else{
{			this.expiresInFormatted = '00:00';
			this.timeEndEvent.emit({
				isTimeEnd:true
			});
}			
		}
	}

}
