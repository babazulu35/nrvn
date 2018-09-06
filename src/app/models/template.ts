import { Venue } from './venue';
import { BaseModel } from '../classes/base-model';

export class Template extends BaseModel{
	HallId: number;
	Id: number;
	VenueId: number;
  	Info: string;
  	LayoutImage: string;
  	IsStanding: boolean;
  	IsActive: boolean;
	Venue: Venue;
	Localization: {
        Name?: string;
		Info?:string;
        Tr?: {
          Name?: string;
          Info?: string;
        },
        En?: {
          Name?: string;
          Info?: string;
        }
	}
}