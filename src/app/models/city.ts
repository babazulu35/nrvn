import { BaseModel } from '../classes/base-model';

export class City extends BaseModel{
	CountryId: number;
    RegionId: number;
    Name: string;
    IsActive: boolean;
    Order: number;
    Id: number;
}
