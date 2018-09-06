import { BaseModel } from "../classes/base-model";

export class FirmCreate extends BaseModel {
	Id: number;
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
		Name?: string,
		Description?: string,
		Address?: string,
		ShortName?: string,
		Tr?: {
			Name?: string,
			Description?: string,
			Address?: string,
			ShortName?: string,
		},
		En?: {
			Name?: string;
			Description?: string;
			Address?: string;
			ShortName?: string
		}		
	}
}