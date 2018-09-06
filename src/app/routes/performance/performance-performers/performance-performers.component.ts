import { NotificationService } from './../../../services/notification.service';
import { PerformanceService } from './../../../services/performance.service';
import { Performance } from './../../../models/performance';
import { Component, OnInit, HostBinding } from '@angular/core';
import {PerformancePerformerService} from '../../../services/performance-performer.service';
import {PerformerService} from '../../../services/performer.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-performance-performers',
	templateUrl: './performance-performers.component.html',
	styleUrls: ['./performance-performers.component.scss'],
	providers:[PerformancePerformerService, PerformerService]
})
export class PerformancePerformersComponent implements OnInit {
	@HostBinding('class.or-performance-performers') true;

	subscription;
	performancePerformers: {}[];
	count: number;
	page: number = 1;
	pageID: number;
	pageSize:number = 10;
	showPagination:boolean = true;

	isLoading : boolean = true;
	noDataInContent:boolean = true;
	isPerformanceProducted:boolean = false;
	hasProgramEntry:boolean = false;

	performance: Performance;
	flags: {PublishDateFieldOn: boolean} = {PublishDateFieldOn: false};

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private notificationService: NotificationService,
		private performanceService: PerformanceService,
		private performerService: PerformerService,
		private performancePerformerService: PerformancePerformerService,
	) { }

	ngOnInit() {
		this.subscription = this.route.parent.params.subscribe(params => {
			this.pageID = params['id'];
			this.performance = null;
			this.isLoading = true;

			this.performancePerformerService.setCustomEndpoint('GetPerformancePerformerList');
			this.performancePerformerService.query({pageSize: this.pageSize}, [{key: 'performanceId', value: this.pageID}]);

			this.performanceService.flushCustomEndpoint();
			this.performanceService.find(this.pageID, true);
		});

		this.performanceService.data.subscribe(performanceData => {
			if(performanceData && performanceData.length > 0) {
				if(!this.performance && performanceData[0]["Localization"]) {
					this.performance = new Performance(performanceData[0]);
					this.flags.PublishDateFieldOn = this.performance.PublishDate != null;
				}
			}
		});

		this.performancePerformerService.data.subscribe(
			result => {
				this.performancePerformers = [];
				result.forEach( performancePerformer => {
					this.performancePerformers.push(performancePerformer);
				});
				this.isLoading = false;
				if(result.length == 0) {
					this.noDataInContent = true
				} else {
					this.noDataInContent = false
				}
			},
			error => {this.noDataInContent = false}
		);

		this.performancePerformerService.count.subscribe(res => {
			this.count = res;
			if((Math.ceil(this.count / this.pageSize)) <= 1 ) {
				this.showPagination  = false;
			} else {
				this.showPagination = true;
			}
		});
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	transistPage(page){
		this.page = page;
		this.isLoading = true;
		this.performancePerformerService.setCustomEndpoint('GetPerformancePerformerList');
		this.performancePerformerService.query({page: this.page, pageSize: this.pageSize, filter: [{filter: `IsActive eq true`}]}, [{key: 'performanceId', value: this.pageID}]);
	}

	onPerformanceProducted(event) {
		switch(event.action.action){
			case("goto"):
				this.router.navigate(['/performance',this.pageID,'performers']);
			break;
		}
	}

	onProgramEntry(event) {
		switch(event.action.action){
			case("goto"):
				this.router.navigate(['/performance',this.pageID,'performers']);
			break;
		}
	}

	cardActionHandler(event){

	}

	checkHandler(value, name:string, target: string = "performance") {
		this[target][name] = value;
		switch(name) {
			case 'PublishDateFieldOn':

			break;
		}
	}

	dateChangeHandler(value, name){
		if(this.performance[name] == value) return;
		if(this.performance) this.performance.set(name, value);
		switch(name) {
			case 'PublishDate':
				this.savePerformance();
			break;
		}
	}

	savePerformance() {
		if(this.isLoading) return;
		this.isLoading = true;
		if(this.performance.Id) {
			this.performanceService.flushCustomEndpoint();
			this.performanceService.update(new Performance(this.performance)).subscribe(
				result => {
					this.notificationService.add({text: `<b>Performans başarıyla güncellendi</b>`, type:'success'});
				},
				error => {
					this.notificationService.add({text: `<b>Performans kaydedilemedi</b><br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
				},
				complete => {
					this.isLoading = false;
				}
			)
		}
	}

}
