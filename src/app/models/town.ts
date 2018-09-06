import { BaseModel } from '../classes/base-model';
import { City } from './city';

export class Town extends BaseModel{
	Name: string;
  	CityId: number;
	City: City;
  	Order: number;
  	Id: number;
}
