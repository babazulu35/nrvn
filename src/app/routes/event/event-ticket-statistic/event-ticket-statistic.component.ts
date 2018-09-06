import { Component, OnInit, ComponentFactoryResolver, Injector, ComponentRef, ContentChild, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { TetherDialog } from "../../../modules/common-module/modules/tether-dialog/tether-dialog";
import { AuthenticationService } from './../../../services/authentication.service';
import { EntityService } from './../../../services/entity.service';
import { EventService } from './../../../services/event.service';
import { ReportEventService } from '../../../services/report-event.service';
import { ReportParentEventService } from '../../../services/report-parent-event.service';
import { ContextMenuFilterComponent } from './../../../modules/common-module/components/context-menu-filter/context-menu-filter.component';


@Component({
	selector: 'app-event-ticket-statistic',
	templateUrl: './event-ticket-statistic.component.html',
	styleUrls: ['./event-ticket-statistic.component.scss'],
	providers: [
		EntityService,
		ReportEventService,
		{provide: 'ReportEventService1', useClass: ReportEventService },
		{provide: 'ReportEventService2', useClass: ReportEventService },
		{provide: 'ReportEventService3', useClass: ReportEventService },
		{provide: 'ReportEventService4', useClass: ReportEventService },
		{provide: 'ReportEventService5', useClass: ReportEventService },
		{provide: 'ReportEventService6', useClass: ReportEventService },
		{provide: 'ReportEventService7', useClass: ReportEventService },
		{provide: 'ReportEventService8', useClass: ReportEventService },
		ReportParentEventService,
		{provide: 'ReportParentEventService1', useClass: ReportParentEventService },
		{provide: 'ReportParentEventService2', useClass: ReportParentEventService },
		{provide: 'ReportParentEventService3', useClass: ReportParentEventService },
		{provide: 'ReportParentEventService4', useClass: ReportParentEventService },
		{provide: 'ReportParentEventService5', useClass: ReportParentEventService },
		{provide: 'ReportParentEventService6', useClass: ReportParentEventService },
		{provide: 'ReportParentEventService7', useClass: ReportParentEventService },
		{provide: 'ReportParentEventService8', useClass: ReportParentEventService },
	],
	entryComponents: [ContextMenuFilterComponent]
})
export class EventTicketStatisticComponent implements OnInit {

	errorMessage: any;
	private subscription;

	event;
	eventType: string;
	private pageID: number;

	capacityStatusData;
	netSalesTicketSoldData;
	netSalesData;
	capacityData;
	transactionsData;
	ticketPrices = {
		cols: [],
		rows: []
	};

	salesChannelsData = {
		leftSide: null,
		rightSide: null,
		itemsCount: 0,
		start: 0,
		end: 5,
	};
	salesChannelsDataByPerformance = null;
	salesChannelsViewType = "channel"; // enums [channel, performance]

	salesTableData = {
		labels: null,
		rows: null,
		start: 0,
		end: 7,
	};
	salesGraphData: {
		currentState: number,
		label: any[],
		datas: {
			filterData: string,
			borderColor: string,
			data: any[]
		}[]
	}[];

	chartState: number;
	borderColors = ['#FF9BFF', '#FBCA64', '#54DEDE', '#41A200'];
	salesViewType = "table";
	salesTimePeriod = 1; // enums = [1,2,3] => [daily, weekly, monthly]
	salesTimePeriodOptions = [
		{value: 1, text: 'Günlük'},
		{value: 2, text: 'Haftalık'},
		{value: 3, text: 'Aylık'},
	]
	salesFilterBy = 0;
	salesFilterByOptions = [
		{value: 0, text: 'Tüm Performanslar'},
	]

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		public resolver: ComponentFactoryResolver,
		public injector: Injector,
		private tetherDialog: TetherDialog,
		private authenticationService: AuthenticationService,
		private entityService: EntityService,
		private eventService: EventService,
		private reportEventService: ReportEventService,
		private reportParentEventService: ReportParentEventService,
		@Inject('ReportEventService1') private capacityStatusService: ReportEventService,
		@Inject('ReportEventService2') private netSalesTicketSoldService: ReportEventService,
		@Inject('ReportEventService3') private salesChannelsService: ReportEventService,
		@Inject('ReportEventService4') private netSalesService: ReportEventService,
		@Inject('ReportEventService5') private capacityService: ReportEventService,
		@Inject('ReportEventService6') private transactionsService: ReportEventService,
		@Inject('ReportEventService7') private salesTableService: ReportEventService,
		@Inject('ReportEventService8') private salesGraphService: ReportEventService,
		@Inject('ReportParentEventService1') private parentCapacityStatusService: ReportParentEventService,
		@Inject('ReportParentEventService2') private parentNetSalesTicketSoldService: ReportParentEventService,
		@Inject('ReportParentEventService3') private parentSalesChannelsService: ReportParentEventService,
		@Inject('ReportParentEventService4') private parentNetSalesService: ReportParentEventService,
		@Inject('ReportParentEventService5') private parentCapacityService: ReportParentEventService,
		@Inject('ReportParentEventService6') private parentTransactionsService: ReportParentEventService,
		@Inject('ReportParentEventService7') private parentSalesTableService: ReportParentEventService,
		@Inject('ReportParentEventService8') private parentSalesGraphService: ReportParentEventService,
	) {
		this.entityService.setCustomEndpoint('GetAll');

		this.capacityStatusService.setCustomEndpoint("EventCapacityStatus", true);
		this.netSalesTicketSoldService.setCustomEndpoint("EventNetSalesTicketSolds", true);
		this.salesChannelsService.setCustomEndpoint("EventSalesChannel", true);
		this.netSalesService.setCustomEndpoint("EventNetSales", true);
		this.capacityService.setCustomEndpoint("EventCapacity", true);
		this.transactionsService.setCustomEndpoint("EventTransactions", true);
		this.salesTableService.setCustomEndpoint("EventSalesTable", true);
		this.salesGraphService.setCustomEndpoint("EventSalesGraph", true);

		this.parentCapacityStatusService.setCustomEndpoint("ParentEventCapacityStatus", true);
		this.parentNetSalesTicketSoldService.setCustomEndpoint("ParentEventNetSalesTicketSolds", true);
		this.parentSalesChannelsService.setCustomEndpoint("ParentEventSalesChannel", true);
		this.parentNetSalesService.setCustomEndpoint("ParentEventNetSales", true);
		this.parentCapacityService.setCustomEndpoint("ParentEventCapacity", true);
		this.parentTransactionsService.setCustomEndpoint("ParentEventTransactions", true);
		this.parentSalesTableService.setCustomEndpoint("ParentEventSalesTable", true);
		this.parentSalesGraphService.setCustomEndpoint("ParentEventSalesGraph", true);
	}

	ngOnInit() {
		this.route.parent.parent.params.subscribe(params => {
			this.pageID = +params["id"];
		});

		// Dummy Data için
		/*
		this.salesGraphData = [
			{
				currentState:1,
				label: this.chartLabelFix(["15/06 Pzt","16/06 Sa","17/06 Çar","18/06 Perş","19/06 Cum","20/06 Cmt","21/06 Paz"],"string"),

				datas:[
					{filterData:"Two Door Cinema Club",borderColor: "#FF9BFF", data: this.chartLabelFix([200,300,147,621,374,16,674], "number")},
					{filterData:"Django Django",borderColor: "#FBCA64", data: this.chartLabelFix([170,80,75,784,351,452,122],"number")},
					{filterData:"Man with a Plan",borderColor: "#54DEDE", data: this.chartLabelFix([270,280,745,184,251,352,88],"number")},
					{filterData:"HVOB",borderColor: "#41A200", data: this.chartLabelFix([120,180,445,384,651,152,318],"number")}
				]
			},
			{
				currentState:2,
				label: this.chartLabelFix(["22/06 Pzt","23/06 Sa","24/06 Çar","25/06 Perş","26/06 Cum","27/06 Cmt","28/06 Paz"],"string"),
				datas:[
					{filterData:"Two Door Cinema Clubs",borderColor: "#FF9BFF", data: this.chartLabelFix([481,130,47,221,474,146,374], "number")},
					{filterData:"Django Django",borderColor: "#FBCA64", data: this.chartLabelFix([270,180,145,384,251,452,722],"number")},
					{filterData:"Man with a Plan",borderColor: "#54DEDE", data: this.chartLabelFix([170,80,445,284,211,182,128],"number")},
					{filterData:"HVOB",borderColor: "#41A200", data: this.chartLabelFix([120,180,445,384,651,152,318],"number")}
				]
			}
		];
		*/

		// --------------------- parent route service data ---------------------
		this.eventService.data.subscribe(events=>{
			this.event = events[0];

			let user = this.authenticationService.getAuthenticatedUser();
			if(!(user && user.FirmId)){return}

			if(this.event && this.event.ChildEventCount > 0) { // çatı etkinlik
				this.eventType = "master"
				this.reportParentEventService.setQueryParams({parentEventId: this.pageID, platformId: user.FirmId});
				this.prepareForMasterEvent();
			} else {
				this.eventType = "normal"
				this.reportEventService.setQueryParams({eventId: this.pageID, platformId: user.FirmId});
				this.prepareForNormalEvent();
			}

			// ------------------------ Bilet Bedelleri ------------------------
			this.entityService.fromEntity('EPerformance')
				.where('EventId', '=', this.pageID)
				.expand(['Localization'])
				.expand(['Products', 'Product', 'Localization'])
				.expand(['Products', 'Product', 'PriceLists', 'Localization'])
				.expand(['Products', 'Product', 'PriceLists', 'Variants', 'VariantType', 'Localization'])
				.take(40)
				.page(0)
				.executeQuery();

			this.entityService.data.subscribe(entities=>{
				if(!(entities && entities.length)) { return }

				let data = {};
				let priceLists = {}
				entities.forEach(performance=>{
					// performance.Localization.Name
					data[performance.Id] = {
						Name: performance.Localization.Name,
						categories: {}
					}
					performance.Products.forEach(productObject=>{
						let product = productObject.Product;
						// product.Localization.Name
						if (product.PriceLists && product.PriceLists.length) {
							data[performance.Id].categories[product.Id] = {
								Name: product.Localization.Name,
								variants: {}
							}
							product.PriceLists.forEach(priceList=>{
								// priceList.Localization.Name
								if (priceList.Variants && priceList.Variants.length) {
									priceLists[priceList.Id] = {
										Id: priceList.Id,
										Name: priceList.Localization.Name,
									};

									priceList.Variants.forEach(variant=>{
										// variant.VariantType.Localization.Name
										if (!data[performance.Id].categories[product.Id].variants[variant.Id]) {
											data[performance.Id].categories[product.Id].variants[variant.Id] = {
												Name: variant.VariantType.Localization.Name,
												priceLists: {}
											}
										}

										data[performance.Id].categories[product.Id].variants[variant.Id].priceLists[priceList.Id] = {
											Name: priceList.Localization.Name,
											value: variant.DefaultPrice
										}
									});
								}
							});
						}
					});
				});

				// -------------------- calculate rowspans ---------------------
				Object.keys(data).forEach(performanceId=>{
					let performance = data[performanceId];
					performance.rowspan = 0;

					Object.keys(performance.categories).forEach(categoryKey=>{
						let category = performance.categories[categoryKey];

						let keyLength = Object.keys(category.variants).length;
						performance.rowspan += keyLength;
						category.rowspan = keyLength;
					});
				});
				// -------------------------------------------------------------

				// -------- convert pricelists object to array------------------
				let priceListsArray = []
				Object.keys(priceLists).forEach(priceListId=>{
					let priceList = priceLists[priceListId];
					priceListsArray.push({
						Id: priceList.Id,
						Name: priceList.Name
					});
				});
				// -------------------------------------------------------------

				let trObjects = [{cols: [], isLastItem: false}]
				let index = 0;
				Object.keys(data).forEach(performanceId=>{
					let performance = data[performanceId];

					trObjects[index].cols.push({Name: performance.Name, class: 'name', rowspan: performance.rowspan});

					Object.keys(performance.categories).forEach(categoryKey=>{
						let category = performance.categories[categoryKey];

						let variantKeys = Object.keys(category.variants);
						if (variantKeys && variantKeys.length) {
							trObjects[index].cols.push({Name: category.Name, class: 'category', rowspan: category.rowspan});

							variantKeys.forEach((variantKey, variantKeyIndex)=>{
								let variant = category.variants[variantKey];

								trObjects[index].cols.push({Name: variant.Name, class: 'ticket'});

								priceListsArray.forEach(priceList=>{
									let value = variant.priceLists[priceList.Id] ? variant.priceLists[priceList.Id].value : "-"
									trObjects[index].cols.push({Name: value});
								});

								if (variantKeyIndex+1 == variantKeys.length) {
									trObjects[index].isLastItem = true;
								}

								index += 1;
								trObjects[index] = {cols: [], isLastItem: false};
							});
						}
					});
				});
				trObjects.pop();

				this.ticketPrices = {
					cols: priceListsArray,
					rows: trObjects
				}

			}, error => this.errorMessage = error);
			// -----------------------------------------------------------------
		});
		// ---------------------------------------------------------------------
	}

	ngOnDestroy() {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
	}

	private prepareForMasterEvent(){
		this.subscription = this.reportParentEventService.queryParamSubject.subscribe(params => {
			if (!params) { return }

			this.parentCapacityStatusService.fetch(params);
			this.parentNetSalesTicketSoldService.fetch(params);
			this.parentSalesChannelsService.fetch(params);
			this.parentNetSalesService.fetch(params);
			this.parentCapacityService.fetch(params);
			this.parentTransactionsService.fetch(params);
			this.parentSalesTableService.fetch(params, {'timePeriod': this.salesTimePeriod});
			this.parentSalesGraphService.fetch(params, {'timePeriod': this.salesTimePeriod});
		}, error => this.errorMessage = <any>error);


		// Satış Hızı Tablo
		this.parentSalesTableService.data.subscribe(response => {
			this.salesTableData.labels = null;
			this.salesTableData.rows = null;

			this.salesFilterByOptions = [{value: 0, text: 'Tüm Etkinlikler'}]

			let rows = {};
			let labels = [];
			let labelsLength = response.length;
			response.forEach((item, itemIndex)=>{
				labels.push(item.TransactionDate); //TODO: format date

				item.EventSales.forEach(eventSale=>{
					if (!rows[eventSale.EventName]) {
						rows[eventSale.EventName] = {'Name': eventSale.EventName, data: [], total: 0};
						rows[eventSale.EventName].data[labelsLength-1] = "-";

						// generate salesFilterByOptions
						this.salesFilterByOptions.push({value: eventSale.EventName, text: eventSale.EventName});
					}
					rows[eventSale.EventName].data[itemIndex] = eventSale.TotalCategoryDaily;
					rows[eventSale.EventName].total += eventSale.TotalCategoryDaily;
				});
			});

			let rowsAsArray = [];
			Object.keys(rows).forEach(rowKey=>{
				rowsAsArray.push(rows[rowKey]);
			});

			if (rowsAsArray.length && labels.length) {
				this.salesTableData.labels = labels;
				this.salesTableData.rows = rowsAsArray;
			}
		});

		// Satış Hızı Grafik
		this.parentSalesGraphService.data.subscribe(response => {
			this.salesGraphData = [];
			let datas = [];
			let labels = [];
			response.forEach(item=>{
				labels.push(item.TransactionDate); //TODO: format date

				item.EventSales.forEach((eventSale, performanceIndex)=>{
					if (!datas[performanceIndex]) {
						datas[performanceIndex] = {'filterData': eventSale.EventName, data: []};
					}
					datas[performanceIndex].data.push(eventSale.TotalCategoryDaily);
				});
			});

			datas.forEach((item, itemIndex)=>{
				item['borderColor'] = this.borderColors[itemIndex] || "#FF9BFF";
				item.data = this.chartLabelFix(item.data, "number")
			});

			if (datas.length && labels.length) {
				this.salesGraphData = [
					{
						currentState: 1,
						label: this.chartLabelFix(labels, "string"),
						datas: datas
					}
				]
			}
		});

		// Kapasite Bilgileri
		this.parentCapacityStatusService.data.subscribe(response=>{
			this.capacityStatusData = null;
			if(!(response && response['EventCapacityStatues'])) {return}
			this.capacityStatusData = response;
		});

		// Gelir Dağılımı
		this.parentNetSalesTicketSoldService.data.subscribe(response=>{
			this.netSalesTicketSoldData = null;
			if(!(response && response['EventSalesTicketSolds'])) {return}
			let rows = [];
			let labels = [];
			let totals = {cols: [], TicketSold: 0, Sales: 0, CampaingsDiscount: 0, NetSales: 0}
			let index = 0;
			response["EventSalesTicketSolds"].forEach((item, itemIndex)=>{

				// -------------------------- totals ---------------------------
				totals.TicketSold += item.TicketSold;
				totals.Sales += item.Sales;
				totals.CampaingsDiscount += item.CampaingsDiscount;
				totals.NetSales += item.NetSales;
				// -------------------------------------------------------------

				// -------------- categorize -----------------------------------
				item['categories'] = {};
				item.PriceTypes.forEach((priceType, priceTypeIndex)=>{
					if (itemIndex == 0) { labels.push(priceType.Name);}

					priceType.PriceCategories.forEach(priceCategory=>{
						if (!item['categories'][priceCategory.Name]) {item['categories'][priceCategory.Name] = []}
						item['categories'][priceCategory.Name].push(priceCategory.Count);

						if (!totals.cols[priceTypeIndex]) {totals.cols[priceTypeIndex] = 0}
						totals.cols[priceTypeIndex] += priceCategory.Count;
					});
				});
				// -------------------------------------------------------------

				// --------------- creating data to iterate --------------------
				if (!rows[index]) {rows[index] = []}
				rows[index].push({Name: item.Name, class: 'name', colspan: labels.length+5});
				index += 1;

				let keys = Object.keys(item['categories']);
				keys.forEach((key, keyIndex)=>{
					if (!rows[index]) {rows[index] = []}

					rows[index].push({Name: key, class: 'category'});
					item['categories'][key].forEach(value=>{
						rows[index].push({Name: value});
					});

					if (keyIndex == 0) {
						rows[index].push({Name: item.TicketSold, class: "line-total", rowspan: keys.length});
						rows[index].push({Name: item.Sales, rowspan: keys.length, addTRY: true});
						rows[index].push({Name: item.CampaingsDiscount, rowspan: keys.length, insideITag: true});
						rows[index].push({Name: item.NetSales, rowspan: keys.length, insideStrongTag: true});
					}

					index += 1;
				});
				// -------------------------------------------------------------
			});

			if (rows.length && labels.length) {
				this.netSalesTicketSoldData = {
					labels: labels,
					rows: rows,
					totals: totals,
				}
			}
		});

		// Satış Kanalları
		this.parentSalesChannelsService.data.subscribe(response=>{
			this.salesChannelsData.leftSide = null;
			this.salesChannelsData.rightSide = null;
			this.salesChannelsDataByPerformance = null;
			if (!(response && response["SalesCategories"] && response["SalesCategories"].length)) { return }

			// -------------------------------------------------------------------------------------
			// ------------------------ prepare data for channel view  -----------------------------
			let totalRowCount = 0;
			// ---------------- Calculation for rowspans -----------------------
			response['SalesCategories'].forEach(salesCategory=>{
				salesCategory['total'] = 0;
				salesCategory.SalesChannels.forEach(salesChannel=>{
					salesChannel['total'] = salesChannel.SubChannels.length;
					salesCategory['total'] += salesChannel['total'];

					totalRowCount += salesChannel.SubChannels.length;

					// ---- determine list item for line-border ----
					salesChannel.SubChannels[salesChannel.SubChannels.length-1]['isLastItem'] = true;
				});
			});
			// -----------------------------------------------------------------

			let dataObject = {};
			// ------------- generate left side of the table -------------------
			let trObjects = [{cols: [], isLastItem: false}];
			let index = 0;
			response['SalesCategories'].forEach(salesCategory=>{
				// push td
				trObjects[index].cols.push({Name: salesCategory.Name, class: "category", rowspan: salesCategory['total']});

				salesCategory.SalesChannels.forEach(salesChannel=>{
					// push td
					trObjects[index].cols.push({Name: salesChannel.Name, class: "sub-category", rowspan: salesChannel['total']});

					salesChannel.SubChannels.forEach(subChannel=>{
						// push td
						trObjects[index].cols.push({Name: subChannel.Name, class: "ticket"});
						trObjects[index].isLastItem = subChannel['isLastItem']

						// ----------------- group events data -----------------
						subChannel.Events.forEach(event=>{
							if (!dataObject[event.Name]) {dataObject[event.Name] = []}
							dataObject[event.Name][index] = event.CategoryTicketsSold
						});
						// -----------------------------------------------------

						// ----------------- generate new row ------------------
						index += 1;
						if (index < totalRowCount ) {
							trObjects[index] = {cols: [], isLastItem: false}
						}
						// -----------------------------------------------------
					});
				});
			});
			// -----------------------------------------------------------------

			// ------------- generate right side of the table -------------------
			let dataLabels = []
			let trDatas = [];
			let keysLength = Object.keys(dataObject).length;
			Object.keys(dataObject).forEach((key, keyIndex)=>{
				dataLabels.push(key);
				let datas = dataObject[key];
				datas.forEach((data, dataIndex)=>{
					if (!trDatas[dataIndex]) {trDatas[dataIndex] = []; trDatas[dataIndex][keysLength-1]= "-";}
					trDatas[dataIndex][keyIndex] = data;
				});
			});
			// -----------------------------------------------------------------

			this.salesChannelsData['itemsCount'] = keysLength;
			this.salesChannelsData['leftSide'] = trObjects;
			this.salesChannelsData['rightSide'] = {
					labels: dataLabels,
					data: trDatas
				}
			// -------------------------------------------------------------------------------------
			// -------------------------------------------------------------------------------------

			// -------------------------------------------------------------------------------------
			// ---------------------- prepare data for performance view  ---------------------------
			let dataByPerformance = {};
			response['SalesCategories'].forEach(salesCategory=>{
				salesCategory.SalesChannels.forEach(salesChannel=>{
					salesChannel.SubChannels.forEach(subChannel=>{
						subChannel.Events.forEach(event=>{
							if (!dataByPerformance[event.Name]) {
								dataByPerformance[event.Name] = {items: {}, rowspan: 0};
							}
							if (!dataByPerformance[event.Name].items[salesCategory.Name]) {
								dataByPerformance[event.Name].items[salesCategory.Name] = {items: {}, rowspan: 0};
							}
							if (!dataByPerformance[event.Name].items[salesCategory.Name].items[salesChannel.Name]) {
								dataByPerformance[event.Name].items[salesCategory.Name].items[salesChannel.Name] = {items: {}, rowspan: 0};
							}

							dataByPerformance[event.Name].items[salesCategory.Name].items[salesChannel.Name].items[subChannel.Name] = event.CategoryTicketsSold;
						});
					});
				});
			});

			Object.keys(dataByPerformance).forEach(itemKey=>{

				let salesCategories = dataByPerformance[itemKey].items;
				Object.keys(salesCategories).forEach(salesCategoryKey=>{

					let salesChannels = salesCategories[salesCategoryKey].items;
					Object.keys(salesChannels).forEach(salesChannelKey=>{

						let subChannelsKeysLength = Object.keys(salesChannels[salesChannelKey].items).length;

						dataByPerformance[itemKey]['rowspan'] += subChannelsKeysLength;
						salesCategories[salesCategoryKey]['rowspan'] += subChannelsKeysLength;
						salesChannels[salesChannelKey]['rowspan'] = subChannelsKeysLength;
					});
				});
			});

			let trObjectsByPerformance = [{cols: [], isLastItem: false}];
			index = 0;
			Object.keys(dataByPerformance).forEach(performanceKey=>{
				trObjectsByPerformance[index].cols.push({Name: performanceKey, class: "name", rowspan: dataByPerformance[performanceKey].rowspan});

				let salesCategories = dataByPerformance[performanceKey].items;
				Object.keys(salesCategories).forEach(salesCategoryKey=>{
					trObjectsByPerformance[index].cols.push({Name: salesCategoryKey, class: "category", rowspan: salesCategories[salesCategoryKey].rowspan});

					let salesChannels = salesCategories[salesCategoryKey].items;
					Object.keys(salesChannels).forEach(salesChannelKey=>{
						trObjectsByPerformance[index].cols.push({Name: salesChannelKey, class: "sub-category", rowspan: salesChannels[salesChannelKey].rowspan});

						let subChannels = salesChannels[salesChannelKey].items;
						let subChannelsKeys = Object.keys(subChannels);
						subChannelsKeys.forEach((subChannelKey, subChannelKeyIndex)=>{
							trObjectsByPerformance[index].cols.push({Name: subChannelKey, class: "ticket"});
							trObjectsByPerformance[index].cols.push({Name: subChannels[subChannelKey]});

							if ((subChannelsKeys.length-1) == subChannelKeyIndex) {
								trObjectsByPerformance[index].isLastItem = true;
							}

							index += 1;
							trObjectsByPerformance[index] = {cols: [], isLastItem: false}
						});
					});
				});
			});
			this.salesChannelsDataByPerformance = trObjectsByPerformance;
			// -------------------------------------------------------------------------------------
			// -------------------------------------------------------------------------------------
		});

		// ------------------------------ Sidebar ------------------------------
		this.parentNetSalesService.data.subscribe(response=>{
			this.netSalesData = response;
		});

		this.parentCapacityService.data.subscribe(response=>{
			this.capacityData = response;
		});

		this.parentTransactionsService.data.subscribe(response=>{
			this.transactionsData = response;
		});
		// ---------------------------------------------------------------------
	}

	private prepareForNormalEvent(){
		this.subscription = this.reportEventService.queryParamSubject.subscribe(params => {
			if (!params) { return }

			this.capacityStatusService.fetch(params);
			this.netSalesTicketSoldService.fetch(params);
			this.salesChannelsService.fetch(params);
			this.netSalesService.fetch(params);
			this.capacityService.fetch(params);
			this.transactionsService.fetch(params);
			this.salesTableService.fetch(params, {'timePeriod': this.salesTimePeriod});
			this.salesGraphService.fetch(params, {'timePeriod': this.salesTimePeriod});
		}, error => this.errorMessage = <any>error);

		// Satış Hızı Tablo
		this.salesTableService.data.subscribe(response => {
			this.salesTableData.labels = null;
			this.salesTableData.rows = null;

			this.salesFilterByOptions = [{value: 0, text: 'Tüm Performanslar'}]

			let rows = {};
			let labels = [];
			let labelsLength = response.length;
			response.forEach((item, itemIndex)=>{
				labels.push(item.TransactionDate); //TODO: format date

				item.EventSales.forEach(eventSale=>{
					if (!rows[eventSale.PerformanceName]) {
						rows[eventSale.PerformanceName] = {'Name': eventSale.PerformanceName, data: [], total: 0};
						rows[eventSale.PerformanceName].data[labelsLength-1] = "-";

						// generate salesFilterByOptions
						this.salesFilterByOptions.push({value: eventSale.PerformanceName, text: eventSale.PerformanceName});
					}
					rows[eventSale.PerformanceName].data[itemIndex] = eventSale.TotalCategoryDaily;
					rows[eventSale.PerformanceName].total += eventSale.TotalCategoryDaily;
				});
			});

			let rowsAsArray = [];
			Object.keys(rows).forEach(rowKey=>{
				rowsAsArray.push(rows[rowKey]);
			});

			if (rowsAsArray.length && labels.length) {
				this.salesTableData.labels = labels;
				this.salesTableData.rows = rowsAsArray;
			}
		});

		// Satış Hızı Grafik
		this.salesGraphService.data.subscribe(response => {
			this.salesGraphData = [];
			let datas = [];
			let labels = [];
			response.forEach(item=>{
				labels.push(item.TransactionDate); //TODO: format date

				item.EventSales.forEach((eventSale, performanceIndex)=>{
					if (!datas[performanceIndex]) {
						datas[performanceIndex] = {'filterData': eventSale.PerformanceName, data: []};
					}
					datas[performanceIndex].data.push(eventSale.TotalCategoryDaily);
				});
			});

			datas.forEach((item, itemIndex)=>{
				item['borderColor'] = this.borderColors[itemIndex] || "#FF9BFF";
				item.data = this.chartLabelFix(item.data, "number")
			});

			if (datas.length && labels.length) {
				this.salesGraphData = [
					{
						currentState: 1,
						label: this.chartLabelFix(labels, "string"),
						datas: datas
					}
				]
			}
		});

		// Kapasite Bilgileri
		this.capacityStatusService.data.subscribe(response=>{
			this.capacityStatusData = null;
			if(!(response && response['EventCapacityStatues'])) {return}
			this.capacityStatusData = response;
		});

		// Gelir Dağılımı
		this.netSalesTicketSoldService.data.subscribe(response=>{
			this.netSalesTicketSoldData = null;
			if(!(response && response['PerformanceSalesTicketSolds'])) {return}
			let rows = [];
			let labels = [];
			let totals = {cols: [], TicketSold: 0, Sales: 0, CampaingsDiscount: 0, NetSales: 0}
			let index = 0;
			response["PerformanceSalesTicketSolds"].forEach((item, itemIndex)=>{

				// -------------------------- totals ---------------------------
				totals.TicketSold += item.TicketSold;
				totals.Sales += item.Sales;
				totals.CampaingsDiscount += item.CampaingsDiscount;
				totals.NetSales += item.NetSales;
				// -------------------------------------------------------------

				// -------------- categorize -----------------------------------
				item['categories'] = {};
				item.PriceTypes.forEach((priceType, priceTypeIndex)=>{
					if (itemIndex == 0) { labels.push(priceType.Name);}

					priceType.PriceCategories.forEach(priceCategory=>{
						if (!item['categories'][priceCategory.Name]) {item['categories'][priceCategory.Name] = []}
						item['categories'][priceCategory.Name].push(priceCategory.Count);

						if (!totals.cols[priceTypeIndex]) {totals.cols[priceTypeIndex] = 0}
						totals.cols[priceTypeIndex] += priceCategory.Count;
					});
				});
				// -------------------------------------------------------------

				// --------------- creating data to iterate --------------------
				if (!rows[index]) {rows[index] = []}
				rows[index].push({Name: item.Name, class: 'name', colspan: labels.length+5});
				index += 1;

				let keys = Object.keys(item['categories']);
				keys.forEach((key, keyIndex)=>{
					if (!rows[index]) {rows[index] = []}

					rows[index].push({Name: key, class: 'category'});
					item['categories'][key].forEach(value=>{
						rows[index].push({Name: value});
					});

					if (keyIndex == 0) {
						rows[index].push({Name: item.TicketSold, class: "line-total", rowspan: keys.length});
						rows[index].push({Name: item.Sales, rowspan: keys.length, addTRY: true});
						rows[index].push({Name: item.CampaingsDiscount, rowspan: keys.length, insideITag: true});
						rows[index].push({Name: item.NetSales, rowspan: keys.length, insideStrongTag: true});
					}

					index += 1;
				});
				// -------------------------------------------------------------
			});

			if (rows.length && labels.length) {
				this.netSalesTicketSoldData = {
					labels: labels,
					rows: rows,
					totals: totals,
				}
			}
		});

		// Satış Kanalları
		this.salesChannelsService.data.subscribe(response=>{
			this.salesChannelsData.leftSide = null;
			this.salesChannelsData.rightSide = null;
			this.salesChannelsDataByPerformance = null;
			if (!(response && response["SalesCategories"] && response["SalesCategories"].length)) { return }

			// -------------------------------------------------------------------------------------
			// ------------------------ prepare data for channel view  -----------------------------
			let totalRowCount = 0;
			// ---------------- Calculation for rowspans -----------------------
			response['SalesCategories'].forEach(salesCategory=>{
				salesCategory['total'] = 0;
				salesCategory.SalesChannels.forEach(salesChannel=>{
					salesChannel['total'] = salesChannel.SubChannels.length;
					salesCategory['total'] += salesChannel['total'];

					totalRowCount += salesChannel.SubChannels.length;

					// ---- determine list item for line-border ----
					salesChannel.SubChannels[salesChannel.SubChannels.length-1]['isLastItem'] = true;
				});
			});
			// -----------------------------------------------------------------

			let dataObject = {};
			// ------------- generate left side of the table -------------------
			let trObjects = [{cols: [], isLastItem: false}];
			let index = 0;
			response['SalesCategories'].forEach(salesCategory=>{
				// push td
				trObjects[index].cols.push({Name: salesCategory.Name, class: "category", rowspan: salesCategory['total']});

				salesCategory.SalesChannels.forEach(salesChannel=>{
					// push td
					trObjects[index].cols.push({Name: salesChannel.Name, class: "sub-category", rowspan: salesChannel['total']});

					salesChannel.SubChannels.forEach(subChannel=>{
						// push td
						trObjects[index].cols.push({Name: subChannel.Name, class: "ticket"});
						trObjects[index].isLastItem = subChannel['isLastItem']

						// ----------------- group events data -----------------
						subChannel.Performances.forEach(event=>{
							if (!dataObject[event.Name]) {dataObject[event.Name] = []}
							dataObject[event.Name][index] = event.CategoryTicketsSold
						});
						// -----------------------------------------------------

						// ----------------- generate new row ------------------
						index += 1;
						if (index < totalRowCount ) {
							trObjects[index] = {cols: [], isLastItem: false}
						}
						// -----------------------------------------------------
					});
				});
			});
			// -----------------------------------------------------------------

			// ------------- generate right side of the table -------------------
			let dataLabels = []
			let trDatas = [];
			let keysLength = Object.keys(dataObject).length;
			Object.keys(dataObject).forEach((key, keyIndex)=>{
				dataLabels.push(key);
				let datas = dataObject[key];
				datas.forEach((data, dataIndex)=>{
					if (!trDatas[dataIndex]) {trDatas[dataIndex] = []; trDatas[dataIndex][keysLength-1]= "-";}
					trDatas[dataIndex][keyIndex] = data;
				});
			});
			// -----------------------------------------------------------------

			this.salesChannelsData['itemsCount'] = keysLength;
			this.salesChannelsData['leftSide'] = trObjects;
			this.salesChannelsData['rightSide'] = {
					labels: dataLabels,
					data: trDatas
				}
			// -------------------------------------------------------------------------------------
			// -------------------------------------------------------------------------------------


			// -------------------------------------------------------------------------------------
			// ---------------------- prepare data for performance view  ---------------------------
			let dataByPerformance = {};
			response['SalesCategories'].forEach(salesCategory=>{
				salesCategory.SalesChannels.forEach(salesChannel=>{
					salesChannel.SubChannels.forEach(subChannel=>{
						subChannel.Performances.forEach(performance=>{
							if (!dataByPerformance[performance.Name]) {
								dataByPerformance[performance.Name] = {items: {}, rowspan: 0};
							}
							if (!dataByPerformance[performance.Name].items[salesCategory.Name]) {
								dataByPerformance[performance.Name].items[salesCategory.Name] = {items: {}, rowspan: 0};
							}
							if (!dataByPerformance[performance.Name].items[salesCategory.Name].items[salesChannel.Name]) {
								dataByPerformance[performance.Name].items[salesCategory.Name].items[salesChannel.Name] = {items: {}, rowspan: 0};
							}

							dataByPerformance[performance.Name].items[salesCategory.Name].items[salesChannel.Name].items[subChannel.Name] = performance.CategoryTicketsSold;
						});
					});
				});
			});

			Object.keys(dataByPerformance).forEach(itemKey=>{

				let salesCategories = dataByPerformance[itemKey].items;
				Object.keys(salesCategories).forEach(salesCategoryKey=>{

					let salesChannels = salesCategories[salesCategoryKey].items;
					Object.keys(salesChannels).forEach(salesChannelKey=>{

						let subChannelsKeysLength = Object.keys(salesChannels[salesChannelKey].items).length;

						dataByPerformance[itemKey]['rowspan'] += subChannelsKeysLength;
						salesCategories[salesCategoryKey]['rowspan'] += subChannelsKeysLength;
						salesChannels[salesChannelKey]['rowspan'] = subChannelsKeysLength;
					});
				});
			});

			let trObjectsByPerformance = [{cols: [], isLastItem: false}];
			index = 0;
			Object.keys(dataByPerformance).forEach(performanceKey=>{
				trObjectsByPerformance[index].cols.push({Name: performanceKey, class: "name", rowspan: dataByPerformance[performanceKey].rowspan});

				let salesCategories = dataByPerformance[performanceKey].items;
				Object.keys(salesCategories).forEach(salesCategoryKey=>{
					trObjectsByPerformance[index].cols.push({Name: salesCategoryKey, class: "category", rowspan: salesCategories[salesCategoryKey].rowspan});

					let salesChannels = salesCategories[salesCategoryKey].items;
					Object.keys(salesChannels).forEach(salesChannelKey=>{
						trObjectsByPerformance[index].cols.push({Name: salesChannelKey, class: "sub-category", rowspan: salesChannels[salesChannelKey].rowspan});

						let subChannels = salesChannels[salesChannelKey].items;
						let subChannelsKeys = Object.keys(subChannels);
						subChannelsKeys.forEach((subChannelKey, subChannelKeyIndex)=>{
							trObjectsByPerformance[index].cols.push({Name: subChannelKey, class: "ticket"});
							trObjectsByPerformance[index].cols.push({Name: subChannels[subChannelKey]});

							if ((subChannelsKeys.length-1) == subChannelKeyIndex) {
								trObjectsByPerformance[index].isLastItem = true;
							}

							index += 1;
							trObjectsByPerformance[index] = {cols: [], isLastItem: false}
						});
					});
				});
			});
			this.salesChannelsDataByPerformance = trObjectsByPerformance;
			// -------------------------------------------------------------------------------------
			// -------------------------------------------------------------------------------------
		});

		// ------------------------------ Sidebar ------------------------------
		this.netSalesService.data.subscribe(response=>{
			this.netSalesData = response;
		});

		this.capacityService.data.subscribe(response=>{
			this.capacityData = response;
		});

		this.transactionsService.data.subscribe(response=>{
			this.transactionsData = response;
		});
		// ---------------------------------------------------------------------
	}

	openReportsMenu(event) {
		let instance = {
			title: "DEĞİŞTİR",
			data: [
				{ label: 'Bilet Satış İstatistikleri', action: "statistics"},
				{ label: 'Etkinlik Sayfası Ziyaret Bilgileri', action: 'visitdata'},
				// { label: 'Demografik Dağılımlar', action:'demographic'}
			]
		};

		this.tetherDialog.context(instance, {
			overlay:{},
			target: event.target,
			attachment: "top left",
			targetAttachment: "top left",
		}).then(result =>  {
			this.router.navigate(['event', this.pageID, 'reports', result.action]);
			console.log("Context Result",result);
		}).catch(reason => {});
	}

	openChartFilterMenu(event) {
		let component: ComponentRef<ContextMenuFilterComponent> = this.resolver.resolveComponentFactory(ContextMenuFilterComponent).create(this.injector);
		let instance: ContextMenuFilterComponent = component.instance;

		instance.title = "FİLTRELE";
		instance.data = [
			{ label: 'Two Door Cinema Club',color:"#FF9BFF",icon:"fiber_manual_record", action: "statistics"},
			{ label: 'Django Django', color:"#FBCA64",icon:"fiber_manual_record", action: 'visitdata'},
			{ label: 'Man With Plan', color:"#54DEDE",icon:"fiber_manual_record", action:'demographic'},
			{ label: 'HVOB', color:"#41A200",icon:"fiber_manual_record", action:'demographic'},
			{ label: 'Astrofella', color:"#BADDFF",icon:"fiber_manual_record", action:'demographic'}
		];

		this.tetherDialog.context(component, {
			target: event.target,
			attachment:"top right",
			targetAttachment:"top right",
		}).then(result => {
			console.log('filter result',result);
		}).catch(reason => {});
	}

	salesChannelsDataMoveNext() {
		let nextStart = this.salesChannelsData.start + 5;
		if(nextStart < this.salesChannelsData.itemsCount) {
			this.salesChannelsData.start = nextStart;
			this.salesChannelsData.end = nextStart + 5;
		}
	}

	salesChannelsDataMovePrev() {
		let nextStart = this.salesChannelsData.start - 5;
		if(nextStart >= 0) {
			this.salesChannelsData.start = nextStart;
			this.salesChannelsData.end = nextStart + 5;
		}
	}

	salesTimePeriodChange(event){
		this.salesTimePeriod = event;
		if (this.eventType == "master") {
			this.reportParentEventService.reload();
		} else {
			this.reportEventService.reload();
		}
	}

	salesTableDataGetFilteredRows(rows){
		if (this.salesFilterBy) {
			return rows.filter(row=>{
				return row.Name == this.salesFilterBy;
			});
		}
		return rows;
	}

	salesFilterByChange(event){
		console.log("<-------event------->", event);
	}

	salesTableDataMoveNext() {
		let nextStart = this.salesTableData.start + 7;
		if(this.salesTableData.labels && (nextStart < this.salesTableData.labels.length)) {
			this.salesTableData.start = nextStart;
			this.salesTableData.end = nextStart + 7;
		}
	}

	salesTableDataMovePrev() {
		let nextStart = this.salesTableData.start - 7;
		if(nextStart >= 0) {
			this.salesTableData.start = nextStart;
			this.salesTableData.end = nextStart + 7;
		}
	}

	chartLabelFix(label:any,type:string):any[] {
		// Ux için Yapıldı
		if(type=="string") {
			// Add empty space to last element
			label.splice(label.length,0,"");
			// Add empty space to first element
			label.splice(0,0,"");
			return label;

		} else if ( type=="number") {
			label.splice(label.length,0,null);
			// Add empty space to first element
			label.splice(0,0,null);
			return label;
		}
	}

	chartEventHandler(event) {
		this.chartState = event;
	}
}
