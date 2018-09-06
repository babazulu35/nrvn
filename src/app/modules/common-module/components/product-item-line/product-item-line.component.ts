import { MainLoaderService } from './../../../../services/main-loader.service';
import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';

@Component({
  selector: 'app-product-item-line',
  templateUrl: './product-item-line.component.html',
  styleUrls: ['./product-item-line.component.scss']
})
export class ProductItemLineComponent implements OnInit {
  @HostBinding("class.c-product-item-line") true;

  @Output() actionEvent : EventEmitter<Object> = new EventEmitter<Object>();

  @Input() actions: {action: string, label: string, icon?: string, params?: any, group?: any }[];

  @Input() isDisabled: boolean = false;
  @Input() isInCart: boolean = false;
  @Input() name: string;
  @Input() price: number;
  @Input() currency: string= "TL";
  @Input() piece: number;
  @Input() hasContent: boolean =false;
  @Input() seatSelectable: boolean= false;
  @Input() event: any;
  @Input() variant: any;
  @Input() product : any;
  @Input() options: Array<any>;
  @Input() maxProductCount: number;
  @Input() minProductCount: number;
  @Input() categoryColorSeat: number;

  @HostBinding('class.c-product-item-line--view')
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

  goToProduct($event) {
    this.emitAction('edit');
  }

}
