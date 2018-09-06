import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
@Injectable()
export class NotificationService {
	notifications : BehaviorSubject<any> = new BehaviorSubject(null);
	constructor() { }

  	add(notification : {id ?: string, isNew ?: boolean, type:string, text:string, timeOut?: number}) {
  		notification.id = Math.random().toString(10).substr(2,5);
  		notification.isNew = true;
		notification.timeOut = notification.timeOut;
	    this.notifications.next(notification);
  	}
}
