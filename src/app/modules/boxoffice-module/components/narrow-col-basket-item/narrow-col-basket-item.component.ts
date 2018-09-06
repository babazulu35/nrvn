
import { Component, OnInit, HostBinding, Input, Output, EventEmitter, Inject } from '@angular/core';
import { MainLoaderService } from './../../../../services/main-loader.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-narrow-col-basket-item',
  templateUrl: './narrow-col-basket-item.component.html',
  styleUrls: ['./narrow-col-basket-item.component.scss']

})
export class NarrowColBasketItemComponent implements OnInit {
	model : any;
  isNarrowLoader:boolean;
  @HostBinding('class.c-narrow-col-basket-item') true;
  @Output() actionEvent: EventEmitter<any> = new EventEmitter();
  @Input() deleteIcon:string = 'delete';
  singleLoader = [];
  basketClearLoader:boolean;
  @Input()
  public set data(value)
  {
   	this.model = value;
  }
  constructor(private mainLoaderService: MainLoaderService,private router :Router

  ) {
   }

  ngOnInit() {
    //console.log("Model",this.model);
    
    this.mainLoaderService.narrowLoadHandler.subscribe(narrowLoadStatus => this.basketClearLoader = narrowLoadStatus.isnarrow );
    
  }

  countChangeHandler(model, product, value) {
    this.actionEvent.emit( {
      action: "countChange",
      modelId: model.id,
      variantId: product.id,
      changedValue: value
    } );
  }

  updateProduct(model, product) {
    this.actionEvent.emit( {
      action: "updateProduct",
      modelId: model.id,
      variantId: product.id
    } );
  }

  removeProduct(model, product) {
    this.mainLoaderService.narrowLoadHandlerSingle.subscribe(result => this.singleLoader[product.id] = result.isnarrowSingle);
    this.actionEvent.emit( {
      action: "removeProduct",
      modelId: model.id,
      variantId: product.id
    } );
  }
  actionHandler(action,...args) {
    switch(action) {
      case "goto":
      this.actionEvent.emit({
        action: action,
        url: args
      });
      //this.router.navigate(args); 
      break;
    }
  }

}
