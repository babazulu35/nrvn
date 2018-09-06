import { TitleSwitcherComponent } from './../../modules/common-module/components/title-switcher/title-switcher.component';
import { Component, OnInit, ComponentFactoryResolver, ViewChild, HostBinding, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HeaderTitleService } from './../../services/header-title.service';
import { VenueService } from '../../services/venue.service';
import { EventService } from '../../services/event.service';
import { Venue } from '../../models/venue';

import * as moment from 'moment';
import { Roles } from '../../models/roles';

@Component({
    selector: 'app-venue',
    templateUrl: './venue.component.html',
    styleUrls: ['./venue.component.scss'],
    providers: [VenueService, EventService],
})
export class VenueComponent implements OnInit {
    @HostBinding('class.or-venue') true;
    @ViewChild(TitleSwitcherComponent) titleSwitcher: TitleSwitcherComponent;

    venue: Venue;
    venueStatistics: Object;
    param: any;
    subscription;
    titleSearchActive: boolean = false;

    mon = 1;
    nextMon = 8;
    thisMonday = moment().day(this.mon).toISOString();
    nextMonday = moment().day(this.nextMon).toISOString();
    now = moment().toISOString();
    isoWeek = moment().isoWeek();
    thisWeek = moment().isoWeek();
    narrowIndexTitle: string = "Bu Hafta";
    sidebarEvents: any;
    sidebarIsLoading: boolean = false;
    sidebarIsNoDataContent: boolean = false;

    tabs: Array<any> = [
        { label: 'ETKİNLİKLER', routerLink: 'events', params: {role: Roles.VENUE_LIST}},
        { label: 'SALONLAR', routerLink: 'halls', params: {role: Roles.VENUE_LIST}},
        { label: 'OTURMA DÜZENLERİ', routerLink: 'layouts', params: {role: Roles.VENUE_LIST}}
    ];
    statisticLabels: Object = { EventCount: 'Etkinlik', PerformanceCount: 'Performans', TemplateCount: 'Yerleşim' };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private headerTitleService: HeaderTitleService,
        private eventService: EventService,
        private venueService: VenueService,
    ) { }

    ngOnInit() {
        this.headerTitleService.setTitle('Mekanlar');

        this.subscription = this.route.params.subscribe(params => {
            this.param = +params['id'];
            this.venueService.setSnapshotId(this.param);
            this.venueService.setCustomEndpoint('GetVenue');
            this.venueService.query({}, [{ key: 'venueId', value: this.param }], true);

            // --------------- sidebar events ------------------------------------------------------
            this.eventService.setCustomEndpoint('GetEventList');
            this.eventService.query({ pageSize: 10, filter: [{ filter: `BeginDate gt ${this.thisMonday} and BeginDate lt ${this.nextMonday}` }] }, [{ key: 'VenueId', value: this.param }]);
            // -------------------------------------------------------------------------------------
        });

        this.venueService.data.subscribe(res => {
            if (this.titleSearchActive) {
                let result = [];
                res.forEach( venue => {
                    result.push({
                        id: venue.Id,
                        icon: "location",
                        title: venue.Name,
                        params: {venue: venue},
                        description: venue['Description']
                    });
                });

                this.titleSwitcher.finderSearchResults = Observable.of([{
                    title: "ARAMA SONUÇLARI",
                    list: result
                }]);

                this.titleSearchActive = false;

            } else if (res && res.length > 0) {
                this.venue = res[0];
                let statistics = [],
                    keys = Object.getOwnPropertyNames(this.statisticLabels);
                for (let key of keys) {
                    statistics.push({ label: this.statisticLabels[key], value: this.venue[key] });
                }
                this.venueStatistics = statistics;
            }
        });

        // --------------- sidebar events ----------------------------------------------------------
        this.eventService.data.subscribe(res => {
            this.sidebarEvents = res;
            this.sidebarIsLoading = false;
            this.sidebarIsNoDataContent = this.sidebarEvents.length == 0;
        });
        // -----------------------------------------------------------------------------------------
    }

    onContentTitleSearchHandler(value) {
        this.titleSearchActive = true;
        this.venueService.setCustomEndpoint('GetVenueList');
        this.venueService.query({page: 1, pageSize: 10, search: { key: 'Name', value: value }});
    }

    onContentTitleChangedHandler(result) {
        this.router.navigate(['/venue', result.id]);
    }

    fetchWeekly(arg: boolean) {
        if (this.sidebarIsLoading) {return;}
        this.sidebarIsLoading = true;

        if (arg) {
            // go to next week
            this.isoWeek = this.isoWeek + 1;
            this.mon = this.mon + 7;
            this.nextMon = this.nextMon + 7;
            this.thisMonday = moment().day(this.mon).toISOString();
            this.nextMonday = moment().day(this.nextMon).toISOString();
        } else {
            // go to previous week
            this.isoWeek = this.isoWeek - 1;
            this.mon = this.mon - 7;
            this.nextMon = this.nextMon - 7;
            this.thisMonday = moment().day(this.mon).toISOString();
            this.nextMonday = moment().day(this.nextMon).toISOString();
        }
        if (this.isoWeek < 1) this.isoWeek = this.isoWeek + 52;
        if (this.isoWeek > 52) this.isoWeek = this.isoWeek - 52;
        this.narrowIndexTitle = this.isoWeek.toString() + ". Hafta";
        if (this.thisWeek == this.isoWeek) this.narrowIndexTitle = "Bu Hafta"
        if (this.thisWeek - this.isoWeek == -1) this.narrowIndexTitle = "Gelecek Hafta";
        if (this.thisWeek - this.isoWeek == 1) this.narrowIndexTitle = "Geçen Hafta";

        this.eventService.query({
            pageSize: 10,
            filter: [{ filter: `BeginDate gt ${this.thisMonday} and BeginDate lt ${this.nextMonday}` }]
        }, [{ key: 'VenueId', value: this.param }]);
    }
}
