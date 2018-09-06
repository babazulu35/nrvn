import { Product } from './../../../../models/product';
import { ModalSearchBoxComponent } from './../../../common-module/components/modal-search-box/modal-search-box.component';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { ContextMenuComponent } from './../../../common-module/components/context-menu/context-menu.component';
import { NotificationService } from './../../../../services/notification.service';
import { EntityService } from './../../../../services/entity.service';
import { RelativeDatePipe } from './../../../../pipes/relative-date.pipe';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, HostBinding, Output, EventEmitter, ComponentFactoryResolver, Injector, ComponentRef, Input } from '@angular/core';

@Component({
  selector: 'app-product-search-select',
  templateUrl: './product-search-select.component.html',
  styleUrls: ['./product-search-select.component.scss'],
  entryComponents: [ModalSearchBoxComponent],
  providers: [EntityService]
})
export class ProductSearchSelectComponent implements OnInit {
  @HostBinding('class.c-product-search-select') true;

  @Output() actionEvent: EventEmitter<{action: string, data?: any}> = new EventEmitter();
  @Output() changeEvent: EventEmitter<Product[]> = new EventEmitter();

  get isEmpty(): boolean { return !this.products || this.products.length == 0 };

  @Input() products: Product[];

  productsDic: {} = {};
	
  public searchBox: ModalSearchBoxComponent;
	searchSubscription: any;
	searchBoxActionSubscription: any;
	productAction: ContextMenuComponent;
	productActionSubscription: any;
  relativeDate: RelativeDatePipe = new RelativeDatePipe();

  constructor(
    private productEntityService: EntityService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.productEntityService.setCustomEndpoint('GetAll');
    this.productEntityService.data.subscribe ( products => {
			if(products && this.searchBox) {
        let result:{}[] = [];
        products.forEach(product => {
          result.push({
            id: product.Id, 
            title: product.Localization ? product.Localization.Name : "Undefined Name", 
            icon: "tag",
            params: {product: product}
          });
        });

        this.searchBox.searchResults = Observable.of([{
          title: "ARAMA SONUÇLARI",
          list: result
        }]);
      }
		});
  }

  public openSearchBox() {
		let component: ComponentRef<ModalSearchBoxComponent> = this.resolver.resolveComponentFactory(ModalSearchBoxComponent).create(this.injector);
		this.searchBox = component.instance;

		this.searchBox.title = "Ürün Ekle";
		this.searchBox.presets = Observable.of([]);
		this.searchBox.settings = {
			search: {
				placeholder: "Eklemek istediğiniz ürünü adını yazınız",
				feedback: {
					title: "Aramanız ile eşleşen performans bulunamadı", 
					description: "Arama kriterini değiştirerek yeniden deneyebilir ya da yeni ürün ekleyebilirsiniz.", 
					action: {action: "gotoLink", label: "YENİ ÜRÜN OLUŞTUR", params: {link: "product/create"}},
					icon: {type: "svg", name: "performance"}
				}
			}
		}

		this.searchSubscription = this.searchBox.searchEvent.subscribe( value => this.searchHandler(value));
		this.searchBoxActionSubscription = this.searchBox.actionEvent.subscribe( action => this.searchBoxActionHandler(action));
		
		this.tether.modal(component, {
			escapeKeyIsActive: true,
		}).then(result => {
      if(result && result["params"] && result["params"]["product"]) this.addProduct(result["params"]["product"]);
			this.searchBoxCloseHandler();
		}).catch( reason => {
			this.searchBoxCloseHandler();
		});
    this.actionEvent.emit({action: "openSearchBox", data: this.searchBox});
	}

  searchHandler(value) {
		this.productEntityService
      .fromEntity('PProduct')
      .search('Localization/Name', value)
      .expand(['Localization'])
      .take(100)
      .page(0)
      .executeQuery();
	}

	searchBoxActionHandler(Product) {
		switch(Product.action) {
			case "gotoLink":
			if(Product.params.link == "product/create") {
				this.actionEvent.emit({action: "createProduct"});
			}
			break;
		}
	}

	addProduct(product: Product) {
    if(this.productsDic[product.Id.toString()]) {
      this.actionEvent.emit({action: "exist", data: product})
      this.notificationService.add({text: '<b>'+product.Name + '</b> daha önce eklendi!', type:'danger'});
      return;
    }
    if(!this.products) this.products = [];
    this.productsDic[product.Id.toString()] = product;
    this.products.push(product);
    this.actionEvent.emit({action: "add", data: product})
    this.changeEvent.emit(this.products);
	}

  removeProduct(id: number) {
    let targetProduct: Product = this.products.find( product => product.Id == id );
    if(targetProduct) {
      this.products.splice(this.products.indexOf(targetProduct), 1);
      delete this.productsDic[targetProduct.Id.toString()];
      this.actionEvent.emit({action: "remove", data: targetProduct})
      this.changeEvent.emit(this.products);
    }
  }

	searchBoxCloseHandler() {
		this.searchBox = null;
		if(this.searchSubscription) this.searchSubscription.unsubscribe();
		if(this.searchBoxActionSubscription) this.searchBoxActionSubscription.unsubscribe();
    this.actionEvent.emit({action: "closeSearchBox", data: this.searchBox});
	}

	openProductActions(product:Product, e) {
    this.tether.context({
			title: "İŞLEMLER",
			data: [
				{action: "remove", label: "Sil", icon: "delete", params: {product: product}}
			]
		}, {target: e.target, attachment: "top right", targetAttachment: "top right",}).then( action => this.productActionHandler(action)).catch(error => {});
	}

	productActionHandler(product: {} | {action: string, params: {product: Product}}) {
		switch(product["action"]) {
			case "remove":
				if(this.products && this.products.length > 0 && product["params"]  && product["params"].product) {
					this.removeProduct(product["params"].product.Id);
				}
			break;
      case "edit":
        //if(product["params"]  && product["params"].product) this.openPerformerCreate(product["params"].performer);
      break;
		}
	}
}
