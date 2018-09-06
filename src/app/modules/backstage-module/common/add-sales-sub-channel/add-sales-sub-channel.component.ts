import { Component, OnInit, Input } from '@angular/core';

import { NotificationService } from './../../../../services/notification.service';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { GenericDataService } from './../../../../services/generic-data.service';


@Component({
	selector: 'app-add-sales-sub-channel',
	templateUrl: './add-sales-sub-channel.component.html',
	styleUrls: ['./add-sales-sub-channel.component.scss'],
	providers: [GenericDataService]
})
export class AddSalesSubChannelComponent implements OnInit {

	title: string;

	@Input() isEditMode: boolean = false;

	@Input() parent: any;
	@Input() salesSubChannel: {
		Name: string,
		ParentId: number
	};

	isLoading: boolean = false;

	constructor(
		public tetherService: TetherDialog,
		private notificationService: NotificationService,
		private salesSubChannelService: GenericDataService,
	) {
		this.salesSubChannelService.setEndpoint('CSalesSubChannel');
	}

	ngOnInit() {
		this.isEditMode = this.salesSubChannel != null;

		this.title = `${this.parent.Name}`

		if(!this.isEditMode) {
			this.title = "Alt Satış Kanalı Ekle";
			this.salesSubChannel = {
				Name: "",
				ParentId: this.parent.Id
			}
		}
	}

	public get isValid(): boolean {
		if(this.salesSubChannel.Name && !this.isLoading) {
			return true;
		}
		return false;
	}

	inputChangeHandler(event:any, name:string, target?:any) {
		target ? target[name] = event : this.salesSubChannel[name] = event;
	}


	submitClickHandler(event){
		if (!this.isValid) { return }

		this.isLoading = true;
		if (this.isEditMode) {
			this.salesSubChannelService.update(this.salesSubChannel).subscribe(
				result=>{
					this.isLoading = false;
					this.tetherService.close({action: "update"});
				},
				error =>{
					this.notificationService.add({type: 'danger', text: error.Message});
					this.isLoading = false;
				});
		} else {
			this.salesSubChannelService.save(this.salesSubChannel).subscribe(
				result=> {
					this.isLoading = false;
					this.tetherService.close({action: "create"});
				},
				error=> {
					this.notificationService.add({type: 'danger', text: error.Message});
					this.isLoading = false;
				}
			);
		}
	}
}
