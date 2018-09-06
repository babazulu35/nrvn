import { VenueBlock } from './../../../../../models/venue-block';
import { Product } from "../../../../../models/product";

export class ReservationProduct {
    product: Product;
    productId?: number;
    productColor?: string;
    blockSeats?: {
        block?: VenueBlock,
        seatIds?: number[]
    }[]
}