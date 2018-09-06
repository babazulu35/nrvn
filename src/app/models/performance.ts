import { PerformancePerformer } from './performance-performer';
import { PerformanceProduct } from './performance-product';
import { Template } from './template';
import { Event } from './event';
import { Product } from './product';
import { BaseModel } from '../classes/base-model';
import { PerformanceStatus } from './performance-status.enum';
import { ReservationExpirationType } from './reservation-expiration-type.enum';

export class Performance extends BaseModel {
 	IsArchive: boolean;
    CategoryId: number;
    VenueTemplateId: number;
    Status: PerformanceStatus;
    PublishDate: string;
    SalesBeginDate: string;
    SalesEndDate: string;
    Code: string;
    Date: string;
    EndDate: string;
    IsEnabled: boolean;
    PurchaseTimeSeconds: number;
    IsSeason: boolean;
    SeasonalPerformanceId: number;
    Images: string;
    ReservationAvailable: boolean;
    ReservationExpirationType: ReservationExpirationType;
    ReservationExpirationTime: number;
    SuspensionReason: string;
    CancellationReason: string;
    IsAccessIntegrationActive: boolean;
    IsTicketForwardingAvailable: boolean;
    IsGenerateBarcodeAvailable: boolean;
    AccessIntegrationTypeId: number;
    NoExpire: boolean;
    ExpirationType: number;
    ExpirationDate: string;
    EventId: number;
    IsInviteFriendAvailable: boolean;
    InviteFriendExpirationType: ReservationExpirationType;
    InviteFriendExpirationTime: number;
    IsBundle: boolean;
    Id: number;
    PerformanceName: string;
    VenueTemplate: Template;
    Localization: {
        Name?: string;
        Description?: string;
        Tr?: {
          Name?: string;
          ShortName?: string;
          Description?: string;
          StatusText?: string
        },
        En?: {
          Name?: string;
          ShortName?: string;
          Description?: string;
          StatusText?: string
        }
	};
  Products?:PerformanceProduct[];
  Event?: Event;
  PerformancePerformers?: PerformancePerformer[];
}