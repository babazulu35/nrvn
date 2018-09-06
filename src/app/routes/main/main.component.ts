import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { GridListComponent } from './../../modules/common-module/components/grid-list/grid-list.component';
import { AfterContentInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, EventEmitter, Output, ContentChild, Renderer } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AuthenticationService } from './../../services/authentication.service';
import { Router  } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit,AfterContentInit,OnDestroy {
	@ViewChild('mainContainer') mainContainer: ElementRef;

	@ContentChild(GridListComponent) grids: GridListComponent[];
	isSideMenuCollapsed:boolean;

	@Output() sendEvent:EventEmitter<any> = new EventEmitter();
    parentSubject:Subject<any> = new Subject();
	
	tetherActionSubscribe:any;

  	constructor(
		  private renderer: Renderer,
		  public tetherService: TetherDialog, 
		  public authenticationService : AuthenticationService, 
		  private router: Router) {
  		if(!authenticationService.getToken()){
  			this.router.navigate(['login']);
  		}
  	}

  	ngOnInit() {
		if(this.tetherService.component) this.tetherActionSubscribe = this.tetherService.component.actionEvent.subscribe( event => {
			if(event.tetherOptions.type == "content" ) this.mainContainer.nativeElement.scrollTop = 0;
		});
  	}

    ngOnDestroy() {
		if(this.tetherActionSubscribe) this.tetherActionSubscribe.unsubscribe();
	}
	ngAfterContentInit() {

	}

	toggleSideMenu(isSideMenuCollapsed){
		this.isSideMenuCollapsed = isSideMenuCollapsed;
		this.tetherService.component.isMenuCollapsed = isSideMenuCollapsed;
		let self = this;
		this.triggerResize();
		setTimeout(function() {
			self.tetherService.position();
			self.triggerResize();
		}, 100);
	}

	private triggerResize() {
		$(window).trigger('resize');
		window.dispatchEvent(new Event('resize'));
		setTimeout(function() {
		  $(window).trigger('resize');
		  window.dispatchEvent(new Event('resize'));
		}, 500);
	  }

}
