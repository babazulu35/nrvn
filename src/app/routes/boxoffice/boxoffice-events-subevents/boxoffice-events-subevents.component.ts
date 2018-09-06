import { BoxofficeService } from './../../../services/boxoffice.service';
import { Component, OnInit,Input } from '@angular/core';
import { EntityService } from '../../../services/entity.service';
import { EventService } from '../../../services/event.service';
import { VenueService } from '../../../services/venue.service';
import { ShoppingCartService } from '../../../services/shopping-cart.service';
import { ActivatedRoute } from '@angular/router';
import { EventStatus } from '../../../models/event-status.enum';
@Component({
  selector: 'app-boxoffice-events-subevents',
  templateUrl: './boxoffice-events-subevents.component.html',
  styleUrls: ['./boxoffice-events-subevents.component.scss'],
  providers: [ EntityService, EventService, VenueService ]
})
export class BoxofficeEventsSubeventsComponent implements OnInit {
	subscription : any;
	count : number;
	isPromising: boolean = false;
	isLoading:boolean = false;
	results : any;
	errorMessage;
  	noDataInContent :boolean = false;
  	breadcrumb : string;
  	eventStatus = EventStatus;
  	constructor(
  		private entityService:EntityService,
		private shoppingCartService : ShoppingCartService,
		private boxofficeService: BoxofficeService,  
  		private eventService: EventService,
  		private venueService: VenueService,
  		private route: ActivatedRoute
  		) {
  		this.results = null;
  		this.breadcrumb = null;
  	}
  	ngOnInit() {
  		this.entityService.data.subscribe(
			results => {
				this.isPromising = false;
				this.isLoading = false;
				this.results = results;
			},
			error =>  this.errorMessage = <any>error
		);
		this.subscription = this.entityService.queryParamSubject.subscribe(
			params => {
				this.isPromising = true;
				this.isLoading = true;
				this.entityService.setCustomEndpoint("GetAll");
        		let query = this.entityService.fromEntity('EEvent')
        			.whereRaw("(Status eq cast('"+this.eventStatus.OnSale+"', Nirvana.Shared.Enums.EventStatus) or Status eq cast('"+this.eventStatus.Suspended+"', Nirvana.Shared.Enums.EventStatus) or Status eq cast('"+this.eventStatus.SoldOut+"', Nirvana.Shared.Enums.EventStatus))");
        			if(this.route.snapshot.data["type"] == "venue-events"){
        				this.venueService.find(this.route.snapshot.params['venueId'], true);
        				query.andRaw('Performances/any(p:p/VenueTemplate/Venue/Id eq '+this.route.snapshot.params['venueId']+')')
        			}
        			if(this.route.snapshot.data["type"] == "main-events"){
        				this.eventService.find(this.route.snapshot.params['mainEventId'], true);
        				query.and('ParentId','=',+this.route.snapshot.params['mainEventId'])
        			}
        		query.expand(['Localization'])
        			.expand(['Performances','VenueTemplate','Venue','Localization'])
        			.expand(['Performances','VenueTemplate','Venue','Town','City'])
					.select(['Localization','Performances','Status','Images','ChildEventCount','Id'])
        			.selectOnExpand(['VenueTemplate','Date','Id'],1)
                	.take(100)
                	.page(0)
                	.executeQuery();
			},
			error =>  this.errorMessage = <any>error
		);
		this.eventService.data.subscribe(event=>{
			if(event[0]){
				this.breadcrumb = event[0]['Localization']['Tr']['Name'];
			}
		});
		this.venueService.data.subscribe(venue=>{
			if(venue[0]){
				this.breadcrumb = venue[0]['Localization']['Tr']['Name'];
			}
		});
		this.entityService.count.subscribe(
			count => { this.count = count; },
			error =>  this.errorMessage = <any>error
		);

	  }
	  
	  cardActionHandler(event) {
		if(event.target = "context") {
			switch(event.action.action) {
				case "addToQuickSale":
					this.boxofficeService.quickSaleEvent.next(event.data.model);
				break;
			}
		}
	}
}
