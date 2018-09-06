import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { TetherDialog } from "./../../../../modules/common-module/modules/tether-dialog/tether-dialog";
import { AuthenticationService } from './../../../../services/authentication.service';
import { ReportPerformanceService } from './../../../../services/report-performance.service';


@Component({
	selector: 'app-performance-reports-ticket-statistics',
	templateUrl: './performance-reports-ticket-statistics.component.html',
	styleUrls: ['./performance-reports-ticket-statistics.component.scss'],
	providers: [
		ReportPerformanceService,
		{provide: 'ReportPerformanceService1', useClass: ReportPerformanceService },
		{provide: 'ReportPerformanceService2', useClass: ReportPerformanceService },
		{provide: 'ReportPerformanceService3', useClass: ReportPerformanceService },
		{provide: 'ReportPerformanceService4', useClass: ReportPerformanceService },
		{provide: 'ReportPerformanceService5', useClass: ReportPerformanceService },
		{provide: 'ReportPerformanceService6', useClass: ReportPerformanceService },
		{provide: 'ReportPerformanceService7', useClass: ReportPerformanceService },
		{provide: 'ReportPerformanceService8', useClass: ReportPerformanceService },
	],
})
export class PerformanceReportsTicketStatisticsComponent implements OnInit {
	errorMessage: any;
	subscription;

	private pageID: number;

	capacityStatusData;
	netSalesTicketSoldData;
	netSalesData;
	capacityData;
	transactionsData;

	salesChannelsData = {
		leftSide: null,
		rightSide: null,
		itemsCount: 0,
		start: 0,
		end: 5,
	};
	salesChannelsDataByProduct = null;
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
		{value: 0, text: 'Tüm Ürünler'},
	]

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private tetherDialog: TetherDialog,
		private authenticationService: AuthenticationService,
		private reportPerformanceService: ReportPerformanceService,
		@Inject('ReportPerformanceService1') private capacityStatusService: ReportPerformanceService,
		@Inject('ReportPerformanceService2') private netSalesTicketSoldService: ReportPerformanceService,
		@Inject('ReportPerformanceService3') private salesChannelsService: ReportPerformanceService,
		@Inject('ReportPerformanceService4') private netSalesService: ReportPerformanceService,
		@Inject('ReportPerformanceService5') private capacityService: ReportPerformanceService,
		@Inject('ReportPerformanceService6') private transactionsService: ReportPerformanceService,
		@Inject('ReportPerformanceService7') private salesTableService: ReportPerformanceService,
		@Inject('ReportPerformanceService8') private salesGraphService: ReportPerformanceService,
	) {
		// this.reportPerformanceService.setCustomEndpoint("EventSalesGraph", true);
		this.capacityStatusService.setCustomEndpoint("PerformanceCapacityStatus", true);
		this.netSalesTicketSoldService.setCustomEndpoint("PerformanceNetSalesTicketSolds", true);
		this.salesChannelsService.setCustomEndpoint("PerformanceSalesChannel", true);
		this.netSalesService.setCustomEndpoint("PerformanceNetSales", true);
		this.capacityService.setCustomEndpoint("PerformanceCapacity", true);
		this.transactionsService.setCustomEndpoint("PerformanceTransactions", true);
		this.salesTableService.setCustomEndpoint("PerformanceSalesTable", true);
		this.salesGraphService.setCustomEndpoint("PerformanceSalesGraph", true);
	}

	ngOnInit() {
		this.route.parent.parent.params.subscribe(result => {
			this.pageID = +result["id"];
			let user = this.authenticationService.getAuthenticatedUser();
			if(!(user && user.FirmId)){return}

			this.reportPerformanceService.setQueryParams({performanceId: this.pageID, platformId: user.FirmId});
		});

		this.subscription = this.reportPerformanceService.queryParamSubject.subscribe(params => {
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

			this.salesFilterByOptions = [{value: 0, text: 'Tüm Ürünler'}]

			let rows = {};
			let labels = [];
			let labelsLength = response.length;
			response.forEach((item, itemIndex)=>{
				labels.push(item.TransactionDate); //TODO: format date

				item.ProductSales.forEach(productSale=>{
					if (!rows[productSale.ProductName]) {
						rows[productSale.ProductName] = {'Name': productSale.ProductName, data: [], total: 0};
						rows[productSale.ProductName].data[labelsLength-1] = "-";

						// generate salesFilterByOptions
						this.salesFilterByOptions.push({value: productSale.ProductName, text: productSale.ProductName});
					}
					rows[productSale.ProductName].data[itemIndex] = productSale.TotalCategoryDaily;
					rows[productSale.ProductName].total += productSale.TotalCategoryDaily;
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

				item.ProductSales.forEach((eventSale, performanceIndex)=>{
					if (!datas[performanceIndex]) {
						datas[performanceIndex] = {'filterData': eventSale.ProductName, data: []};
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
			if(!(response && response['ProductSalesTicketSolds'])) {return}
			let rows = [];
			let labels = [];
			let totals = {cols: [], TicketSold: 0, Sales: 0, CampaingsDiscount: 0, NetSales: 0}
			let index = 0;
			response["ProductSalesTicketSolds"].forEach((item, itemIndex)=>{

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
			this.salesChannelsDataByProduct = null;
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
						subChannel.Products.forEach(event=>{
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
			// ---------------------- prepare data for product view  -------------------------------
			let dataByPerformance = {};
			response['SalesCategories'].forEach(salesCategory=>{
				salesCategory.SalesChannels.forEach(salesChannel=>{
					salesChannel.SubChannels.forEach(subChannel=>{
						subChannel.Products.forEach(performance=>{
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
			this.salesChannelsDataByProduct = trObjectsByPerformance;
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

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	openReportsMenu(event) {
		let component = {
			title: "DEĞİŞTİR",
			data: [
				{ label: 'Bilet Satış İstatistikleri', action: "statistics"},
				{ label: 'Performans Sayfası Ziyaret Bilgileri', action: 'visitdata'},
				// { label: 'Demografik Dağılımlar', action:'demographic'}
			]
		}

		this.tetherDialog.context(component, {
			overlay:{},
			target: event.target,
			attachment: "top left",
			targetAttachment: "top left",
		}).then(result =>  {
			this.router.navigate(['/performance', this.pageID, 'reports', result.action]);
			console.log("Context Result",result);
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
		this.reportPerformanceService.reload();
	}

	salesTableDataGetFilteredRows(rows){
		if (this.salesFilterBy) {
			return rows.filter(row=>{
				return row.Name == this.salesFilterBy;
			});
		}
		return rows;
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
