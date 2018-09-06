import { Component, OnInit, HostBinding, Input } from '@angular/core';
import { VenueBlock } from '../../../../models/venue-block';
import { Product } from '../../../../models/product';

export class ProductBlockCapacity {
  product: Product;
  productId?: number;
  productColor?: string;
  blockSeats?: {
      block?: VenueBlock,
      seatIds?: number[]
  }[]
}

@Component({
  selector: 'app-product-block-capacity-statistics',
  templateUrl: './product-block-capacity-statistics.component.html',
  styleUrls: ['./product-block-capacity-statistics.component.scss']
})
export class ProductBlockCapacityStatisticsComponent implements OnInit {
  @HostBinding('class.c-product-block-capacity-statistics') true;

  @Input() productBlockCapacity: ProductBlockCapacity;

  get blocksHasCapacity(): {block?: VenueBlock, seatIds?: number[]}[] {
    return this.productBlockCapacity && this.productBlockCapacity.blockSeats ? this.productBlockCapacity.blockSeats.filter( blockSeat => blockSeat.seatIds && blockSeat.seatIds.length > 0) : null;
  }

  constructor() { }

  ngOnInit() {

  }

}