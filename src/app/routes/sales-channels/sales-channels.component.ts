import { Component, OnInit, Inject, Injector, ComponentRef, ComponentFactoryResolver } from '@angular/core';
import { Router } from '@angular/router';

import * as moment from 'moment';

import { NotificationService } from '../../services/notification.service';
import { TetherDialog } from './../../modules/common-module/modules/tether-dialog/tether-dialog';
import { AddSalesChannelComponent } from './../../modules/backstage-module/common/add-sales-channel/add-sales-channel.component';
import { AddSalesSubChannelComponent } from './../../modules/backstage-module/common/add-sales-sub-channel/add-sales-sub-channel.component';
import { AddSalesSubChannelTerminalComponent } from './../../modules/backstage-module/common/add-sales-sub-channel-terminal/add-sales-sub-channel-terminal.component';
import { EntityService } from './../../services/entity.service';
import { GenericDataService } from './../../services/generic-data.service';
import { AppSettingsService } from '../../services/app-settings.service';


@Component({
	selector: 'app-sales-channels',
	templateUrl: './sales-channels.component.html',
	styleUrls: ['./sales-channels.component.scss'],
	entryComponents: [AddSalesChannelComponent, AddSalesSubChannelComponent, AddSalesSubChannelTerminalComponent],
	providers: [
		EntityService, GenericDataService, AppSettingsService,
		{provide: 'EntityService1', useClass: EntityService },
		{provide: 'EntityService2', useClass: EntityService },
		{provide: 'EntityService3', useClass: EntityService },
	],
})
export class SalesChannelsComponent implements OnInit {

	subscription;
	errorMessage: any;

	salesChannels = [];
	salesSubChannels = [];
	salesSubChannelTerminals = [];
	promises: {
		salesChannels: boolean,
		salesSubChannels: boolean,
		salesSubChannelTerminals: boolean,
	}

	noDataInContent: boolean = false;
	isLoading: boolean = false;

	terminalEndDateWarningInDays: number;

	constructor(
		private resolver: ComponentFactoryResolver,
		private injector: Injector,
		private router: Router,
		public tether: TetherDialog,
		private notificationService: NotificationService,
		private genericDataService: GenericDataService,
		private entityService: EntityService,
		private appSettings: AppSettingsService,
		private salesChannelService: GenericDataService,
		private salesSubChannelTerminalService: GenericDataService,
		@Inject('EntityService1') private salesChannelEntityService: EntityService,
		@Inject('EntityService2') private salesSubChannelEntityService: EntityService,
		@Inject('EntityService3') private salesSubChannelTerminalEntityService: EntityService,
	) {
		this.entityService.setCustomEndpoint('GetAll');
		this.salesChannelEntityService.setCustomEndpoint('GetAll');
		this.salesSubChannelEntityService.setCustomEndpoint('GetAll');
		this.salesSubChannelTerminalEntityService.setCustomEndpoint('GetAll');
		this.salesChannelService.setEndpoint('CSalesChannel');
		this.salesSubChannelTerminalService.setEndpoint('CSalesSubChannelTerminal');
	}

	ngOnInit() {

		this.terminalEndDateWarningInDays = this.appSettings.getLocalSettings('terminalEndDateWarningInDays') || 15;

		this.subscription = this.entityService.queryParamSubject.subscribe(
			params => {
				this.isLoading = true;
				this.promises = {
					salesChannels: false,
					salesSubChannels: false,
					salesSubChannelTerminals: false
				}

				// ---------------------- sales channels -----------------------
				let query = this.salesChannelEntityService.fromEntity('CSalesChannel')
				.expand(['PaymentTypes'])
					.take(10000).page(1);

				if(params["search"]){
					query.search(params["search"]["key"], params["search"]["value"]);
				}

				query.executeQuery();
				// -------------------------------------------------------------

				// ------------------ sales sub channels -----------------------
				this.salesSubChannelEntityService.fromEntity('CSalesSubChannel')
					.expand(['Parent'])
					.take(10000).page(1).executeQuery();
				// -------------------------------------------------------------

				// ---------------- sales sub channel terminal -----------------
				this.salesSubChannelTerminalEntityService.fromEntity('CSalesSubChannelTerminal')
					// .where('EndDate', '>', (new Date()).toJSON())
					.expand(['Terminal'])
					.expand(['SalesSubChannel'])
					.take(10000).page(1).executeQuery();
			},
			error => this.errorMessage = <any>error
		);

		this.salesChannelEntityService.data.subscribe(
			entities => {
				this.salesChannels = entities;
				this.noDataInContent = this.salesChannels.length == 0;

				this.promises.salesChannels = true;
				this.prepareData();
			},
			error => this.errorMessage = <any>error
		);

		this.salesSubChannelEntityService.data.subscribe(
			entities => {
				this.salesSubChannels = entities;

				this.promises.salesSubChannels = true;
				this.prepareData();
			},
			error => this.errorMessage = <any>error
		);

		this.salesSubChannelTerminalEntityService.data.subscribe(
			entities => {
				this.salesSubChannelTerminals = entities;

				this.promises.salesSubChannelTerminals = true;
				this.prepareData();
			},
			error => this.errorMessage = <any>error
		);
	}

	prepareData(){
		if (this.promises.salesChannels && this.promises.salesSubChannelTerminals && this.promises.salesSubChannels ) {

			// ----------------- bind terminals to subChannels -----------------
			let subChannels = {}
			this.salesSubChannels.forEach(salesSubChannel=>{
				subChannels[salesSubChannel.Id] = {
					self: salesSubChannel,
					newItemLabel: "YENİ TERMİNAL EKLE",
					contextMenu: this.getContextMenu(salesSubChannel, 'sales-sub-channel'),
					title: salesSubChannel.Name,
					items: []
				}
			});

			let beginDate, endDate;
			const now = moment.now();
			const diff = 1000 * 60 * 60 * 24 * this.terminalEndDateWarningInDays;

			this.salesSubChannelTerminals.forEach(item => {
				// .where('EndDate', '>', (new Date()).toJSON())
				
				beginDate = moment(item.BeginDate);
				endDate = moment(item.EndDate);
				if(endDate > moment.now()) {
					if (subChannels[item.SalesSubChannelId]) {
						let subItem = {
							icon: 'memory',
							contextMenu: this.getContextMenu(item, 'sales-sub-channel-terminal'),
							title: item.Terminal.Name,
							info: `${beginDate.format('DD.MM.YYYY, HH:mm')} - ${endDate.format('DD.MM.YYYY, HH:mm')}`,
							isActive: item.IsActive
						};
	
						if (endDate.diff(now) < diff) {
							subItem['infoType'] = 'warning';
						}
	
						subChannels[item.SalesSubChannelId].items.push(subItem);
					}
				}
			});
			// -----------------------------------------------------------------

			// ------------- bind subChannels to parent (channel) --------------
			let channels = {}
			this.salesChannels.forEach(salesChannel=>{
				channels[salesChannel.Id] = salesChannel
				salesChannel.subChannels = []
			});

			Object.keys(subChannels).forEach(key=>{
				let subChannel = subChannels[key];

				if (channels[subChannel.self.ParentId]) {
					channels[subChannel.self.ParentId].subChannels.push(subChannel)
				}
			});
			// -----------------------------------------------------------------

			this.isLoading = false;
		}
	}

	getContextMenu(item, from){
		let menu = [];
		switch (from) {
			case 'sales-channel':
			menu = [{ action: 'edit', icon: 'edit', label: 'Düzenle', item: item, from: from, url: [] }];
			// if (item && item.IsActive) {
			// 	menu.push({ action: 'deactivateSalesChannel', icon: 'edit', label: 'Pasifleştir', item: item, from: from, url: [] });
			// } else {
			// 	menu.push({ action: 'activateSalesChannel', icon: 'edit', label: 'Aktifleştir', item: item, from: from, url: [] });
			// }
			break;
			case 'sales-sub-channel':
				menu = [{ action: 'edit', icon: 'edit', label: 'Düzenle', item: item, from: from, url: [] },
						{ action: 'goto', icon: 'memory', label: 'Eski Terminaller',
						  item: item, from: from, url: ['sales-channels/sub-channel', item.Id, 'terminals']}];
				break;
			case 'sales-sub-channel-terminal':
				menu = [{ action: 'edit', icon: 'edit', label: 'Düzenle', item: item, from: from, url: [] }];
				if (item && item.IsActive) {
					menu.push({ action: 'deactivateTerminal', icon: 'edit', label: 'Pasifleştir', item: item, from: from, url: [] });
				} else {
					menu.push({ action: 'activateTerminal', icon: 'edit', label: 'Aktifleştir', item: item, from: from, url: [] });
				}
				break;
			default:
				menu = [{ action: 'edit', icon: 'edit', label: 'Düzenle', item: item, from: from, url: [] }];
				break;
		}
		return menu;


	}

	onInputChange(value) {
		this.entityService.setSearch({ key: 'Name', value: value });
	}

	expandableTreeBlockActionHandler(event) {
		switch (event.action) {
			case "addNewItem":
				this.openSalesSubChannelModal(event.item);
				break;
			case "addNewSubItem":
				this.openSalesSubChannelTerminalModal(event.item.self);
				break;
			case "goto":
				this.router.navigate(event.url);
				break;
			case "edit":
				switch (event.from) {
					case "sales-channel":
						this.openSalesChannelModal(event.item);
						break;
					case "sales-sub-channel":
						this.openSalesSubChannelModal(event.item.Parent, event.item);
						break;
					case "sales-sub-channel-terminal":
						this.openSalesSubChannelTerminalModal(event.item.SalesSubChannel, event.item);
						break;
				}
				break;
			case 'activateSalesChannel':
			case 'deactivateSalesChannel':
				this.toggleSalesChannel(event.item);
				break;
			case 'activateTerminal':
			case 'deactivateTerminal':
				this.toggleTerminal(event.item);
				break;
		}
	}

	openSalesChannelModal(salesChannel: any = null){
		let component:ComponentRef<AddSalesChannelComponent> = this.resolver.resolveComponentFactory(AddSalesChannelComponent).create(this.injector);
		let box = component.instance;
		box.salesChannel = salesChannel;

		this.tether.modal(component, {
			escapeKeyIsActive: true,
			dialog: {
				style: { maxWidth: "600px", width: "80vw", height: "auto" }
			},
		}).then(result => {
			let message = "";
			switch (result.action) {
				case "create":
					message = "Satış Kanalı Başarı ile Eklendi.";
					break;
				case "update":
					message = "Satış Kanalı Başarı ile Güncellendi.";
					break;
			}
			this.notificationService.add({type: 'success', text: message});
			this.entityService.flushFilter();
		}).catch( reason => {
			console.log(reason);
		});
	}

	openSalesSubChannelModal(salesChannel: any, salesSubChannel: any = null){
		let component:ComponentRef<AddSalesSubChannelComponent> = this.resolver.resolveComponentFactory(AddSalesSubChannelComponent).create(this.injector);
		let box = component.instance;
		box.parent = salesChannel;
		box.salesSubChannel = salesSubChannel;

		this.tether.modal(component, {
			escapeKeyIsActive: true
		}).then(result => {
			let message = "";
			switch (result.action) {
				case "create":
					message = "Alt Satış Kanalı Başarı ile Eklendi.";
					break;
				case "update":
					message = 'Alt Satış Kanalı Başarı ile Güncellendi.';
					break;
			}
			this.notificationService.add({type: 'success', text: message});
			this.entityService.flushFilter();
		}).catch( reason => {
			console.log(reason);
		});
	}

	openSalesSubChannelTerminalModal(salesSubChannel: any, salesSubChannelTerminal: any = null){
		let component: ComponentRef<AddSalesSubChannelTerminalComponent> = this.resolver.resolveComponentFactory(AddSalesSubChannelTerminalComponent).create(this.injector);
		let box = component.instance;
		box.salesSubChannel = salesSubChannel;
		box.salesSubChannelTerminal = salesSubChannelTerminal;
		box.existingTerminals = this.salesSubChannelTerminals.filter(t => t.SalesSubChannelId === salesSubChannel.Id);

		this.tether.modal(component, {
			escapeKeyIsActive: true,
		}).then(result => {
			let message = '';
			switch (result.action) {
				case 'create':
					message = 'Terminal Başarı ile Eklendi.';
					break;
				case 'update':
					message = 'Terminal Başarı ile Güncellendi.';
					break;
			}
			this.notificationService.add({type: 'success', text: message});
			this.entityService.flushFilter();
		}).catch( reason => {
			console.log(reason);
		});
	}

	private toggleSalesChannel(salesChannel) {
		if (salesChannel.IsActive) {
			console.log('deactivate sales channel');
			salesChannel.IsActive = false;
		} else {
			console.log('activate sales channel');
			salesChannel.IsActive = true;
		}

		this.salesChannelService.update(salesChannel).subscribe(
			result => {
				this.isLoading = false;
				this.notificationService.add({type: 'success', text: 'Satış kanalı başarıyla güncellendi.'});
				this.prepareData();
			},
			error => {
				this.isLoading = false;
				this.notificationService.add({type: 'danger', text: 'İşleminiz tamamlanırken bir hata oluştu.'});
			});
	}

	private toggleTerminal(terminal) {
		this.isLoading = true;

		terminal.IsActive = !terminal.IsActive;

		this.salesSubChannelTerminalService.setCustomEndpoint(`${terminal.SalesSubChannel.Id}/${terminal.TerminalId}`);

		this.salesSubChannelTerminalService.update(terminal).subscribe(
			result => {
				this.isLoading = false;
				this.notificationService.add({type: 'success', text: 'Terminal başarıyla güncellendi.'});
				this.prepareData();
			},
			error => {
				this.isLoading = false;
				terminal.IsActive = !terminal.IsActive;
				if (error && error['Type'] && error['Type'] === 2) {
					this.notificationService.add({type: 'danger', text: `${error['ErrorCode']}: ${error['Message']}`});
				} else {
					this.notificationService.add({type: 'danger', text: `İşleminiz gerçekleştirilirken bir hata oluştu.`});
				}
			});
	}
}
