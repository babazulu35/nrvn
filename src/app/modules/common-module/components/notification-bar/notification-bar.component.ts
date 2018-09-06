import { NotificationService } from './../../../../services/notification.service';
import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'app-notification-bar',
  templateUrl: './notification-bar.component.html',
  styleUrls: ['./notification-bar.component.scss']
})

export class NotificationBarComponent implements OnInit {
	@HostBinding("class.c-notification-bar") true;

	notifications : Array<any>;
	timeOut : number = 5000;
	subscribe;
 	constructor( 
		 private notificationService : NotificationService
	) {
		this.notifications = [];
 	}
	ngOnInit() {
		let self = this;
		this.notificationService.notifications.subscribe(item => {
			if(item){
			  item.timer = item.timeOut ? item.timeOut/1000 : self.timeOut/1000;
			  item.interval = setInterval(function(){
				  item.timer--;
			  }, 1000);

			  setTimeout(function(){
				  //  çıkış animasoyunu
				  item.animation = "out";
				  setTimeout(function() {
					  let indexOf = self.notifications.indexOf(item);
						self.notifications.splice(indexOf,1);
				  }, 500);
				  clearInterval(item.interval);
				}, item.timeOut || this.timeOut);
				this.notifications.push(item);
			  setTimeout(function() {
				  item.animation = "in";
			  }, 100);
			}/* else{
				this.notifications = null;
			} */
		}, error => {
			console.log(error);
		}, function(){
			console.log("notification complete");
		});
	}
  	close(notification){
  		let indexOf = this.notifications.indexOf(notification);
  		this.notifications.splice(indexOf,1);
  	}

}
