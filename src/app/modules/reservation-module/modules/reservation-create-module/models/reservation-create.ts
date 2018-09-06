import { CrmAnonymousUser } from '../../../../../models/crm-anonymous-user';
import { ReservationExpirationType } from '../../../../../models/reservation-expiration-type.enum';
import { ReservationSeat } from './reservation-seat';

export class ReservationCreate {
    Name?: string;
    Description?: string;
    ExpirationTime?: number;
    SeatCountPerCustomer?: number;
    ExpirationType?: ReservationExpirationType;
    Customers?: CrmAnonymousUser[];
    Seats?: ReservationSeat[];
    CustomerSeats?: {
        Customer: CrmAnonymousUser,
        Seats: ReservationSeat[]
    }[];
}