import { BaseModel } from '../classes/base-model';
import { Town } from './town';

export class Venue extends BaseModel{
	Code: string;
	TownId: number;
	Town: Town;
	Type: number;
	Logo: string;
	Video: string;
	Phone: string;
	WebUrl: string;
	SeatPlan: string;
	Name: string;
	Map: string;
	IsActive: boolean;
	Address:string;
	Latitude: number;
	Longitude: number;
	Location?: {
		Latitude?: number;
		Longitude?: number
	};
	VenueLocationInfo: {
        CountryId: number;
        TownId: number;
        CityId: number;
        TownName: string;
        CityName: string;
        CountryName: string
    };
	Images: string;
	OwnerFirmId: number;
	Id: number;
	Localization?: {
		Name?: string;
		ShortName?: string;
		Description?: string;
		Address?: string;
		TransportInfo?: string;
		ParkingInfo?: string;
		Facebook?: string;
		Twitter?: string;

		Tr?: {
			Name?: string;
			ShortName?: string;
			Description?: string;
			Address?: string;
			TransportInfo?: string;
			ParkingInfo?: string;
			Facebook?: string;
			Twitter?: string
		};
		En?: {
			Name?: string;
			ShortName?: string;
			Description?: string;
			Address?: string;
			TransportInfo?: string;
			ParkingInfo?: string;
			Facebook?: string;
			Twitter?: string
		}
	}
}
