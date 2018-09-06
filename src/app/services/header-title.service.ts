import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router, NavigationStart } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class HeaderTitleService {
	private title;
	private link;
	private previousUrl: string;
    constructor( private router:Router) {	
		let preUrlParts: string[];
		let currentUrlParts: string[];
		this.router.events.subscribe( event => {
			if(event instanceof NavigationStart) {
				if(this.previousUrl) {
					preUrlParts = this.previousUrl.split('/');
					currentUrlParts = event.url.split('/');
					preUrlParts.shift();
					currentUrlParts.shift();
					if(currentUrlParts.shift() != preUrlParts.shift()) this.title = "";
				}
				this.previousUrl = event.url;
			}
		});
    }
  	setTitle(title){
  		this.title = title;

  	}
	setLink(link){
		this.link = link;
	}
  	getTitle(){
  		return this.title;
  	}
	getLink(){
		return this.link;
	}
}
