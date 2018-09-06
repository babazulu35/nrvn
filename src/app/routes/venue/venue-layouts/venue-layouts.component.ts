import { TitleSwitcherComponent } from './../../../modules/common-module/components/title-switcher/title-switcher.component';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { SeatingArrangementCreateComponent } from './../../../modules/backstage-module/common/seating-arrangement-create/seating-arrangement-create.component';
import { Component, OnInit, ComponentFactoryResolver, ViewChild, HostBinding, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TemplateService } from '../../../services/template.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
	selector: 'app-venue-layouts',
	templateUrl: './venue-layouts.component.html',
	styleUrls: ['./venue-layouts.component.scss'],
	entryComponents: [SeatingArrangementCreateComponent],
	providers: [TemplateService]
})
export class VenueLayoutsComponent implements OnInit {
	@ViewChild(TitleSwitcherComponent) contentTitle: TitleSwitcherComponent;

	errorMessage: any;
	subscription;

	templates;
	count: number;

	pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
	pageID: number;
	pageSize: number = 10;
	currentPage: number = 1;

	noDataInContent:boolean = false;
	isLoading: boolean = true;

	objects: Array<string> = [
		"event_seat",
		"wc",
		"local_parking",
		"local_parking",
		"local_parking"
	];
/*	services:Object[] = [
		{icon: "event_seat"},
		{icon: "wc"},
		{icon: "local_parking"},
		{icon: "local_parking"},
		{icon: "local_parking"}
	];*/

	constructor(
		private resolver: ComponentFactoryResolver,
		public tetherService: TetherDialog,
		private route: ActivatedRoute,
		private router: Router,
		private templateService: TemplateService,
		private notificationService: NotificationService
	) { }

	ngOnInit() {
		this.subscription = this.route.parent.params.subscribe(params => {
			let param = +params['id'];
			this.pageID = param;
			this.templateService.setCustomEndpoint('GetVTemplateList')
			this.templateService.setQueryParams({page: this.currentPage, pageSize: this.pageSize, protectedFilter: `VenueId eq ${param}`});
		});

		this.subscription = this.templateService.queryParamSubject.subscribe(
			params => {
				this.noDataInContent = false;
				this.isLoading = true;
				this.updateLocalParams(params);
				this.templateService.gotoPage(params);
			}
		);

		this.templateService.data.subscribe(res => {
			this.templates = res;
			this.isLoading = false;
			this.noDataInContent = this.templates.length == 0;
		});

		this.templateService.count.subscribe(res => {
			this.count = res;
		});
	}

	ngOnDestroy() {
	    this.subscription.unsubscribe();
	}

	updateLocalParams(params: Object = {}) {
	    this.currentPage = params['page'] ? params['page'] : 1
	    this.pageSize = params['pageSize'] ? params['pageSize'] : 10
	}

	onFinderReadyHandler(finderInstance:TitleSwitcherComponent) {
	}

	transistPage(page){
		this.templateService.setPage(page);
	}

	changePageSize(pageSize) {
        this.templateService.setPageSize(pageSize);
    }

	cardActionHandler(event) {
		let cardEvent = event.action;
		console.log(event);
		switch(cardEvent.action){
			case 'editTemplate':
				let navigationExtras: NavigationExtras = {
						queryParams: { 'venueTemplateId': cardEvent.parameters.templateId }
				};
				this.router.navigate(['venue',this.pageID,'template','create'], navigationExtras);
				break;
			case 'activate':
				this.isLoading = true;
				this.templateService.flushCustomEndpoint();
				let activateTemplate = this.templateService.update({Id:cardEvent.parameters.templateId, IsActive:true}, 'patch');
				activateTemplate.subscribe(save => {
					// let template = this.templates.find(temp => {
					// 	return (temp.Id == cardEvent.parameters.templateId)
					// })
					// template.IsActive = true;
					// this.isLoading = false;
					this.templateService.setCustomEndpoint('GetVTemplateList')
					this.templateService.reload();
					this.notificationService.add({type:'success',text:'Mekan yerleşimi aktif hale getirildi.'});
				});
				break;
			case 'deActivate':
				this.isLoading = true;
				this.templateService.flushCustomEndpoint();
				let deActivateTemplate = this.templateService.update({Id:cardEvent.parameters.templateId, IsActive:false}, 'patch');
				deActivateTemplate.subscribe(save => {
					// let template = this.templates.find(temp => {
					// 	return (temp.Id == cardEvent.parameters.templateId)
					// });
					// template.IsActive = false;
					// this.isLoading = false;
					this.templateService.setCustomEndpoint('GetVTemplateList')
					this.templateService.reload();
					this.notificationService.add({type:'success',text:'Mekan yerleşimi pasif hale getirildi.'});
				});
				break;
		}
	}

	openSeatingArrangementCreate() {
		this.tetherService.modal(this.resolver.resolveComponentFactory(SeatingArrangementCreateComponent), {
			dialog: {
				style: {
					width: "50vw",
					height: "auto"
				}
			},
			dismissConfirm: true
		}).then(result => {
			console.log("promise result : ", result);
		}).catch(reason => {
			console.log("dismiss reason : ", reason);
		});
	}
}
