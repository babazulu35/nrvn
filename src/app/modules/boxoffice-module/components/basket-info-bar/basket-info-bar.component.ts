
import { Component, OnInit, HostBinding, Input, TemplateRef, Output, EventEmitter, ComponentFactoryResolver, Injector, ComponentRef } from '@angular/core';
import { MainLoaderService } from './../../../../services/main-loader.service';
import { ContextMenuComponent } from '../../../common-module/components/context-menu/context-menu.component';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';


@Component({
  selector: 'app-basket-info-bar',
  templateUrl: './basket-info-bar.component.html',
	styleUrls: ['./basket-info-bar.component.scss'],
	entryComponents:[ContextMenuComponent]
})
export class BasketInfoBarComponent implements OnInit {

  @Input() cartItem:{state:any,data:any};
  @Input() basket: TemplateRef<any>;
  @Input() default: TemplateRef<any>;
  @Input() status:{action:{name:string},title:{text:string}};
  @Input() statusFlag:boolean = false;
  @Input() addButtonStatus:boolean = false;
  @Input() isLoading:boolean = false;
  @Input() addDisabled:boolean = true;

  @Output() actionEvent = new EventEmitter();
 
	isDisabled:boolean = false;
 @Input() showMenu:boolean; 

  constructor(private mainLoaderService: MainLoaderService,private resolver: ComponentFactoryResolver,private injector: Injector,public tetherService: TetherDialog) { }
  
  ngOnInit() {
		this.mainLoaderService.buttonStatusHandler.subscribe(result => {
			this.isDisabled= result.isbuttonDisabled;
					
		})
		this.mainLoaderService.buttonPromisingHandler.subscribe(result => {
			this.addButtonStatus = result.isbuttonPromising;
		})	


  }

  	totalDiscount(){
		return this.cartItem.data['SubTotal']['TotalAmount'] - this.cartItem.data['SubTotal']['CalculatedTotalAmount'];
  }
	countProductSelected() {
		let toplam = 0;
		for(let i = 0 ; i < this.cartItem.data['Events'].length; i++) {
			toplam += this.cartItem.data['Events'][i].CountOfProductsSelected
		}
		return toplam;
  }  
	totalPriceDetailAmount(subtotal) {
		let total = 0;
		subtotal.PriceDetails.forEach(price => {
			//console.log("Ticketing Fee",price.TicketingFee);
			if (price.ServiceFee) {
				total += price.ServiceFee;
			}
			if (price.TicketingFee) {
				total += price.TicketingFee;
			}
		})
		total += subtotal.TransactionAmount;
		return this.processAmount(total);
  }
  processAmount(amount) {
		return +(Math.floor(Number(amount) * 1000) / 1000).toFixed(2);
	}  
	
	actionHandler(action,event) {
		this.actionEvent.emit({state: action,data:event})
	}

	openBasketContextMenu(event) {
		let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector)
		let instance: ContextMenuComponent = component.instance;

		instance.actionEvent.subscribe(action => {
				
		});
		
		let actions = [
		 this.cartItem.data.total != null ?  { label: 'Sepeti Boşalt', icon: 'delete', action: "clearBasketItem"} : null ,
		]
		instance.data = actions;

		this.tetherService.context(component,
			{
				target: event.target,
				attachment: "bottom right",
				targetAttachment: "bottom right"
			}
		).then(result => {
			if (result) {
				switch(result.action) {
					case "clearBasketItem":
						this.actionEvent.emit({state:'CLEAR_BASKET',data:event})
					break;
				}
			}
		}).catch(reason => {
				//console.log("dismiss reason : ", reason);
		});
}	


}
