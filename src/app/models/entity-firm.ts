import { BaseModel } from '../classes/base-model';

export class EntityFirm extends BaseModel {
	Type?: number;
  	SubType?: number;
  	EventId?: number;
  	PerformanceId?: number;
  	VenueId?: number;
  	OwnerFirmId?: number;
  	Id?: number;
	OwnerFirmDetail?: {
		Logo: string,
		Name: string,
		ShortName: string
	}
}