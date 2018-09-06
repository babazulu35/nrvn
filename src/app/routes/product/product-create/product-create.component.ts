import { AuthenticationService } from './../../../services/authentication.service';
import { LocalizationPipe } from './../../../pipes/localization.pipe';
import { AppSettingsService } from './../../../services/app-settings.service';
import { Firm } from './../../../models/firm';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { MultiSelectGroupComponent } from './../../../modules/common-module/components/multi-select-group/multi-select-group.component';
import { VenueTemplateEditorComponent } from './../../../modules/common-module/components/venue-template-editor/venue-template-editor.component';
import { PerformanceCapacitySearchSelectComponent } from './../../../modules/backstage-module/components/performance-capacity-search-select/performance-capacity-search-select.component';
import { ProductSearchSelectComponent } from './../../../modules/backstage-module/components/product-search-select/product-search-select.component';
import { ProductPriceBlockComponent } from './../../../modules/backstage-module/components/product-price-block/product-price-block.component';
import { CapacityEditorComponent } from './../../../modules/common-module/common/capacity-editor/capacity-editor.component';
import { ProductSelectionTypeService } from './../../../services/product-selection-type.service';
import { ProductSelectionType } from './../../../models/product-selection-type';
import { VariantPrice } from './../../../models/variant-price';
import { VariantPriceService } from './../../../services/variant-price.service';
import { VariantService } from './../../../services/variant.service';
import { Variant } from './../../../models/variant';
import { PriceListService } from './../../../services/price-list.service';
import { PriceList } from './../../../models/price-list';
import { VenueSeatService } from './../../../services/venue-seat.service';
import { VenueSeat } from './../../../models/venue-seat';
import { ProductProductService } from './../../../services/product-product.service';
import { ProductProduct } from './../../../models/product-product';
import { PerformanceProductService } from './../../../services/performance-product.service';
import { NotificationService } from './../../../services/notification.service';
import { Performance } from './../../../models/performance';
import { EntityService } from './../../../services/entity.service';
import { PerformanceProduct } from './../../../models/performance-product';
import { PerformanceStatus } from './../../../models/performance-status.enum';
import { Product } from './../../../models/product';
import { ProductService } from './../../../services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderTitleService } from './../../../services/header-title.service';
import { Component, OnInit, ChangeDetectorRef, ViewChild, Inject, ViewChildren, QueryList, ComponentRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { partial, uniqueId, cloneDeep } from 'lodash';
import { NextPriceInfo } from '../../../models/next-price-info';

@Component({
	selector: 'app-product-create',
	templateUrl: './product-create.component.html',
	styleUrls: ['./product-create.component.scss'],
	providers: [
		{ provide: 'productEntityService', useClass: EntityService },
		{ provide: 'performanceEntityService', useClass: EntityService },
		{ provide: 'productProductEntityService', useClass: EntityService },
		{ provide: 'performanceProductEntityService', useClass: EntityService },
		{ provide: 'currencyEntityService', useClass: EntityService },
		{ provide: 'variantTypeEntityService', useClass: EntityService },
		{ provide: 'venueSeatEntityService', useClass: EntityService },
		ProductService, EntityService, PerformanceProductService, ProductProductService, VenueSeatService, PriceListService, VariantService, VariantPriceService, ProductSelectionTypeService
	],
	entryComponents: [CapacityEditorComponent]
})
export class ProductCreateComponent implements OnInit {
	@ViewChild(MultiSelectGroupComponent) typeSelector: MultiSelectGroupComponent;
	@ViewChild(VenueTemplateEditorComponent) venueEditor: VenueTemplateEditorComponent;
	@ViewChild(PerformanceCapacitySearchSelectComponent) performanceCapacitySearchSelect: PerformanceCapacitySearchSelectComponent;
	@ViewChild(ProductSearchSelectComponent) productSearchSelect: ProductSearchSelectComponent;
	@ViewChildren(ProductPriceBlockComponent) priceBlocks: QueryList<ProductPriceBlockComponent>;

  	role: string = 'create';
	isEditMode: boolean = false;
	isBundle: boolean = false;
	isLoading: boolean;
	isPromising: boolean;
	editorIsShown: boolean = false;
	onSaveComplete: any;
	title: string;

	product: Product;
	performanceProduct: PerformanceProduct;
	performance: Performance;
	firm: Firm;
	products: Product[];
	venueSeats: VenueSeat[];
	selectedSeats: {}[];
	currencyList: { value: any, text: string, name?: string }[];
	selectedCurrency: { value: any, text: string, name?: string };
	variantTypeList: { value: any, text: string }[];
	vatList: { value: any, text: string }[];
	priceListActions: {action: string, label: string, icon?: string, params?: any, group?: any }[];
	capacityEditor: CapacityEditorComponent;
	queryParams: {performanceId?: number, eventId?: number};
	nextPrices: NextPriceInfo[] = [];

	get activePriceLists(): PriceList[] {
		return this.product && this.product.PriceLists ? this.product.PriceLists.filter( priceList => priceList.IsEnabled == true) : null;
	}

	promises: {
		product: { name:string, old: any, new: any, saved: {performanceProduct: boolean, products: boolean, venueSeats: boolean, selectionTypes:boolean, priceLists: boolean, variants: boolean, variantPrices: boolean}},
		products: { name: string, old: ProductProduct[], new: ProductProduct[], saved: {create: boolean, update: boolean, delete: boolean} },
		performanceProduct: { name: string, old: PerformanceProduct, new: PerformanceProduct, saved: boolean },
		venueSeats: { name: string, old: VenueSeat[], new: VenueSeat[], saved: {create: boolean, update: boolean, delete: boolean}, promising?: boolean },
		selectionTypes: { name: string, old: ProductSelectionType[], new: ProductSelectionType[], saved: {create: boolean, update: boolean} },
		priceLists: { name: string, old: PriceList[], new: PriceList[], saved: {create: boolean, update: boolean, delete: boolean} },
		variants: { name: string, old: Variant[], new: Variant[], saved: {create: boolean, update: boolean, delete: boolean} },
		variantPrices: { name: string, old: VariantPrice[], new: VariantPrice[], saved: {create: boolean, update: boolean, delete: boolean} } } = {

		product: { name: 'product', old: null, new: null, saved: {performanceProduct: false, products: false, venueSeats: false, selectionTypes:false, priceLists: false, variants: false, variantPrices: false}},
		products: { name: 'products', old: [], new: [], saved: {create: false, update: false, delete: false} },
		performanceProduct: { name: 'performance', old: null, new: null, saved: false },
		venueSeats: { name: 'venueSeats', old: [], new: [], saved: {create: false, update: false, delete: false} },
		selectionTypes: { name: 'selectionTypes', old: [], new: [], saved: {create: false, update: false} },
		priceLists: { name: 'priceLists', old: [], new: [], saved: {create: false, update: false, delete: false} },
		variants: { name: 'variants', old: [], new: [], saved: {create: false, update: false, delete: false} },
		variantPrices: { name: 'variantPrices', old: [], new: [], saved: {create: false, update: false, delete: false} },
	};

	validation: {
		Name: { isValid: any, message: string },
		Performance: { isValid: any, message: string },
		Products: { isValid: any, message: string },
		Vat: { isValid: any, message: string },
		Capacity: { isValid: any, message: string },
		Color: { isValid: any, message: string },
		PriceBlocks: { isValid: any, message: string },
	} = {
		Name: {
			message: 'Ürün adı zorunludur.',
			isValid(): boolean {
				return this.product && this.product.isValid('Name', true);
			}
		},
		Performance: {
			message: 'Performans eklenmesi zorunludur',
			isValid():boolean {
				return (this.product && this.product.IsBundle) ? true : this.performance != null;
			}
		},
		Products: {
			message: 'Birleştirilmiş ürünlerde en az bir adet ürün eklenmelidir!',
			isValid():boolean {
				return (this.product && !this.product.IsBundle) ? true : (this.promises && this.promises.products && this.promises.products.new && this.promises.products.new.length > 0);
			}
		},
		Vat: {
			message: 'KDV oranı zorunlu alandır!',
			isValid():boolean {
				return this.product && this.product.Vat >= 0;
			}
		},
		Capacity: {
			message: 'Kapasite bilgisi zorunludur!',
			isValid():boolean {
				return this.product && this.product.IsBundle ? true : this.performanceProduct && this.performanceProduct.Capacity > 0;
			}
		},
		Color: {
			message: 'Renk seçimi zorunludur!',
			isValid():boolean {
				return this.product && this.product.IsBundle ? true : this.performanceProduct && this.performanceProduct.CategoryColorSeat;
			}
		},
		PriceBlocks: {
			message: 'Fiyat bilgilerinde zorunlu alanlar eksik!',
			isValid():boolean {
				return this.priceBlocks ? this.priceBlocks.find( item => item.isValid == false ) == null : true;
			}
		}
	};

	get isValid():boolean {
		if( this.product && this.validation
			&& this.validation.Name.isValid.call(this)
			&& this.validation.Performance.isValid.call(this)
			&& this.validation.Products.isValid.call(this)
			&& this.validation.Vat.isValid.call(this)
			&& this.validation.Color.isValid.call(this)
			&& this.validation.PriceBlocks.isValid.call(this)
			){
			return true;
		}else{
			// if( this.product && this.validation) console.log(
			// 	this.validation.Name.isValid.call(this),
			// 	this.validation.Performance.isValid.call(this),
			// 	this.validation.Products.isValid.call(this),
			// 	this.validation.Vat.isValid.call(this),
			// 	this.validation.Color.isValid.call(this),
			// 	this.validation.PriceBlocks.isValid.call(this)
			// )
			return false
		}
	};

	get allPriceCollapsed():boolean {
		let expandedPriceBlock:ProductPriceBlockComponent = this.priceBlocks.find( priceBlock => priceBlock.expandableBlock.isExpanded );
		return expandedPriceBlock ? false : true;
	}

  constructor(
	@Inject('productEntityService') private productEntityService: EntityService,
	@Inject('performanceEntityService') private performanceEntityService: EntityService,
	@Inject('productProductEntityService') private productProductEntityService: EntityService,
	@Inject('performanceProductEntityService') private performanceProductEntityService: EntityService,
	@Inject('venueSeatEntityService') private venueSeatEntityService: EntityService,
	@Inject('currencyEntityService') private currencyEntityService: EntityService,
	@Inject('variantTypeEntityService') private variantTypeEntityService: EntityService,
    private productService: ProductService,
	private performanceProductService: PerformanceProductService,
	private productProductService: ProductProductService,
	private venueSeatService: VenueSeatService,
	private productSelectionTypeService: ProductSelectionTypeService,
	private priceListService: PriceListService,
	private variantService: VariantService,
	private variantPriceService: VariantPriceService,

	private headerTitleService: HeaderTitleService,
	private notificationService: NotificationService,
	private appSettingsService: AppSettingsService,
	private authenticationService: AuthenticationService,

    private router: Router,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
	public tetherService: TetherDialog,
	private resolver: ComponentFactoryResolver,
	private injector: Injector
  ) { }

  ngOnInit() {
    this.headerTitleService.setTitle('Ürünler');
	this.role = this.route.snapshot.data['role'];
	this.isEditMode = this.role == 'edit';
	
	this.authenticationService.firm$.subscribe( firm => {
		this.firm = firm;
		this.changeDetector.detectChanges();
	});

	this.route.queryParams.subscribe(params=>{
		this.queryParams = {
			performanceId: parseInt(params['performanceId']),
			eventId: parseInt(params['eventId'])
		}
	});

	this.currencyEntityService.setCustomEndpoint('GetAll');
	this.currencyEntityService.data.subscribe( result => {
		this.currencyList = [];
		// this.currencyList.push({text: 'Seçiniz', value: '-1'});
		result.forEach( currency => {
			//this.currencyList.push({text: `${currency['Code']} / ${currency['Name']}`, value: currency['Id']});
			this.currencyList.push({text: `${currency['Code']}`, value: currency['Id'], name: currency['Name']});
			if(this.product && this.product.CurrencyId) this.inputChangeHandler(this.product.CurrencyId, 'CurrencyId');
		});
	});
	this.currencyEntityService.fromEntity('CCurrency').take(100).page(0).executeQuery();

	this.variantTypeEntityService.setCustomEndpoint('GetAll');
	this.variantTypeEntityService.data.subscribe( result => {
		this.variantTypeList = [];
		this.variantTypeList.push({text: 'Seçiniz', value: '-1'});
		result.forEach( variantType => {
			this.variantTypeList.push({text: `${variantType['Localization']['Name']}`, value: variantType['Id']});
		});
	});
	this.variantTypeEntityService.fromEntity('PVariantType').expand(['Localization']).take(100).page(0).executeQuery();

	this.vatList = cloneDeep(this.appSettingsService.getLocalSettings('vatList'));
	this.vatList.unshift({text: 'Seçiniz', value: '-1'});
	// this.vatList.push({text: 'Seçiniz', value: '-1'});
	// this.vatList.push({text: '%0', value: 0});
	// this.vatList.push({text: '%1', value: 0.01});
	// this.vatList.push({text: '%8', value: 0.08});
	// this.vatList.push({text: '%18', value: 0.18});

	this.priceListActions = [];

	this.setProduct();
  }

  setProduct() {
	if(this.isEditMode && this.route.snapshot.params && this.route.snapshot.params && this.route.snapshot.params['id']){
		let id = this.route.snapshot.params['id'];
		this.isLoading = true;
		this.productEntityService.data.subscribe( products => {
			if(products && products[0]) {
				this.product = new Product(products[0]);
				this.promises.product.old = new Product(this.product);
				console.log(this.product);
				if(!this.product) return;

				this.isBundle = this.product.IsBundle;
				// if(this.product.Localization) this.inputChangeHandler(this.product.Localization["Name"], "Name");
				// if(this.product.Localization) this.inputChangeHandler(this.product.Localization["Info"], "Info");
				this.getLocalization();
				if(this.product.CurrencyId) this.inputChangeHandler(this.product.CurrencyId, 'CurrencyId');


				if(this.isBundle) {
					this.productProductsServiceDataHandler();
					this.resetProductProducts(true);
				}else{
					this.performanceProductEntityServiceDataHandler();
					this.resetPerformaceProduct(true);

					this.venueSeatsServiceDataHandler();
					this.resetVenueSeats(true);

					if(this.product.PriceLists) this.product.PriceLists.forEach( priceList => {
						this.promises.priceLists.old.push(priceList);
						if(priceList.Variants) priceList.Variants.forEach( variant => {
							this.promises.variants.old.push(variant);
							if(variant.Prices) variant.Prices.forEach( variantPrice => {
								this.promises.variantPrices.old.push(variantPrice);
							})
						});
					});
					this.resetPriceLists();
				}

				this.changeDetector.detectChanges();
			}
			this.isLoading = false;
		});

		this.productEntityService.setCustomEndpoint('GetAll');
		this.productEntityService.fromEntity('PProduct')
			.where('Id', '=', id)
			.expand(['Localization'])
			.expand(['PriceLists', 'Localization'])
			.expand(['PriceLists', 'Variants', 'VariantType', 'Localization'])
			.expand(['PriceLists', 'Variants', 'Prices', 'SalesChannel'])
			.expand(['Currency'])
			.take(1).page(0).executeQuery();

			//this.resetPerformaceProduct(true, id);
		}else {
			this.product = new Product({
				GroupId: 1,
				CurrencyId: 19,
				Name: this.title,
				// Info: null,
				// OrganizerFirmId: null,
				// Vat: 0,
				IsRefundable: true,
				IsBundle: this.isBundle,
				MaxProductsPerTrx: 9,
				// IsSeatSelectionAvailable: false
			});
			this.product.IsRefundable = this.product.GroupId != 1;
			if(this.title) this.inputChangeHandler(this.title, 'Name');
			// this.priceListActions.push({action: "remove", label: "Fiyatı Sil"});

			this.promises.product.old = new Product(this.product);

			if(this.queryParams.performanceId) {
				this.performanceEntityService.data.subscribe( entities => {
					if(entities && entities[0]) this.performanceCapacityChangeHandler(new Performance(entities[0]));
				})
				this.performanceEntityService.setCustomEndpoint('GetAll');
				this.performanceEntityService
					.fromEntity('EPerformance')
					.where('Id', '=', this.queryParams.performanceId)
					.expand(['Localization'])
					.expand(['VenueTemplate', 'Localization'])
					.expand(['VenueTemplate', 'Venue', 'Localization'])
					.expand(['VenueTemplate', 'Venue', 'Town', 'City', 'Country', 'Localization'])
					.take(1)
					.page(0)
					.executeQuery();
			}
		}
		this.changeDetector.detectChanges();
	}

	getLocalization() {
		if(this.product) {
			this.productService.flushCustomEndpoint();
			this.productService.find(this.product.Id, true);
			this.productService.data.subscribe( result => {
				if(result && result[0]) {
					this.product.setLocalization(result[0]['Localization']);
					this.inputChangeHandler(this.product.Localization['Name'], 'Name');
					this.inputChangeHandler(this.product.Localization['Info'], 'Info');
				}
			});
		}
	}

	productProductsServiceDataHandler() {
		if(!this.product || !this.product.Id) return;
		this.productProductEntityService.data.subscribe( result => {
			if(result) {
				this.promises.products.old = [];
				this.promises.products.new = [];
				this.products = [];

				let productProduct: ProductProduct;
				result.forEach( productProductData => {
					productProduct = new ProductProduct(productProductData);
					this.promises.products.old.push(productProduct);
					this.promises.products.new.push(productProduct);

					this.products.push(productProduct['RelatedProduct'])
				});
			}
		})
	}

	resetProductProducts(flushQuery:boolean = false) {
		if(this.promises.products.saved.create && this.promises.products.saved.update && this.promises.products.saved.delete) {
			this.promises.products.saved = {create: false, update: false, delete: false};
			this.promises.product.saved.products = true;
			this.checkSaved();
			flushQuery = true;
		}
		if(flushQuery) {
			if(!this.product || !this.product.Id) return;
			this.productProductEntityService.setCustomEndpoint('GetAll');
			this.productProductEntityService
				.fromEntity('PProductProduct')
				.where('ProductId', '=',  this.product.Id)
				.expand(['Product'])
				.expand(['Product', 'PriceLists','Variants'])
				.expand(['Product', 'Currency'])
				.expand(['RelatedProduct'])
				.expand(['RelatedProduct', 'PriceLists','Variants'])
				.expand(['RelatedProduct', 'Currency'])
				.take(100)
				.page(0)
				.executeQuery();
		}
	}

	performanceProductEntityServiceDataHandler() {
		this.performanceProductEntityService.data.subscribe(entities => {
			if(entities) {
				if(entities.length == 1) {
					if(entities[0]['ProductId'] && entities[0]['PerformanceId']) {
						this.performanceProduct = new PerformanceProduct(entities[0]);
						this.promises.performanceProduct.old = this.performanceProduct;
						this.promises.performanceProduct.new = this.performanceProduct;

						this.performance = new Performance(entities[0].Performance);
						// if(this.isEditMode && this.performance.Status != PerformanceStatus.OnSale) this.priceListActions.push({action: "remove", label: "Fiyatı Sil"});
						console.log(this.performanceProduct, this.performance);
					}
				}else{

				}
			}
		});
	}

	resetPerformaceProduct(flushQuery:boolean = false) {
		if(this.promises.performanceProduct.saved) {
			this.promises.performanceProduct.saved=false;
			this.promises.product.saved.performanceProduct = true;
			this.checkSaved();
			flushQuery = true;
		}
		if(flushQuery) {
			if(!this.product || !this.product.Id) return;
			this.performanceProductEntityService.setCustomEndpoint('GetAll');
			this.performanceProductEntityService
				.fromEntity('EPerformanceProduct')
				.where('ProductId', '=',  this.product.Id)
				.expand(['Product'])
				.expand(['Product', 'PriceLists','Variants'])
				.expand(['Product', 'Currency'])
				.expand(['Performance', 'Localization'])
				// .expand(['Performance', 'Event', 'Firms'])
				// .expand(['Performance', 'Event', 'Promoter'])
				.expand(['Performance', 'VenueTemplate', 'Localization'])
				.expand(['Performance', 'VenueTemplate', 'Venue', 'Localization'])
				.expand(['Performance', 'VenueTemplate', 'Venue', 'Town', 'City', 'Country', 'Localization'])
				.take(1)
				.page(0)
				.executeQuery();
		}
	}

	venueSeatsServiceDataHandler() {
		if(!this.product || !this.product.Id) return;
		this.venueSeatEntityService.data.subscribe( result => {
			if(result) {
				this.promises.venueSeats.old = [];
				this.promises.venueSeats.new = [];

				let venueSeat: VenueSeat;
				result.forEach( venueSeatData => {
					venueSeat = new VenueSeat(venueSeatData);
					this.promises.venueSeats.old.push(venueSeat);
					this.promises.venueSeats.new.push(venueSeat);
				});
				// if(this.performanceProduct) this.performanceProduct.Capacity = this.promises.venueSeats.new.length;
				// if(this.performanceProduct) console.log(this.performanceProduct.Capacity, this.promises.venueSeats.new);
			}
		})
	}

	resetVenueSeats(flushQuery:boolean = false) {
		if(this.performance && this.performance.Status == PerformanceStatus.OnSale) return;
		if(this.promises.venueSeats.saved.create && this.promises.venueSeats.saved.update && this.promises.venueSeats.saved.delete) {
			this.promises.venueSeats.saved = {create: false, update: false, delete: false};
			this.promises.product.saved.venueSeats = true;
			this.checkSaved();
			flushQuery = true;
			this.promises.venueSeats.promising = false;
		}
		if(flushQuery) {
			if(!this.product || !this.product.Id) return;
			this.venueSeatEntityService.setCustomEndpoint('GetAll');
			this.venueSeatEntityService
				.fromEntity('EVenueSeat')
				.where('ProductId', '=',  this.product.Id)
				.take(1000000)
				.page(0)
				.executeQuery();
		}
	}

	resetSelectionTypes(flushQuery:boolean = false) {
		if(this.promises.selectionTypes.saved.create && this.promises.selectionTypes.saved.update) {
			this.promises.selectionTypes.saved = {create: false, update: false};
			this.promises.product.saved.selectionTypes = true;
			this.checkSaved();
			flushQuery = true;
		}
	}

	resetPriceLists(flushQuery:boolean = false) {
		if(this.promises.priceLists.saved.create && this.promises.priceLists.saved.update && this.promises.priceLists.saved.delete) {
			this.promises.priceLists.saved = {create: false, update: false, delete: false};
			this.promises.product.saved.priceLists = true;
			this.replaceFakeIds();
			this.updateNextPriceInfo();
			this.saveVariants();
			this.checkSaved();
		}
	}

	replaceFakeIds() {
		for (let n of this.nextPrices) {
			if(n.priceBlock < -1) {
				n.priceBlock = this.activePriceLists.find(p => p.FakeId === n.priceBlock).Id;
			}

			if(n.nextPrice < -1) {
				n.nextPrice = this.activePriceLists.find(p => p.FakeId === n.nextPrice).Id;
			}
		}
	}

	updateNextPriceInfo() {
		if (!this.activePriceLists) return;
		let payLoad = [];

		this.activePriceLists.forEach(p => {
			let priceBlock = this.nextPrices.find(n => n.priceBlock === p.Id);
			if (priceBlock) {
				payLoad.push({
					Id: p.Id,
					NextPriceListId: priceBlock.nextPrice === 0 ? null : priceBlock.nextPrice
				});
			}
		});

		this.priceListService.setCustomEndpoint('PatchAll');
		this.priceListService.update(payLoad, 'patch').subscribe(
			response => {
				// Success
			}, error => {
				this.notificationService.add({type: 'danger', timeOut: 10000, text: 'NextPrice: ' + error.Message});
			}
		);
	}

	resetVariants(flushQuery:boolean = false) {
		if(this.promises.variants.saved.create && this.promises.variants.saved.update && this.promises.variants.saved.delete) {
			this.promises.variants.saved = {create: false, update: false, delete: false};
			this.promises.product.saved.variants = true;
			this.saveVariantPrices();
			this.checkSaved();
		}
	}

	resetVariantPrices(flushQuery:boolean = false) {
		if(this.promises.variantPrices.saved.create && this.promises.variantPrices.saved.update && this.promises.variantPrices.saved.delete) {
			this.promises.variantPrices.saved = {create: false, update: false, delete: false};
			this.promises.product.saved.variantPrices = true;
			this.checkSaved();
		}
	}

	tabChangeHandler(event) {
		switch(event.value) {
			case 'product':
				this.tetherService.confirm({
					title: 'Ürün türünü değiştiriyorsunuz!',
					description: 'Birleştirilmiş ürün oluşturma işleminden ayrılmak istediğinize emin misiniz?',
					confirmButton: {label: 'EVET'},
					dismissButton: {label: 'VAZGEÇ'}
				}).then( result => {
					this.isBundle = false;
					this.setProduct();
				}).catch(reason => {
					this.typeSelector.selectedValues = ['bundleProducts'];
				});
			break;
			case 'bundleProducts':
				this.tetherService.confirm({
					title: 'Ürün türünü değiştiriyorsunuz!',
					description: 'Performaslı ürün oluşturma işleminden ayrılmak istediğinize emin misiniz?',
					confirmButton: {label: 'EVET'},
					dismissButton: {label: 'VAZGEÇ'}
				}).then( result => {
					this.isBundle = true;
					this.setProduct();
				}).catch(reason => {
					this.typeSelector.selectedValues = ['product'];
				});
			break;
		}
	}

	openVenueEditor(){
		if(!this.performance || !this.performance['VenueTemplate'] || !this.product) return;
		// this.isLoading = true;
		// this.editorIsShown = true;
		let component: ComponentRef<CapacityEditorComponent> = this.resolver.resolveComponentFactory(CapacityEditorComponent).create(this.injector);
		this.capacityEditor = component.instance;
		this.capacityEditor.role = VenueTemplateEditorComponent.ROLE_PRODUCT;
		this.capacityEditor.productId = this.product.Id;
		this.capacityEditor.performanceId = this.performance.Id;
		let localizationPipe: LocalizationPipe = new LocalizationPipe(this.appSettingsService);
		console.log(this.performance)
		this.capacityEditor.breadcrumbs = [{title: localizationPipe.transform(this.title)}, {title: this.performance.VenueTemplate.Localization.Name + ' Oturma Düzeni'}];

		this.tetherService.content(component).then( result => {
			this.selectedSeats = result.seats;
			if(this.performanceProduct && this.performance && this.performance.Status != PerformanceStatus.OnSale) this.performanceProduct.Capacity = result.capacity;
			this.saveSelectedSeats();
		}).catch( reason => {});
	}

	saveSelectedSeats() {
		this.isLoading = false;
		this.editorIsShown = false;
		this.venueSeats = [];
		let venueSeat: VenueSeat;
		this.selectedSeats.forEach( seat => {
			venueSeat = new VenueSeat();
			venueSeat.Id = seat['Id'];
			venueSeat.VenueGateId = seat['GateId'];
			venueSeat.IsStanding = seat['IsStanding'];
			venueSeat.VenueRowId = seat['RowId'];
			venueSeat.SeatPriority = seat['SeatPriority'];
			venueSeat.Status = seat['Status'];
			venueSeat.TicketType = seat['TicketType'];
			this.venueSeats.push(venueSeat);
		});
		this.promises.venueSeats.new = this.venueSeats;
		this.selectedSeats = null;
		if(this.isEditMode) this.saveVenueSeats();
	}

	venueEditorEventHandler(event) {
		switch(event.type) {
			case VenueTemplateEditorComponent.EVENT_SELECT:
				this.selectedSeats = event.payload.filter( item => item['Status'] != null);
				this.changeDetector.detectChanges();
			break;
		}
	}

	selectSeats() {
		if(this.selectedSeats) {
			let seatIds: number[] = [];
			this.selectedSeats.forEach( seat => {
				seatIds.push(seat['Id']);
			});
			this.venueEditor.selectSeats(seatIds);
		}
	}

	inputChangeHandler(event, name: string) {
		if(!this.product) return;
		switch(name) {
			case 'Name':
				this.title = event;
				this.product.set('Name', event, true);
				// if(!this.product.Localization) this.product.Localization = {};
				// if(!this.product.Localization.Tr) this.product.Localization.Tr = {};
				// if(!this.product.Localization.En) this.product.Localization.En = {};
				// this.product.Localization.Tr.Name = this.title;
				// this.product.Localization.En.Name = this.title;
			break;
			case 'Info':
				// if(!this.product.Localization) this.product.Localization = {};
				// if(!this.product.Localization.Tr) this.product.Localization.Tr = {};
				// if(!this.product.Localization.En) this.product.Localization.En = {};
				// this.product.Localization.Tr.Info = event;
				// this.product.Localization.En.Info = event;
				// this.product.set('Info', event, true);
				this.product.set('Info', event.localization ? event.localization : event, true);
			break;
			case 'CurrencyId':
				this.product[name] = event;
				this.selectedCurrency = this.currencyList.find( item => item.value == this.product.CurrencyId);
			break;
			default:
				this.product[name] = event;
				break;
		}
		this.changeDetector.detectChanges();
	}

	checkHandler(value:any, name:string, target: string = 'product') {
		switch(name) {
			default:
			this[target][name] = value;
			break;
		}
	}

	selectionTypeListChangeHandler(selectionTypes: ProductSelectionType[]) {
		this.promises.selectionTypes.old = [];
		this.promises.selectionTypes.new = [];
		selectionTypes.forEach( item => {
			if(item.ProductId) {
				this.promises.selectionTypes.old.push(item);
			}else{
				this.promises.selectionTypes.new.push(item);
			}
		});
	}

	gotoProductCreate(){
		this.router.navigate(['event', 'create']);
	}

	productsActionHandler(event) {
		switch(event.action) {
			case 'openSearchBox':

			break;
			case 'createEvent':
				if(!this.isValid){
					this.tetherService.dismiss();
					this.tetherService.confirm({
						title: 'Etkinlik Henüz Kaydedilmedi!',
						description: 'Gerekli alanlar doldurulmadığı için kayıt işlemi yapılamadı. Yine de etkinliği kaydetmeden bir başka etkinlik oluşturmak istyor musunuz?',
						confirmButton: {label: 'EVET'},
						dismissButton: {label: 'VAZGEÇ'}
					}).then( result => {
						this.gotoProductCreate();
					}).catch(reason => {
						this.productSearchSelect.openSearchBox();
					});
				}else{
					this.onSaveComplete = this.gotoProductCreate;
					this.saveProduct();
				}
			break;
		}
	}

	productsChangeHandler(event) {
		if(!event && event.length == 0) return;
		this.promises.products.new = [];
		let productProduct: ProductProduct;

		event.forEach(item => {
			productProduct = this.promises.products.old.find( productProductItem => item.RelatedProductId == productProductItem.RelatedProductId );
			if(!productProduct) {
				productProduct = new ProductProduct(
					{
						RelatedProductId: item.Id,
						PriceActionId: null
					}
				);
			}
			this.promises.products.new.push(productProduct);
		});
	}

	performanceCapacityActionHandler(event: {action: string}) {
		switch(event.action) {
			case 'openVenueEditor':
				this.openVenueEditor();
			break;
			case 'addCapacity':
				if(this.performanceProduct && event['data']) this.performanceProduct.Capacity = event['data']['capacity'];
			break;
			case 'loadingStart':
				this.isPromising = true;
				this.changeDetector.detectChanges();
			break;
			case 'loadingEnd':
				this.isPromising = false;
				this.changeDetector.detectChanges();
			break;
		}
	}

	performanceCapacityChangeHandler(event:Performance) {
		if(this.performance && event && this.performance.Id == event.Id) return;
		this.performance = event;
		if(!this.performance) {
			this.performanceProduct = this.promises.performanceProduct.new = null;
			return;
		};
		this.performanceProduct = new PerformanceProduct({
			PerformanceId: this.performance.Id,
			Capacity: 0,
			Duration: 0,
			CategoryColorSeat: null,
			IsSoldOut: false,
			IsBundle: false,
			NonBundleLimit: 0
		});
		this.promises.performanceProduct.new = this.performanceProduct;
	}

	addNewPrice(event:any) {
		if(!this.product) return;
		if(this.product && !this.product.PriceLists) this.product.PriceLists = [];
		let priceList = new PriceList();
		priceList.ProductId = this.product.Id;
		priceList.IsEnabled = true;
		priceList.Type = 1;
		priceList.FakeId = Number.parseInt(uniqueId('-')) - 1;
		this.product.PriceLists.push(priceList);
		this.changeDetector.detectChanges();
		this.priceBlocks.last.firstTextInput.focus();
	}

	nextPriceChangeHandler(event: NextPriceInfo) {
		let i = this.nextPrices.findIndex(p => p.priceBlock === event.priceBlock);
		if (i >= 0) {
			this.nextPrices[i].nextPrice = event.nextPrice;
		} else {
			this.nextPrices.push(event);
		}
	}

	removePrice(priceList: PriceList, index) {
		if(!this.product || !this.product.PriceLists) return;
		if(index != null) {
			this.product.PriceLists.splice(index, 1);
		}else{
			let existPriceList: PriceList = this.product.PriceLists.find( item => item.Id == priceList.Id);
			if(existPriceList) this.product.PriceLists.splice(this.product.PriceLists.indexOf(existPriceList), 1);
		}

		this.changeDetector.detectChanges();
	}

	toggleAllPriceBlocks() {
		this.allPriceCollapsed ? this.priceBlocks.forEach( priceBlock => priceBlock.expand() ) : this.priceBlocks.forEach( priceBlock => priceBlock.collapse() );
	}

	productPriceBlockActionHandler(event, index) {
		switch(event.action) {
			case 'remove':
				this.removePrice(event.params.priceList, index)
			break;
		}
	}

	productPriceBlockChangeHandler(event, index) {
		
	}

	colorPickerSelectEvent(event) {
		if(this.performanceProduct) this.performanceProduct.CategoryColorSeat = event.color;
	}

	submitProduct(event) {
		this.saveProduct();
	}

	exit(event) {
		if(this.isBundle) {
			this.router.navigate(['products', 'bundles']);
		}else{
			if(this.queryParams.performanceId || this.queryParams.eventId) {
				if(this.queryParams.performanceId) this.router.navigate(['performance', this.queryParams.performanceId, 'products']);
				if(this.queryParams.eventId) this.router.navigate(['event', this.queryParams.eventId, 'products']);
			}else{
				this.router.navigate(['products', 'performances']);
			}
		}
	}

	saveProduct() {
		this.isPromising = true;
		this.promises.product.new = this.product;
		if(this.product.Id) {
			this.productService.update(this.product.getRawData()).subscribe(
				result => {
					this.saveRelations();
				},
				error => {
					this.notificationService.add({text: `Ürünler kaydedilemedi. Lütfen bütün gerekli alanları doldurun.<small>${error.Message}</small>`, type:'warning', timeOut: 8000});
				},
				complete => {

				}
			)
		}else{
			this.productService.create(this.product.getRawData()).subscribe(
				result => {
					this.product.Id = result;
					this.saveRelations(true);
				},
				error => {
					this.notificationService.add({text: `Ürünler kaydedilemedi. Lütfen bütün gerekli alanları doldurun.<small>${error.Message}</small>`, type:'warning', timeOut: 8000});
				},
				complete => {

				}
			)
		}
	}

	saveRelations(isNew: boolean = false) {
		if(!this.product.IsBundle) this.savePerformaceProduct(isNew);
		if(this.product.IsBundle) this.saveProductProducts(isNew);
		if(!this.product.IsBundle) this.saveVenueSeats(isNew);
		this.savePriceLists(isNew);
		this.saveSelectionTypes(isNew);
	}

	saveProductProducts(isNew: boolean = false){
		if(this.product) { this.promises.products.new.map( item => item.ProductId = this.product.Id) };
		let willUpdate: ProductProduct[] = [];
		let willDelete: ProductProduct[] = [].concat(this.promises.products.old);
		let willCreate: ProductProduct[] = [].concat(this.promises.products.new);
		let sourceList: ProductProduct[] = [].concat(this.promises.products.new);

		let item: ProductProduct;
		let matchedItem: ProductProduct;
		let action: string;
		while(sourceList.length > 0) {
			item = sourceList.shift();
			matchedItem = willDelete.find( productPrdouct => item.ProductId == productPrdouct.ProductId);
			if(matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(willCreate.find( item => item.ProductId == matchedItem.ProductId)), 1);
				willUpdate.push(item);
			}
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);

		if(willCreate.length > 0) {
			this.productProductService.setCustomEndpoint('PostAll');
			this.productProductService.create(willCreate).subscribe(
				response => {
					this.promises.products.saved.create = true;
					this.resetProductProducts();
				},
				error => {
					
				}
			);
		}else{
			this.promises.products.saved.create = true;
			this.resetProductProducts();
		}

		if(willUpdate.length > 0) {
			this.productProductService.setCustomEndpoint('PutAll');
			this.productProductService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.products.saved.update = true;
					this.resetProductProducts();
				}, error => {
					console.log(JSON.stringify(error));
				}
			);
		}else {
			this.promises.products.saved.update = true;
			this.resetProductProducts();
		}

		if(willDelete.length > 0) {
			let total: number = willDelete.length;
			let index: number = 0;
			willDelete.forEach(productPrdouct => {
				this.productProductService.setCustomEndpoint(productPrdouct.ProductId + '/' + productPrdouct.RelatedProductId);
				this.productProductService.delete(null).subscribe(result => {
					index++;
					if(total == index) {
						this.promises.products.saved.delete = true;
						this.resetProductProducts();
					}
				});
			});
		}else{
			this.promises.products.saved.delete = true;
			this.resetProductProducts();
		}
	}

	savePerformaceProduct(isNew: boolean = false){
		if(this.performanceProduct) {
			if(!this.performanceProduct.ProductId) {
				this.performanceProduct.ProductId = this.product.Id;
				this.promises.performanceProduct.new = this.performanceProduct;

				this.performanceProductService.setCustomEndpoint(this.promises.performanceProduct.new.ProductId + '/' + this.promises.performanceProduct.new.PerformanceId);
				this.performanceProductService.create(this.promises.performanceProduct.new).subscribe(
					result => {
						this.promises.performanceProduct.saved = true;
						this.resetPerformaceProduct();
					},
					error => {
						this.notificationService.add({text: `Ürün performans ilişkilisi kaydedilemedi. Lütfen bütün gerekli alanları doldurun.<small>${error.Message}</small>`, type:'warning', timeOut: 8000});
					}
				);
			}else{
				this.promises.performanceProduct.new = this.performanceProduct;

				this.performanceProductService.setCustomEndpoint(this.promises.performanceProduct.new.ProductId + '/' + this.promises.performanceProduct.new.PerformanceId);
				this.performanceProductService.update(this.promises.performanceProduct.new).subscribe(
					result => {
						this.promises.performanceProduct.saved = true;
						this.resetPerformaceProduct();
					},
					error => {
						this.isPromising = false;
						this.notificationService.add({text: `Ürün performans ilişkilisi kaydedilemedi. Lütfen bütün gerekli alanları doldurun.<small>${error.Message}</small>`, type:'warning', timeOut: 8000});
					}
				);
			}
		}
	}

	saveVenueSeats(isNew: boolean = false){
		if(!this.product || this.performance && this.performance.Status == PerformanceStatus.OnSale){
			this.promises.product.saved.venueSeats = true;
			return;	
		};
		let willUpdate: VenueSeat[] = [];
		let willDelete: VenueSeat[] = [].concat(this.promises.venueSeats.old);
		let willCreate: VenueSeat[] = [].concat(this.promises.venueSeats.new);
		let sourceList: VenueSeat[] = [].concat(this.promises.venueSeats.new);
		let setSeatsProductData: {ProductId: number, SeatInfoList: {SeatId: number, PerformanceId: number, RowId: number}[]};

		this.promises.venueSeats.promising = true;

		let item: VenueSeat;
		let matchedItem: VenueSeat;
		let action: string;
		while(sourceList.length > 0) {
			item = sourceList.shift();
			matchedItem = willDelete.find( venueSeat => item.Id == venueSeat.Id);
			if(matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(willCreate.find( item => item.Id == matchedItem.Id)), 1);
				willUpdate.push(item);
			}
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);

		if(willCreate.length > 0) {
			setSeatsProductData = {
				ProductId: this.product.Id,
				SeatInfoList: []
			}
			willCreate.forEach( item => setSeatsProductData.SeatInfoList.push( {
				SeatId: item.Id,
				PerformanceId: this.performance.Id,
				RowId: item.VenueRowId
			}))
			this.venueSeatService.setCustomEndpoint('SetSeatsProduct');
			this.venueSeatService.create(setSeatsProductData).subscribe(
				response => {
					this.promises.venueSeats.saved.create = true;
					this.resetVenueSeats();
				},
				error => {
					this.notificationService.add({type: 'danger', timeOut: 10000, text: 'Hata! (EVenueSeat) '+error.Message});
				}
			);
		}else{
			this.promises.venueSeats.saved.create = true;
			this.resetVenueSeats();
		}

		if(willUpdate.length > 0) {
			setSeatsProductData = {
				ProductId: this.product.Id,
				SeatInfoList: []
			}
			willUpdate.forEach( item => setSeatsProductData.SeatInfoList.push( {
				SeatId: item.Id,
				PerformanceId: this.performance.Id,
				RowId: item.VenueRowId
			}))
			this.venueSeatService.setCustomEndpoint('SetSeatsProduct');
			this.venueSeatService.create(setSeatsProductData).subscribe(
				response => {
					this.promises.venueSeats.saved.update = true;
					this.resetVenueSeats();
				},
				error => {
					this.notificationService.add({type: 'danger', timeOut: 10000, text: 'Hata! (EVenueSeat) '+error.Message});
				}
			);
		}else {
			this.promises.venueSeats.saved.update = true;
			this.resetVenueSeats();
		}

		if(willDelete.length > 0) {
			setSeatsProductData = {
				ProductId: null,
				SeatInfoList: []
			}
			willDelete.forEach( item => setSeatsProductData.SeatInfoList.push( {
				SeatId: item.Id,
				PerformanceId: this.performance.Id,
				RowId: item.VenueRowId
			}))
			this.venueSeatService.setCustomEndpoint('SetSeatsProduct');
			this.venueSeatService.create(setSeatsProductData).subscribe(
				response => {
					this.promises.venueSeats.saved.delete = true;
					this.resetVenueSeats();
				},
				error => {
					this.notificationService.add({type: 'danger', timeOut: 10000, text: 'Hata! (EVenueSeat) '+error.Message});
				}
			);
		}else{
			this.promises.venueSeats.saved.delete = true;
			this.resetVenueSeats();
		}
	}

	saveSelectionTypes(isNew: boolean = false){
		if(!this.product) return;
		let willUpdate: ProductSelectionType[] = [].concat(this.promises.selectionTypes.old);
		let willCreate: ProductSelectionType[] = [].concat(this.promises.selectionTypes.new);
		let createTotal: number;
		let createIndex: number;
		let updateIndex: number;
		let updateTotal: number;

		if(willCreate.length > 0) {
			createTotal = willCreate.length;
			createIndex = 0;
			willCreate.forEach( item => {
				item.ProductId = this.product.Id;
				this.productSelectionTypeService.setCustomEndpoint(item.ProductId + '/' + item.SalesChannelId);
				this.productSelectionTypeService.create(item).subscribe(result => {
					createIndex++;
					if(createTotal == createIndex) {
						this.promises.selectionTypes.saved.create = true;
						this.resetSelectionTypes();
					}
				});
			}, error => {
				this.notificationService.add({type: 'danger', timeOut: 10000, text: 'Hata! (SelectionTypes) '+error.Message});
			});
		}else{
			this.promises.selectionTypes.saved.create = true;
			this.resetSelectionTypes();
		}

		if(willUpdate.length > 0) {
			updateTotal = willUpdate.length;
			updateIndex = 0;
			willUpdate.forEach( item => {
				item.ProductId = this.product.Id;
				this.productSelectionTypeService.setCustomEndpoint(item.ProductId + '/' + item.SalesChannelId);
				this.productSelectionTypeService.update(item).subscribe(result => {
					updateIndex++;
					if(updateTotal == updateIndex) {
						this.promises.selectionTypes.saved.update = true;
						this.resetSelectionTypes();
					}
				});
			}, error => {
				this.notificationService.add({type: 'danger', timeOut: 10000, text: 'Hata! (SelectionTypes) '+error.Message});
			});
		}else{
			this.promises.selectionTypes.saved.update = true;
			this.resetSelectionTypes();
		}
	}

	savePriceLists(isNew: boolean = false){
		if(this.product && this.product.PriceLists) {
			this.promises.priceLists.new = [].concat(this.product.PriceLists);
			this.promises.priceLists.new.map( item => item.ProductId = this.product.Id)
		};
		let willUpdate: PriceList[] = [];
		let willDelete: PriceList[] = [].concat(this.promises.priceLists.old);
		let willCreate: PriceList[] = [].concat(this.promises.priceLists.new);
		let sourceList: PriceList[] = [].concat(this.promises.priceLists.new);

		let item: PriceList;
		let matchedItem: PriceList;
		let action: string;
		while(sourceList.length > 0) {
			item = sourceList.shift();
			matchedItem = willDelete.find( priceList => item.Id == priceList.Id);
			if(matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(willCreate.find( item => item.Id == matchedItem.Id)), 1);
				willUpdate.push(item);
			}
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);

		if(willCreate.length > 0) {
			let fakeIds = willCreate.map(f => f.FakeId);
			willCreate.forEach(c => {
				delete c.FakeId;
				c.NextPriceListId = c.NextPriceListId < 1 ? null : c.NextPriceListId;
			});
			this.priceListService.setCustomEndpoint('PostAll');
			this.priceListService.create(willCreate).subscribe(
				response => {
					response.forEach( (item, index) => {
						willCreate[index].Id = item;
						willCreate[index].FakeId = fakeIds[index];
					});
					this.promises.priceLists.saved.create = true;
					this.resetPriceLists();
				},
				error => {
					this.notificationService.add({type: 'danger', timeOut: 10000, text: 'Hata! (PriceList) '+error.Message});
				}
			);
		}else{
			this.promises.priceLists.saved.create = true;
			this.resetPriceLists();
		}

		if(willUpdate.length > 0) {
			willUpdate.forEach(c => {
				c.NextPriceListId = c.NextPriceListId < 1 ? null : c.NextPriceListId;
			});
			this.priceListService.setCustomEndpoint('PutAll');
			this.priceListService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.priceLists.saved.update = true;
					this.resetPriceLists();
				}, error => {
					this.notificationService.add({type: 'danger', timeOut: 10000, text: 'Hata! (PriceList) '+error.Message});
				}
			);
		}else {
			this.promises.priceLists.saved.update = true;
			this.resetPriceLists();
		}

		if(willDelete.length > 0) {
			let total: number = willDelete.length;
			let index: number = 0;
			willDelete.forEach(priceList => {
				this.priceListService.flushCustomEndpoint();
				this.priceListService.delete(priceList.Id).subscribe(result => {
					index++;
					if(total == index) {
						this.promises.priceLists.saved.delete = true;
						this.resetPriceLists();
					}
				});
			});
		}else{
			this.promises.priceLists.saved.delete = true;
			this.resetPriceLists();
		}
	}

	saveVariants(isNew: boolean = false){
		if(this.product) {
			this.promises.priceLists.new.forEach( priceList => {
				if(priceList.Variants) priceList.Variants.forEach( variant => {
					variant.PriceListId = priceList.Id;
					variant.ProductId = this.product.Id;
					variant.AllowedSalesTotal = variant.AllowedSalesTotal || 0;
					this.promises.variants.new.push(new Variant(variant));
				});
			});
		};
		let willUpdate: Variant[] = [];
		let willDelete: Variant[] = [].concat(this.promises.variants.old);
		let willCreate: Variant[] = [].concat(this.promises.variants.new);
		let sourceList: Variant[] = [].concat(this.promises.variants.new);

		let item: Variant;
		let matchedItem: Variant;
		let action: string;
		while(sourceList.length > 0) {
			item = sourceList.shift();
			matchedItem = willDelete.find( variant => item.Id == variant.Id);
			if(matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(willCreate.find( item => item.Id == matchedItem.Id)), 1);
				willUpdate.push(item);
			}
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);

		if(willCreate.length > 0) {
			this.variantService.setCustomEndpoint('PostAll');
			this.variantService.create(willCreate).subscribe(
				response => {
					response.forEach( (item, index) => {
						willCreate[index].Id = item;
					});
					this.promises.variants.saved.create = true;
					this.resetVariants();
				},
				error => {
					this.notificationService.add({type: 'danger', timeOut: 10000, text: 'Hata! (Variant) '+error.Message});
				}
			);
		}else{
			this.promises.variants.saved.create = true;
			this.resetVariants();
		}

		if(willUpdate.length > 0) {
			this.variantService.setCustomEndpoint('PutAll');
			this.variantService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.variants.saved.update = true;
					this.resetVariants();
				}, error => {
					this.notificationService.add({type: 'danger', timeOut: 10000, text: 'Hata! (Variant) '+error.Message});
				}
			);
		}else {
			this.promises.variants.saved.update = true;
			this.resetVariants();
		}

		if(willDelete.length > 0) {
			let total: number = willDelete.length;
			let index: number = 0;
			willDelete.forEach(variant => {
				this.variantService.flushCustomEndpoint();
				this.variantService.delete(variant.Id).subscribe(result => {
					index++;
					if(total == index) {
						this.promises.variants.saved.delete = true;
						this.resetVariants();
					}
				});
			});
		}else{
			this.promises.variants.saved.delete = true;
			this.resetVariants();
		}
	}

	saveVariantPrices(isNew: boolean = false){
		if(this.product) {
			this.promises.variants.new.forEach( variant => {
				if(variant.Prices) variant.Prices.forEach( variantPrice => {
					variantPrice.VariantId = variant.Id;
					this.promises.variantPrices.new.push(new VariantPrice(variantPrice));
				});
			});
		};
		let willUpdate: VariantPrice[] = [];
		let willDelete: VariantPrice[] = [].concat(this.promises.variantPrices.old);
		let willCreate: VariantPrice[] = [].concat(this.promises.variantPrices.new);
		let sourceList: VariantPrice[] = [].concat(this.promises.variantPrices.new);

		let item: VariantPrice;
		let matchedItem: VariantPrice;
		let action: string;
		while(sourceList.length > 0) {
			item = sourceList.shift();
			matchedItem = willDelete.find( variantPrice => item.Id == variantPrice.Id);
			if(matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(willCreate.find( item => item.Id == matchedItem.Id)), 1);
				willUpdate.push(item);
			}
		};

		// console.log("will delete : ", willDelete);
		// console.log("will update  : ", willUpdate);
		// console.log("will create : ", willCreate);

		if(willCreate.length > 0) {
			this.variantPriceService.setCustomEndpoint('PostAll');
			this.variantPriceService.create(willCreate).subscribe(
				response => {
					response.forEach( (item, index) => {
						willCreate[index].Id = item;
					});
					this.promises.variantPrices.saved.create = true;
					this.resetVariantPrices();
				},
				error => {
					this.notificationService.add({type: 'danger', timeOut: 10000, text: 'Hata! (VariantPrice) '+error.Message});
				}
			);
		}else{
			this.promises.variantPrices.saved.create = true;
			this.resetVariantPrices();
		}

		if(willUpdate.length > 0) {
			this.variantPriceService.setCustomEndpoint('PutAll');
			this.variantPriceService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.variantPrices.saved.update = true;
					this.resetVariantPrices();
				}, error => {
					this.notificationService.add({type: 'danger', timeOut: 10000, text: 'Hata! (VariantPrice) '+error.Message});
				}
			);
		}else {
			this.promises.variantPrices.saved.update = true;
			this.resetVariantPrices();
		}

		if(willDelete.length > 0) {
			let total: number = willDelete.length;
			let index: number = 0;
			willDelete.forEach(variant => {
				this.variantPriceService.flushCustomEndpoint();
				this.variantPriceService.delete(variant.Id).subscribe(result => {
					index++;
					if(total == index) {
						this.promises.variantPrices.saved.delete = true;
						this.resetVariantPrices();
					}
				});
			});
		}else{
			this.promises.variantPrices.saved.delete = true;
			this.resetVariantPrices();
		}
	}

	checkSaved(){
		let unsaved: string[] = [];
		Object.keys(this.promises.product.saved).forEach( key => {
			if(!this.promises.product.saved[key]) unsaved.push(key);
		});
		console.log(unsaved.join(',') + ' kaydedilmeyi bekliyor.');
		if(this.product.IsBundle) {
			if(this.promises.product.saved.products && this.promises.product.saved.venueSeats && this.promises.product.saved.selectionTypes && this.promises.product.saved.priceLists && this.promises.product.saved.variants && this.promises.product.saved.variantPrices) {
				this.promises.product.saved = {performanceProduct: false, products: false, venueSeats: false, selectionTypes: false, priceLists: false, variants: false, variantPrices: false};
				this.notificationService.add({text: `${this.product.get('Name', true)} ürünü başarıyla kaydedildi.`, type:'success'});
				this.isPromising = false;
				if(this.onSaveComplete != null) {
					this.onSaveComplete();
				}else{
					this.isEditMode ? this.router.navigate(['products', 'bundles']) : this.router.navigate(['product', this.product.Id, 'edit']);
				}
			}
		}else{
			if(this.promises.product.saved.performanceProduct && this.promises.product.saved.venueSeats && this.promises.product.saved.selectionTypes && this.promises.product.saved.priceLists && this.promises.product.saved.variants && this.promises.product.saved.variantPrices) {
				this.promises.product.saved = {performanceProduct: false, products: false, venueSeats: false, selectionTypes:false, priceLists: false, variants: false, variantPrices: false};
				this.notificationService.add({text: `${this.product.get('Name', true)} ürünü başarıyla kaydedildi.`, type:'success'});
				this.isPromising = false;
				if(this.onSaveComplete != null) {
					this.onSaveComplete();
				}else{
					if(this.isEditMode) {
						if(this.queryParams.performanceId || this.queryParams.eventId) {
							if(this.queryParams.performanceId) this.router.navigate(['performance', this.queryParams.performanceId, 'products']);
							if(this.queryParams.eventId) this.router.navigate(['event', this.queryParams.eventId, 'products']);
						}else{
							this.router.navigate(['products', 'performances']);
						}
					}else {
						if(this.queryParams.performanceId || this.queryParams.eventId) {
							if(this.queryParams.performanceId) this.router.navigate(['product', this.product.Id, 'edit'], {queryParams: {performanceId: this.queryParams.performanceId}})
							if(this.queryParams.eventId) this.router.navigate(['product', this.product.Id, 'edit'], {queryParams: {performanceId: this.queryParams.eventId}})
						}else{
							this.router.navigate(['product', this.product.Id, 'edit']);
						}
					}
				}
			}
		}

	}

}
