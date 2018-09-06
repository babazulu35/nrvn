import { SeatListModalComponent } from './../../common/seat-list-modal/seat-list-modal.component';
import { Component, OnInit, HostBinding, Output, EventEmitter, Input, Injector } from '@angular/core';
import { TetherDialog } from "../../../common-module/modules/tether-dialog/tether-dialog";
import { MainLoaderService } from "../../../../services/main-loader.service";

@Component({
  selector: 'app-product-item-line-boxoffice',
  templateUrl: './product-item-line-boxoffice.component.html',
  styleUrls: ['./product-item-line-boxoffice.component.scss'],
  entryComponents: [SeatListModalComponent]
})
export class ProductItemLineBoxofficeComponent implements OnInit {
 @HostBinding("class.c-product-item-line-boxoffice") true;

  @Output() actionEvent : EventEmitter<Object> = new EventEmitter<Object>();
  @Output() currentEvent : EventEmitter<Object> = new EventEmitter<Object>();

  @Input() actions: {action: string, label: string, icon?: string, params?: any, group?: any }[];

  @Input() isDisabled: boolean = false;
  @Input() isInCart: boolean = false;
  @Input() name: string;
  @Input() price: number;
  @Input() currency: string= "TL";
  @Input() piece: number = 0;
  @Input() hasContent: boolean =false;
  @Input() seatSelectable: boolean= false;
  @Input() event: any;
  @Input() variant: any;
  @Input() product : any;
  @Input() options: Array<any>;
  @Input() maxProductCount: number;
  @Input() minProductCount: number;
  @Input() currentValue:number;
  @Input() categoryColorSeat: number;
  @Input() routeBasket:boolean = false;
  @Input() viewOptions:{stepper?:boolean,ticketing?:boolean,seatview?:boolean }
  @HostBinding('class.c-product-item-line-boxoffice--view')
  @Input() isViewOnly: boolean = false;

  infoHidden: boolean= true;
  count:number;
  
  isPromising:boolean;

  constructor(
    public tetherService: TetherDialog,
    private mainLoaderService: MainLoaderService
  ) {}

  ngOnInit() {

  }

  numberStepperEvent(val){
    this.count = parseInt(val);
    isNaN(this.count) == true ? this.count = 0 : null;
    this.actionEvent.emit({action:"countChange",productId:this.product.Id, variantId:this.variant.Id, count: this.count,countOfSelected:this.minProductCount});
    this.currentSelectedNumber(this.product.Id,this.variant.Id,this.currentValue,this.minProductCount);
  }
  
  currentSelectedNumber(productId,variantId,count,countOfSelected) {
    this.currentEvent.emit({productId:productId,variantId:variantId,count:count,countOfSelected: countOfSelected})
  }

  toggleInfo(){
    this.infoHidden = !this.infoHidden;
  }

  emitAction(action: string) {
    this.actionEvent.emit({
      action: this.isDisabled ? null: action,
      event: this.event,
      variant: this.variant,
      product: this.product,
      piece: this.count || this.minProductCount
    });
  };

  openContextMenu(event) {
    if(!this.actions || this.actions.length == 0) return;

    this.tetherService.context({
			title: "İŞLEMLER",
			data: this.actions
		}, {
      target: event.target
    }).then( result => this.actionEvent.emit({
      action: result["action"],
      params: result["params"],
      event: this.event,
      variant: this.variant,
      product: this.product,
      piece: this.count || this.minProductCount
    })).catch( reason => {});

  }


}
