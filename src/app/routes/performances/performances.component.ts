import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { AuthenticationService } from './../../services/authentication.service';
import { Component, OnInit, ElementRef, ViewChild, Renderer, HostBinding, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderTitleService } from '../../services/header-title.service';
import { PerformanceService } from '../../services/performance.service';
import { EntityService } from '../../services/entity.service';
import { Performance } from '../../models/performance';


@Component({
	selector: 'app-performances',
	templateUrl: './performances.component.html',
	styleUrls: ['./performances.component.scss'],
	providers: [PerformanceService, EntityService]
})
export class PerformancesComponent implements OnInit {
	@HostBinding('class.or-performances') true;

	isAuthenticatedRole:boolean;

	errorMessage: any;
	pageSize: number = 10;

	pills: Array<any> = [
		{ text: 'TASLAK', filter: "(Status eq cast('4', Nirvana.Shared.Enums.EventStatus) or Status eq cast('10', Nirvana.Shared.Enums.EventStatus))", isActive: false, type: 'and' },
		{ text: 'SATIŞTA', filter: "Status eq cast('2', Nirvana.Shared.Enums.EventStatus)", isActive: false, type: 'and' },
		{ text: 'SATIŞTA DEĞİL', filter: "(Status eq cast('3', Nirvana.Shared.Enums.EventStatus) or Status eq cast('5', Nirvana.Shared.Enums.EventStatus) or Status eq cast('6', Nirvana.Shared.Enums.EventStatus))", isActive: false, type: 'and' },
		{ text: 'GEÇMİŞ', filter: "Status eq cast('1', Nirvana.Shared.Enums.EventStatus)", isActive: false, type: 'and' }
	];
	tabs: Array<any> = [
		{ label: 'TEK GÜNLÜ ETKİNLİKLER', routerLink: '' },
		{ label: 'ÇOK GÜNLÜ ETKİNLİKLER', routerLink: '' },
		{ label: 'ÇATI ETKİNLİKLERİ', routerLink: '' }
	];
	sortParams: Array<any> = [
		{ text: 'ADA GÖRE', value: JSON.stringify({ sortBy: "PerformanceName", type: "desc" }) },
		{ text: 'TARİHE GÖRE', value: JSON.stringify({ sortBy: "Date", type: "desc" }) }
	];

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private renderer: Renderer,
		private headerTitleService: HeaderTitleService,
		private performanceService: PerformanceService,
		private entityService: EntityService,
		private authenticationService: AuthenticationService,
		private changeDetectorRef: ChangeDetectorRef,
	) {
	}

	ngOnInit(): void {
		this.headerTitleService.setTitle('Performanslar');
		this.headerTitleService.setLink('/performances');
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
	
	onInputChange(event) {
		this.entityService.setSearch({ key: 'Localization/Name', value: event })
	}

	filterPerformances(pill) {
		this.entityService.setFilter(pill);
	}

	changeView(viewType) {
		this.entityService.setActiveViewType(viewType);
	}

	goToLink(link){
		this.router.navigate(['/'+link]);
	}
}
