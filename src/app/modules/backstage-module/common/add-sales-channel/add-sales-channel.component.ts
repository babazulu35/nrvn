import { Component, OnInit, Input } from '@angular/core';

import { NotificationService } from './../../../../services/notification.service';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { GenericDataService } from './../../../../services/generic-data.service';
import { SalesChannelPaymentTypeService } from '../../../../services/sales-channel-payment-type.service';
import { Router } from '@angular/router';


@Component({
	selector: 'app-add-sales-channel',
	templateUrl: './add-sales-channel.component.html',
	styleUrls: ['./add-sales-channel.component.scss'],
	providers: [GenericDataService, SalesChannelPaymentTypeService]
})
export class AddSalesChannelComponent implements OnInit {

	title = 'Satış Kanalını Düzenle';

	@Input() isEditMode = false;

	@Input() salesChannel: {
		Id?: number,
		Name: string,
		IsActive: boolean,
		PurchaseTimeSeconds: number,
		IsSeatSelectionEnabled: boolean,
		PaymentTypes: any
	};

	isLoading = false;
	paymentTypes = [
		{ name: 'Nakit', id: 1, isActive: false},
		{ name: 'Pos', id: 2, isActive: false},
		{ name: 'Sanal Pos', id: 3, isActive: false},
	];

	sourcePaymentTypes = [];
	salesChannelId: number;

	constructor(
		public tetherService: TetherDialog,
		private router: Router,	
		private notificationService: NotificationService,
		private salesChannelService: GenericDataService,
		private salesChannelPaymentTypeService: SalesChannelPaymentTypeService,
	) {
		this.salesChannelService.setEndpoint('CSalesChannel');
	}

	ngOnInit() {
		this.isEditMode = this.salesChannel != null;

		if (this.isEditMode) {
			this.salesChannelId = this.salesChannel.Id;
			if (this.salesChannel.PaymentTypes && this.salesChannel.PaymentTypes.length) {
				let i: number;
				this.salesChannel.PaymentTypes.forEach(p => {
					i = this.paymentTypes.findIndex(t => t.id === p.PaymentTypeId);
					this.paymentTypes[i].isActive = p.IsActive;
				});
				this.sourcePaymentTypes = this.salesChannel.PaymentTypes.map(x => Object.assign({}, x));
			}
		} else {
			this.title = 'Satış Kanalı Ekle';
			this.salesChannel = {
				Name: '',
				IsActive: false,
				PurchaseTimeSeconds: 0,
				IsSeatSelectionEnabled: false,
				PaymentTypes: null
			};
		}
	}

	public get isValid(): boolean {
		if(this.salesChannel.Name && this.salesChannel.PurchaseTimeSeconds && !this.isLoading) {
			return true;
		}
		return false;
	}

	inputChangeHandler(event:any, name:string, target?:any) {
		target ? target[name] = event : this.salesChannel[name] = event;
	}

	paymentTypeChangedHandler(event: any, paymentType: any) {
		let i = this.paymentTypes.findIndex(p => p.id === paymentType.id);
		this.paymentTypes[i].isActive = event;
	}


	submitClickHandler(event){
		if (!this.isValid) { return }
		this.isLoading = true;
		if (this.isEditMode) {
			this.salesChannelService.update(this.salesChannel).subscribe(
				result => {
					this.updatePaymentTypesOfSalesChannel();
					this.router.navigate(['/sales-channels']);
				},
				error =>{
					this.notificationService.add({type: 'danger', text: error.Message});
					this.isLoading = false;
				});
		} else {
			this.salesChannelService.save(this.salesChannel).subscribe(
				result => {
					let id = result;
					this.addPaymentTypesToSalesChannel(id);
					this.router.navigate(['/sales-channels']);
				},
				error => {
					this.notificationService.add({type: 'danger', text: error.Message});
					this.isLoading = false;
				}
			);
		}
	}

	private addPaymentTypesToSalesChannel(id) {
		let relations = [];

		this.paymentTypes.forEach(p => {
			if (p.isActive) {
				relations.push({
					'SalesChannelId': id,
					'PaymentTypeId': p.id,
					'IsActive': true
				});
			} else {
				relations.push({
					'SalesChannelId': id,
					'PaymentTypeId': p.id,
					'IsActive': false
				});
			}
		});

		if (relations.length > 0) {
			this.salesChannelPaymentTypeService.addPaymentTypes(relations)
						.subscribe(
							response => {
							this.isLoading = false;
							this.tetherService.close({action: 'create'});
						},
							error => {
							this.isLoading = false;
							this.notificationService.add({type: 'danger', text: error.Message});
						}
			);
		}

	}

	private updatePaymentTypesOfSalesChannel() {
		let relationsToUpdate = [],
			relationsToAdd = [];
		let existingPaymentType;

		for (let i = 0; i < this.paymentTypes.length; i++) {
			existingPaymentType = this.sourcePaymentTypes.find(p => p.PaymentTypeId == this.paymentTypes[i].id);
			if (existingPaymentType) {
				if (this.paymentTypes[i].isActive && !existingPaymentType.IsActive) {
					relationsToUpdate.push({
						'SalesChannelId': this.salesChannelId,
						'PaymentTypeId': this.paymentTypes[i].id,
						'IsActive': true	
					});
				} else if (!this.paymentTypes[i].isActive && existingPaymentType.IsActive) {
					relationsToUpdate.push({
						'SalesChannelId': this.salesChannelId,
						'PaymentTypeId': this.paymentTypes[i].id,
						'IsActive': false
					});
				} else {
					continue;
				}
			} else {
				if (this.paymentTypes[i].isActive) {
					relationsToAdd.push({
						'SalesChannelId': this.salesChannelId,
						'PaymentTypeId': this.paymentTypes[i].id,
						'IsActive': true
					});
				}
			}
		}

		if (relationsToUpdate.length > 0) {
			this.salesChannelPaymentTypeService.updatePaymentTypes(relationsToUpdate)
						.subscribe(
							response => {
								if (relationsToAdd.length > 0) {
									this.salesChannelPaymentTypeService.addPaymentTypes(relationsToAdd)
										.subscribe(
											() => {
												this.isLoading = false;
												this.tetherService.close({action: 'update'});
											},
											error => {
												this.isLoading = false;
												this.notificationService.add({type: 'danger', text: error.Message});
										}
									);
								} else {
									this.isLoading = false;
									this.tetherService.close({action: 'update'});
								}
						},
							error => {
							this.isLoading = false;
							this.notificationService.add({type: 'danger', text: error.Message});
						}
			);
		} else if (relationsToAdd.length > 0) {
			this.salesChannelPaymentTypeService.addPaymentTypes(relationsToAdd)
				.subscribe(
					response => {
						this.isLoading = false;
						this.tetherService.close({action: 'update'});
					},
					error => {
						this.isLoading = false;
						this.notificationService.add({type: 'danger', text: error.Message});
				}
			);
		} else {
			this.isLoading = false;
			this.tetherService.close({action: 'update'});
		}
	}
}
