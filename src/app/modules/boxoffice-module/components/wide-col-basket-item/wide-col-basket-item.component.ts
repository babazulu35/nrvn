import { Component, OnInit,Input,Output,EventEmitter,ElementRef } from '@angular/core';
import { ShoppingCartService } from '../../../../services/shopping-cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wide-col-basket-item',
  templateUrl: './wide-col-basket-item.component.html',
  styleUrls: ['./wide-col-basket-item.component.scss']
})
export class WideColBasketItemComponent implements OnInit {
  isEditable: boolean = true;
  @Output() actionEvent: EventEmitter<any> = new EventEmitter();
  @Output() fieldEdit: EventEmitter<any> = new EventEmitter();
  @Output() inlineEventBubbling: EventEmitter<any> = new EventEmitter();

  @Input() text:string ;
  @Input() state:any;

  @Input() options:Array<any>;

  @Input()  selectedProductCount:number;

  public selectedItems = [];
  public selectedSeats = [];
  seats = [];
  public isItemSelected:Array<boolean> = [];
  customer;


  constructor(
    private shoppingCartService : ShoppingCartService,
    private el: ElementRef,
    private router : Router
  ) { }

  ngOnInit() {
  	this.customer = this.shoppingCartService.getCartUser();
  	//this.model['Performances'].forEach(performance => this.seatsFromPerformances(performance));
  
   let productCount:number = 0;
    console.log("This widecol state",this.state);
   this.state['Products'].forEach(element => {
     productCount += element['CountOfProductsSelected'];
   
 });
 this.selectedProductCount = productCount;
 return this.selectedProductCount;

  }
  onColumnEdit($event) {
    console.log($event);
    this.inlineEventBubbling.emit($event);
  }

// Lazım Olabilir Şimdilik silmeyelim.

//   basketItemSelection(indexId,checkIsSeatable){
//     this.isItemSelected[indexId] = !this.isItemSelected[indexId];
//     if(checkIsSeatable == false){
//       if(this.isItemSelected[indexId] == false) {
//         this.selectedSeats.splice(indexId,1);
//       }
//       else
//       {
//         this.selectedSeats.push(this.data['products'][0]['basketItem'][indexId]['userId']);
//       }

//     }
//     else
//       {
//       if(this.isItemSelected[indexId] == false) {
//         this.selectedItems.splice(indexId,1);
//       }
//       else
//       {
//         this.selectedItems.push(this.data['products'][0]['basketItem'][indexId]['userId']);
//       }
//     }
// }

  removeSelectedItems(model,product) {

        if(this.selectedItems.length > 0)
        {
         this.actionEvent.emit( {
            action:"removeSelectedItem",
            modelId:model.id,
            eventId:product.id,
            removeThisUsersFromEvent:this.selectedItems
         })
        }
        else {
          this.actionEvent.emit({
            action:"removeAllItems",
            modelId:model.id,
            removeAllItems: true,
          })
        }
  }
  totalDiscountAmount(discounts){
  	let amount = 0;
  	discounts.forEach(discount => {
  		amount += discount['AppliedDiscountAmount'];
  	})
  	return amount.toFixed(2);
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
		return total;
	}
  update(id){
  	//let cancelAllResponse = window["DeviceIntegrationInstance"].cancelAllPayment();
  	this.router.navigate(['boxoffice',id,'products']);
  }
   totalDiscounts(){
  	return this.state['SubTotal']['TotalAmount'] - this.state['SubTotal']['CalculatedTotalAmount'];
  }
}
