import { BaseModel } from '../classes/base-model';
import { FirmType} from './firm-type.enum';
import { SponsorType} from './sponsor-type.enum';

export class Firm extends BaseModel {
	ParentId: number;
	Code: string;
	Logo: string;
	IsPlatform: boolean;
	MobilePhone: string;
	WebPageUrl: string;
	Images: string;
	Videos: string;
	Location?: {
		Latitude: number,
		Longitude: number
	};
	Vat: number;
	IsActive: boolean;
	IsSeatSelectionEnabled: boolean;
	IdentityNumber: number;
	EArchiveUser: string;
	EArchivePassword: string;
	EticketUser: string;
	EticketPassword: string;
	ApiKey: string;
	ReservationAvailable: boolean;
	ServiceFee: number;
	ServiceFeeVat: number;
	TicketingFee: number;
	TicketingFeeVat: number;
	TicketingTrxFee: number;
	TicketingTrxFeeVat: number;
	InstallmentVat: number;
	Localization?: {

		Tr?: {
			Name: string,
			Description: string,
			Address: string,
			ShortName: string,
		},
		En?: {
			Name: string;
			Description: string;
			Address: string;
			ShortName: string
		}
	}
}

