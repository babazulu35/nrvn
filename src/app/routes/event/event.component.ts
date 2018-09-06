import { Component, OnInit, ViewChild, HostBinding, Renderer, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TitleSwitcherComponent } from './../../modules/common-module/components/title-switcher/title-switcher.component';
import { HeaderTitleService } from './../../services/header-title.service';
import { AuthenticationService } from './../../services/authentication.service';
import { EventService } from '../../services/event.service';
import { VenueService } from '../../services/venue.service';
import { PerformanceService } from '../../services/performance.service';
import { Event } from '../../models/event';
import { Roles } from '../../models/roles';


@Component({
    selector: 'app-event',
    templateUrl: './event.component.html',
    styleUrls: ['./event.component.scss'],
    providers: [
        EventService, VenueService, PerformanceService,
        {provide: 'EventServiceInstance1', useClass: EventService },
    ]
})
export class EventComponent implements OnInit {
    @ViewChild(TitleSwitcherComponent) titleSwitcher: TitleSwitcherComponent;
    @HostBinding('class.or-event') true;

    subscription;

    event: Event;
    performance;
    venues: Array<any> = [];

    tabs: Array<any> = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private renderer: Renderer,
        private headerTitleService: HeaderTitleService,
        private authenticationService: AuthenticationService,
        private eventService: EventService,
        private venueService: VenueService,
        private performanceService: PerformanceService,
        @Inject('EventServiceInstance1') private titleSearchService: EventService,
    ) { }

    ngOnInit() {
        this.headerTitleService.setTitle('Etkinlikler');

        this.subscription = this.route.params.subscribe(params => {
            let param = +params['id'];
            this.eventService.setCustomEndpoint('GetEventList');
            this.eventService.query({ pageSize: 1, filter: [{ filter: `Id eq ${param}` }] })
        });

        this.titleSearchService.data.subscribe(response => {
            if(!(this.titleSwitcher && this.titleSwitcher.finder)) { return }

            let result: {}[] = [];
            response.forEach( eventData => {
                result.push({
                    id: eventData.Id,
                    title: eventData.Name,
                    icon: "audiotrack",
                    params: {event: eventData}
                });
            });

            this.titleSwitcher.finderSearchResults = Observable.of([{
                title: "ARAMA SONUÇLARI",
                list: result
            }]);
        });

        this.eventService.data.subscribe(events => {
            if (!(events && events.length > 0)) { return }

            this.performance = null;
            this.venues = [];

            this.event = events[0];

            if(this.event.ChildEventCount > 0) {
                this.tabs = [
                    {label: 'KONTROL PANELİ', routerLink: 'reports', params: {role: Roles.EVENT_GROUP_DASHBOARD}},
                    {label: 'ETKİNLİKLER', routerLink: 'events', params: {role: Roles.EVENT_GROUP_EVENTS} },
                    // {label: 'PERFORMANSLAR', routerLink: 'performances' },
                    // {label: 'ÜRÜNLER', routerLink: 'products' },
                ];
                if (this.tabs && this.tabs.length) {
                    let authenticatedTabs = this.tabs.filter(r =>  this.authenticationService.roleHasAuthenticate(r['params']['role']));
                    if (authenticatedTabs && authenticatedTabs.length) {
                        this.router.navigate([authenticatedTabs[0].routerLink], {relativeTo: this.route});
                    }
                }
            } else {

                this.tabs = [
                    {label: 'KONTROL PANELİ', routerLink: 'reports', params: {role: Roles.EVENT_DASHBOARD}},
                    {label: 'PERFORMANSLAR', routerLink: 'performances', params: {role: Roles.EVENT_PERFORMANCES} },
                    // {label: 'ÜRÜNLER', routerLink: 'products' },
                    
                ];

                if (this.event.Performances && this.event.Performances.length > 0) {

                    let eventVenuesDic = {};
                    let eventVenues = [];

                    this.event.Performances.forEach(performance => {
                        if(!this.performance || this.performance.Date > performance.Date) {
                            this.performance = performance;
                        }
                        if(performance.Venue){
                            if(!eventVenuesDic[performance.Venue.Id]) {
                                eventVenuesDic[performance.Venue.Id] = performance.Venue;
                                eventVenues.push(performance.Venue);
                            }
                        }
                    });

                    if (eventVenues.length === 1) {
                        this.venueService.find(eventVenues[0].Id, true);
                        this.venueService.data.subscribe(venues => {
                            if (venues[0]) {
                                this.venues = [venues[0]];
                            }
                        });
                    } else if (eventVenues.length > 1) {
                        this.venues = eventVenues;
                    }
                }

                if (this.tabs && this.tabs.length) {
                    let authenticatedTabs = this.tabs.filter(r =>  this.authenticationService.roleHasAuthenticate(r['params']['role']));
                    if (authenticatedTabs && authenticatedTabs.length) {
                        this.router.navigate([authenticatedTabs[0].routerLink], {relativeTo: this.route});
                    }
                }
            }
        });
    }

    checkedHandler($event) {
        console.log($event);
    }

    titleSearchHandler(value) {
        this.titleSearchService.setCustomEndpoint('GetEventList');
        if(value && value.length > 0) this.titleSearchService.query({ page: 0, pageSize: 10, search: {key:'Name', value: value}});
    }

    titleChangeHandler(event) {
        this.router.navigate(["event", event.id]);
    }
}
