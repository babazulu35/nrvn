import { BaseModel } from '../classes/base-model';
import { EventStatus } from './event-status.enum';
import { Venue } from './venue';
import { ReservationExpirationType } from './reservation-expiration-type.enum';
import { EventType } from './event-type.enum';

export class Event extends BaseModel{
  EventId?:number;
  Name: string;
  OrganizerFirmId: number;
  Code: string;
  EventCode: string;
  Type: EventType;
  EmployeeId: number;
  MerchantTemplateId: number;
  PublishDate: string;
  SalesBeginDate: Date;
  SalesEndDate: Date;
  IsSortPriceMinMax: boolean;
  Status: EventStatus;
  Status_Desc: string;
  SuspensionReason: string;
  CancellationReason: string;
  SeatPlan: string;
  Vat: number;
  Logo: string;
  Logo2: string;
  Images: string;
  VideoUrl: string;
  ReservationAvailable: boolean;
  ReservationExpirationType: ReservationExpirationType;
  ReservationExpirationTime: number;
  IsInviteFriendAvailable: boolean;
  InviteFriendExpirationType: ReservationExpirationType;
  InviteFriendExpirationTime: number;
  ParentId: number;
  Id: number;
  PerformanceCount: number;
  ChildEventCount: number;
  BeginDate: Date;
  EndDate: Date;
  LocationInfo: string;
  PromoterId?:any;
  Performances: [
    {
       	PerformanceId: number;
        PerformanceName: string;
        CategoryId: number;
        CategoryName: string;
        Date: Date,
        Venue: {
            Id: number;
            Name: string;
            VenueTownName: string;
            VenueCityName: string;
        }
  	}
  ];
  AttributeList: [
    {
    	Id: number;
        IsActive: true;
        AttributeCode: string;
        Name: string;
  	}
  ];
  Localization?: {
    Name?: string;
    Description?: string;
    Tr?: {
      Name?: string;
      Description?: string;
      ShortName?: string;
      Info?: string;
      PriceInfo?: string;
      Rules?: string;
      SpotText?: string;
      StatusText?: string;
      GroupSaleDetail?: string;
      PdfInfo?: string;
      FacebookText?: string;
      TwitterText?: string
    };
    En?: {
      Name?: string;
      ShortName?: string;
      Description?: string;
      Info?: string;
      PriceInfo?: string;
      Rules?: string;
      SpotText?: string;
      StatusText?: string;
      GroupSaleDetail?: string;
      PdfInfo?: string;
      FacebookText?: string;
      TwitterText?: string
    }
  }
}
