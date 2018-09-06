import { Observable } from 'rxjs/Observable';
import { Component, OnInit,Input,HostBinding,EventEmitter,Output ,AfterContentInit} from '@angular/core';

@Component({
  selector: 'app-simple-product-list',
  templateUrl: './simple-product-list.component.html',
  styleUrls: ['./simple-product-list.component.scss']
})
export class SimpleProductListComponent implements OnInit {
  @HostBinding('class.c-simple-product-list') true;

  @Output() changeEvent: EventEmitter<any> = new EventEmitter();

  @Input() productItems:{id: number, title: string, price: number, currency: string, selected?: boolean, params?: {}}[];
  @Input() currency: string;
  @Input() selectedProductId: number;
  
  public get titleCase() {
    return "Ürünler Listesi"
  }
  constructor() { }

  ngOnInit() {
  }

  radioHandler(event) {
    this.productItems.map( item => item.selected = item.id == event);
    this.changeEvent.emit(this.productItems.find( item => item.id == event) );
  }
}
