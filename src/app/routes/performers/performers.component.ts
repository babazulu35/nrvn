import { PerformerCreateComponent } from './../../modules/backstage-module/common/performer-create/performer-create.component';
import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Component, OnInit, ComponentFactory, ComponentFactoryResolver, Injector, HostBinding } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HeaderTitleService } from './../../services/header-title.service';
import { PerformerService } from '../../services/performer.service';
import { Performer } from './../../models/performer';

@Component({
    selector: 'app-performers',
    templateUrl: './performers.component.html',
    styleUrls: ['./performers.component.scss'],
    entryComponents: [PerformerCreateComponent],
    providers: [PerformerService],
})
export class PerformersComponent implements OnInit {
    @HostBinding('class.or-performers') true;

    errorMessage: any;
    performers: Performer[];

    activeView: any;
    isFirstView: boolean = true;
    drawerIsOpen: boolean = false;
    sub: any;

    // tabs: Array<any> = [
    //     { label: 'MÜZİSYENLER', routerLink: '/performers/musicians' },
    //     { label: 'OYUNCULAR', routerLink: '/performers/artists' },
    //     { label: 'DİĞER', routerLink: '/performers/others' }
    // ];
    // sortParams: Array<any> = [
    //     { text: 'ADA GÖRE', value: JSON.stringify({ sortBy: "name", type: "desc" }) },
    //     { text: 'TARİHE GÖRE', value: JSON.stringify({ sortBy: "date", type: "desc" }) }
    // ];

    constructor(
        private headerTitleService: HeaderTitleService,
        private route: ActivatedRoute,
        private router: Router,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        public tetherService: TetherDialog,
        private performerService: PerformerService
    ) {
    }

    ngOnInit() {
        this.headerTitleService.setTitle('Sanatçılar');
        this.headerTitleService.setLink('/performers');

        let self = this;
        setTimeout(function () {
            self.checkAction(self.route.snapshot.queryParams);
            self.isFirstView = false;
        }, 0.5);
        this.route.queryParams.subscribe(params => {
            if (!this.isFirstView) this.checkAction(params);
        });
    }

    openPerformerCreateDrawer() {
        this.drawerIsOpen = true;
        this.tetherService.drawer(this.resolver.resolveComponentFactory(PerformerCreateComponent), {}).then(result => {
            this.drawerIsOpen = false;
            this.router.navigate(['performers/'], { queryParams: { refresh: true } });
        }).catch(reason => {
            this.drawerIsOpen = false;
            this.router.navigate(['performers/'], { queryParams: { refresh: true } });
        });
    }

    sortPerformers(sort) {
        this.performerService.setOrder(sort);
    }

    filterPerformers(pill) {
        this.performerService.setFilter(pill);
    }

    changeView(viewType) {
        this.performerService.setActiveViewType(viewType);
    }

    onInputChange(event) {
        this.performerService.setSearch({ key: 'PerformerName', value: event })
    }

    log(event) {
        console.log(event);
    }

    redirectToCreatePerformer(event:any){
        this.router.navigate(['performers'],{ queryParams: { action: 'create' } });
    }

    checkAction(params: any) {
        if (params['action']) {
            switch (params['action']) {
                case 'create':
                    this.openPerformerCreateDrawer();
                    break;
                case "edit":
                    this.openPerformerCreateDrawer();
                    break;
            }
        } else {
            if (this.drawerIsOpen) this.tetherService.dismiss();
        }
    }
}
