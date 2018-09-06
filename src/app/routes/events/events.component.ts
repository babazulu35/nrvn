import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { AuthenticationService } from './../../services/authentication.service';
import { Component, OnInit, ElementRef, ViewChild, Renderer, HostBinding, ChangeDetectorRef } from '@angular/core';
import { HeaderTitleService } from '../../services/header-title.service';
import { Event } from '../../models/event';
import { EventService } from '../../services/event.service';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
    selector: 'app-events',
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.scss'],
    providers: [EventService]
})
export class EventsComponent implements OnInit {
    @HostBinding('class.or-events') true;

    subscription;
    isAuthenticatedRole:boolean;

    tabs: Array<any> = [
        { label: 'TÜMÜ', routerLink: '/events/index' },
        { label: 'TEK PERFORMANSLI ETKİNLİKLER', routerLink: '/events/single-performance' },
        { label: 'ÇOK PERFORMANSLI ETKİNLİKLER', routerLink: '/events/multiple-performance' },
        { label: 'ÇATI ETKİNLİKLERİ', routerLink: '/events/master' }
    ];

    selectedPill = null;
    pills: Array<any> = [
        { text: 'TASLAK', filter: '(Status eq 4 or Status eq 10)', isActive: false, type: 'and' },
        { text: 'SATIŞTA', filter: 'Status eq 2', isActive: false, type: 'and' },
        { text: 'SATIŞTA DEĞİL', filter: '(Status eq 3 or Status eq 5 or Status eq 6)', isActive: false, type: 'and' },
        { text: 'GEÇMİŞ', filter: 'Status eq 1', isActive: false, type: 'and' }
    ];

    sortParams: Array<any> = [
        {text:'SEÇİNİZ',value: ''},
        { text: 'ADA GÖRE[Z-A]', value: JSON.stringify({ sortBy: "Name", type: "desc" }) },
        { text: 'ADA GÖRE[A-Z]', value: JSON.stringify({ sortBy: "Name", type: "asc" }) },
        { text: 'TARİHE GÖRE[Önce Eski]', value: JSON.stringify({ sortBy: "BeginDate", type: "asc" }) },
        { text: 'TARİHE GÖRE[Önce Yeni]', value: JSON.stringify({ sortBy: "BeginDate", type: "desc" }) },
        // { text: 'SATIŞ TARİHİNE GÖRE[Önce Eski]', value: JSON.stringify({ sortBy: "SalesBeginDate", type: "asc" }) },
        // { text: 'SATIŞ TARİHİNE GÖRE[Önce Yeni]', value: JSON.stringify({ sortBy: "SalesBeginDate", type: "desc" }) }
    ];

    constructor(
        private renderer: Renderer,
        private headerTitleService: HeaderTitleService,
        public eventService: EventService,
        private router: Router,
        private route: ActivatedRoute,
        private authenticationService: AuthenticationService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {

    }

    ngOnInit(): void {
        this.headerTitleService.setTitle('Etkinlikler');
        this.headerTitleService.setLink('/events');
        this.eventService.setCustomEndpoint('GetEventList');

        this.subscription = this.eventService.queryParamSubject.subscribe(
            params => {
                if (params['filter'] && params['filter'].length) {
                    this.selectedPill = params['filter'][0];
                } else {
                    this.selectedPill = null;
                }
            }, error => console.log(error));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngAfterViewInit(){
        if(this.authenticationService.getAuthenticatedUser()) {
            this.isAuthenticatedRole = this.authenticationService.roleHasAuthenticate(AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN);
            this.changeDetectorRef.detectChanges();
        }else{
            this.authenticationService.user$.subscribe( user => {
                this.isAuthenticatedRole = this.authenticationService.roleHasAuthenticate(AuthenticationService.ROLE_SUPER_ADMIN, AuthenticationService.ROLE_FIRM_ADMIN);
                this.changeDetectorRef.detectChanges();
            });
        }
    }

    changeView(viewType) {
        this.eventService.setActiveViewType(viewType);
    }

    onInputChange(event) {
        this.eventService.setSearch({ key: 'Name', value: event });
    }

    filterEvents(pill) {
        this.eventService.setFilter(pill);
    }

    sortEvents(sort) {
        if(sort){
            this.eventService.setOrder(sort, true);
        } else {
            this.eventService.flushOrder();
        }
    }
}
