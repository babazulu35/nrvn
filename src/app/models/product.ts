import { Variant } from './variant';
import { VenueSeat } from './venue-seat';
import { Currency } from './currency';
import { PriceList } from './price-list';
import { BaseModel } from '../classes/base-model';
import { Price } from './price';
import { ProductType } from './product-type.enum';

export class Product extends BaseModel{
	Id: number;
  	GroupId: number;
  	CurrencyId: number;
  	Name: string;
	Localization?: {
		Name?: string,
		Info?: string,
		Tr?: {
			Name?: string,
			Info?: string
		};
		En?: {
			Name?: string,
			Info?: string
		}
	}
    Info: string;
  	OrganizerFirmId: number;
  	Vat: number;
  	IsRefundable: boolean;
	IsBundle: boolean;
  	MaxProductsPerTrx: number;
	IsSeatSelectionAvailable: boolean;
	PriceLists: PriceList[];
	Variants: Variant[];
	Currency: Currency;
	Seats?: VenueSeat[];
}