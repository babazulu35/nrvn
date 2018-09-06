import { BaseModel } from '../classes/base-model';

export class Hall extends BaseModel {

    Id?: number;
    VenueId: number;
    IsActive: boolean;
    Localization?: {

		Tr?: {
			Name: string,
		},
		En?: {
			Name: string;
		}
    }
    AttributeValues?: {
        AttributeId: number,
        Value: number
    }[]
    Templates?: any[];

}