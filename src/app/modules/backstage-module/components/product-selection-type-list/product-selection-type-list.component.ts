import { ProductSelectionType } from './../../../../models/product-selection-type';
import { EntityService } from './../../../../services/entity.service';
import { SalesChannel } from './../../../../models/sales-channel';
import { SelectionType } from './../../../../models/selection-type.enum';
import { AllocationType } from './../../../../models/allocation-type.enum';
import { Component, OnInit, HostBinding, Output, EventEmitter, Input, Inject } from '@angular/core';

@Component({
  selector: 'app-product-selection-type-list',
  templateUrl: './product-selection-type-list.component.html',
  styleUrls: ['./product-selection-type-list.component.scss'],
  providers: [
    { provide: 'salesChannelEntityService', useClass: EntityService },
    { provide: 'productSelectionTypeEntityService', useClass: EntityService },
  ]
})
export class ProductSelectionTypeListComponent implements OnInit {
  @HostBinding('class.c-product-selection-type-list') true;

  @Output() changeEvent: EventEmitter<ProductSelectionType[]> = new EventEmitter();

  @Input() productId: number;
  @Input() groupSelectionIsActive:boolean;

  public selectionTypes: ProductSelectionType[] = [];
  
  salesChannels: SalesChannel[];
  items: {id: number, name: string, icon?: string, selectionTypes:{label: string, value: any}[], allocationTypes:{label: string, value: any}[], selectionType: ProductSelectionType}[];

  get defaultItem() {
    return this.items ? this.items[0] : null
  }

  constructor(
    @Inject('salesChannelEntityService') private salesChannelEntityService: EntityService,
    @Inject('productSelectionTypeEntityService') private productSelectionTypeEntityService: EntityService,
  ) { }

  ngOnInit() {
    this.salesChannelEntityServiceDataHandler();
    this.productSelectionTypeEntityServiceDataHandler();
    if(this.productId) {
      this.resetProductSelectionTypeEntityService();
    }else{
      this.resetSalesChannelEntityService();
    }
  }

  ngOnChanges(changes) {
    if(changes.groupSelectionIsActive && changes.groupSelectionIsActive.currentValue) {
      if(this.selectionTypes) this.selectionTypes.map( selectionType => {
        selectionType.AllocationType = AllocationType.GeneralAdmission;
        selectionType.SelectionType = SelectionType.NotSet;
      });
    }
  }

  resetSalesChannelEntityService() {
    this.salesChannelEntityService.setCustomEndpoint('GetAll');
    this.salesChannelEntityService
      .fromEntity('CSalesChannel')
      .take(10000)
      .page(0)
      .executeQuery();
  }

  salesChannelEntityServiceDataHandler(){
    this.salesChannelEntityService.data.subscribe( result => {
      if(result && result.length) {
        this.salesChannels = result;
        this.items = [];
        let selectionType: ProductSelectionType;
        this.salesChannels.forEach( salesChannel => {
          selectionType = this.selectionTypes.find( item => item["SalesChannelId"] == salesChannel.Id);
          if(!selectionType) selectionType = new ProductSelectionType({
            ProductId: null,
            SalesChannelId: salesChannel.Id,
            SelectionType: 0,
            AllocationType: 0
          });
          this.items.push({
            id: salesChannel.Id,
            name: salesChannel.Name,
            icon: this.getIconByName(salesChannel.Name),
            selectionTypes: [
              {label: "En Uygun", value: SelectionType.NotSet},
              {label: "Koltuk", value: SelectionType.SeatSelection},
              {label: "Blok", value: SelectionType.BlockSelection}
            ],
            allocationTypes: [
              {label: "Ayakta", value: AllocationType.GeneralAdmission},
              {label: "Numarasız", value: AllocationType.UnassignedSeatingArrangement},
              {label: "Numaralı", value: AllocationType.AssignedSeatingArrangement}
            ],
            selectionType: selectionType
          })
        });
        this.emitChangeEvent();
      }
    });
  }

  resetProductSelectionTypeEntityService() {
    this.productSelectionTypeEntityService.setCustomEndpoint('GetAll');
    this.productSelectionTypeEntityService
      .fromEntity('PProductSelectionType')
      .where('ProductId', '=', this.productId)
      .take(10000)
      .page(0)
      .executeQuery();
  }

  productSelectionTypeEntityServiceDataHandler() {
    this.productSelectionTypeEntityService.data.subscribe( result => {
      if(result && result.length) {
        result.forEach( item => this.selectionTypes.push(item));
        this.resetSalesChannelEntityService();
      }
    });
  }

  getIconByName(name: string):string {
    let icon: string;
    switch(name) {
      case "Web":
        icon = "language";
      break;
      case "Mobil":
        icon = "smartphone";
      break;
      default:
        icon = "place";
    }
    return icon;
  }

  multiSelectGroupChangeHandler($event, target, key) {
    if(this.groupSelectionIsActive) {
      this.selectionTypes.map( selectionType => selectionType[key] = $event.value);
    }else{
      target[key] = $event.value;
    }
    this.emitChangeEvent();
  }

  emitChangeEvent() {
    let selectionTypes: ProductSelectionType[];
    this.selectionTypes = [];
    this.items.forEach( item => {
      this.selectionTypes.push(item.selectionType);
    });
    this.changeEvent.emit(this.selectionTypes);
  }

}
