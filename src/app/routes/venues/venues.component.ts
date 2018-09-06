import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit, Output, HostBinding, Renderer } from '@angular/core';
import { HeaderTitleService } from '../../services/header-title.service';
import { Venue } from '../../models/venue';
import { VenueService } from '../../services/venue.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Roles } from '../../models/roles';


@Component({
    selector: 'app-venues',
    templateUrl: './venues.component.html',
    styleUrls: ['./venues.component.scss'],
    providers: [VenueService]
})
export class VenuesComponent implements OnInit {
    @HostBinding('class.or-venues') true;

    subscription;
    errorMessage: any;

    venues: Venue[];
    count: number;
    noDataInContent: boolean = false;
    isLoading: boolean = false;

    selectedItems: Array<Object> = [];
    isAllSelected: boolean = false;

    pageSizes: Array<Object> = [{text: '10', value: 10}, {text: '20', value: 20}];
    pageSize: number = 10;
    currentPage: number = 1;

    pills: Array<any> = [
        {text: 'AKTİF', filter: 'IsActive eq true', isActive: false},
        {text: 'PASİF', filter: 'IsActive eq false', isActive: false},
    ];

    sortParams: Array<any> = [
        {text: 'ADA GÖRE', value: JSON.stringify({sortBy: "Name", type: "desc"})},
        {text: 'ŞEHİRE GÖRE', value: JSON.stringify({sortBy: "VenueLocationInfo.CityName", type: "desc"})}
    ];

    actionButtons: Array<Object> = [
        {label: 'Aktif Et', icon: 'visibility', action: 'activate', role: Roles.VENUE_LIST},
        {label: 'Durdur', icon: 'visibility_off', action: 'deActivate' , role: Roles.VENUE_LIST},
    ];

    constructor(
        private renderer: Renderer,
        private headerTitleService: HeaderTitleService,
        public venueService: VenueService,
        private router: Router,
        private route: ActivatedRoute,
        public tetherService: TetherDialog,
        private notificationService : NotificationService
    ) {
        this.venueService.setFilter(this.pills[0], false);
    }

    ngOnInit(): void {
        this.headerTitleService.setTitle('Mekanlar');
        this.headerTitleService.setLink('/venues');

        this.subscription = this.venueService.queryParamSubject.subscribe(
            params => {
                this.isLoading = true;
                this.updateLocalParams(params);
                this.venueService.setCustomEndpoint('GetVenueList');
                this.venueService.gotoPage(params);
            },
            error => this.errorMessage = <any>error
        );

        this.venueService.data.subscribe(
            venues => {
                this.selectedItems = [];
                this.venues = venues;

                this.isLoading = false;
                this.noDataInContent = this.venues.length == 0;
            },
            error => this.errorMessage = <any>error
        );

        this.venueService.getCount().subscribe(
            count => {
                this.count = count;
            },
            error => this.errorMessage = <any>error
        );

        this.venueService.isLoading.subscribe(result =>{
            this.isLoading = result;
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    updateLocalParams(params: Object = {}) {
        this.currentPage = params['page'] ? params['page'] : 1
        this.pageSize = params['pageSize'] ? params['pageSize'] : 10
    }

    onResize(event) { }

    ngAfterViewInit()  {}

    find() {}

    transistPage(page) {
        this.venueService.setPage(page);
    }

    toggleSortTitle(sort) {
        this.venueService.setOrder(sort);
    }

    changePageSize(pageSize) {
        this.venueService.setPageSize(pageSize);
    }

    onInputChange(event) {
        this.venueService.setSearch({ key: 'Name', value: event });
    }

    filterVenues(pill) {
        this.venueService.setFilter(pill);
    }

    selectAllItems(selectAll: boolean): void {
        if (selectAll && this.selectedItems.length < this.venues.length) {
            this.selectedItems = [];
            this.venues.forEach(item => {
                this.selectedItems.push(item);
            });
            this.isAllSelected = true;
        }
        if (!selectAll) {
            this.isAllSelected = false;
            this.selectedItems = [];
        }
    }

    selectItem(isSelected: boolean, venue: Venue): void {
        if (isSelected) {
            this.selectedItems.push(venue);
        } else {
            let selectedVenue = this.selectedItems.filter(item => {
                return (venue === item);
            })[0];
            this.selectedItems.splice(this.selectedItems.indexOf(selectedVenue), 1);
        }
    }

    get isMultiSelectionActive(): boolean {
        return this.selectedItems.length > 0;
    }

    getRawData() {
        console.log('raw', this.venueService.getRawData());
    }

    changeView(viewType) {
        this.venueService.setActiveViewType(viewType);
    }

    getItemActions(item) {

        let actions = [
            { label: 'Düzenle', icon: 'edit', action: 'edit' },
            // { label: 'Arşivle', icon: 'archive', action: 'archive' },
            // { label: 'Sil', icon: 'delete', action: 'delete' },
        ]

        if(item.IsActive) {
            actions.push({ label: 'Durdur', icon: 'visibility_off', action: 'deActivate'})
        } else {
            actions.push({ label: 'Aktif Et', icon: 'visibility', action: 'activate'})
        }

        return actions;
    }

    callSelectedItemsAction(action: string) {
        this.venueService.callBatchAction(this.selectedItems, action);
    }


    cardActionHandler(event, venue) {
        switch(event.target) {
            case "select":
                this.selectItem(event.action, event.data.model);
                break;
            case "goto":
                this.router.navigate([`/${event.data.entryType}`, event.data.model.Id, 'performances']);
                break;
            case "context":
                let actionResult = event.action;
                console.log("Action Result",actionResult);
                switch (actionResult['action']) {
                    case "edit":
                        this.router.navigate(['/venue', venue.Id, 'edit']);
                        break;
                    case 'activate':
                    case 'deActivate':
                        this.isLoading = true;
                        this.venueService.callItemAction(venue, actionResult['action']);
                        break;
                }
                break;
        }
    }

    openContext(e, venue){
        this.tetherService.context({
            title: "İŞLEMLER",
            data: this.getItemActions(venue)
        }, {
            target: e.target, attachment: "top right", targetAttachment: "top right",
        }).then(actionResult => {
            switch(actionResult['action']) {
                case "edit":
                    
                    this.router.navigate(['/venue', venue.Id, 'edit']);
                    break;
                case 'activate':
                case 'deActivate':
                    this.isLoading = true;
                    this.venueService.callItemAction(venue, actionResult['action']);
                    break;
            }
        }).catch(reason=>{});
    }
}
