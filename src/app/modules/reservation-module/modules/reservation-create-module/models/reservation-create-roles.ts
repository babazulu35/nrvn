import { ReservationCreateRole } from './reservation-create-role';
import { ReservationCreateSettings } from './reservation-create-settings';

export class ReservationCreateRoles {
    static readonly ROLE_RESERVATION: ReservationCreateRole = {path: "reservation", parentRoutePath: "reservations", endPoint: "CreateReservation", editorRole: "customer_assignment", 
        expirationTypes: ReservationCreateSettings.OPTIONS_RESERVATIONS_EXPIRATION_TYPES,
        dictionary: {
            title: {
                main: "Rezervasyon",
                settings: "Rezervasyon Ayarları"
            },
            label: {
                Name: "REZERVASYONA İSİM VERİN",
                ExpirationType: "Rezervasyon geçerlilik süresini seçin"
            }
        }
    };
    static readonly ROLE_INVITATION: ReservationCreateRole = {path: "invitation", parentRoutePath: "invitations", endPoint: "CreateInvitation", editorRole: "customer_assignment", 
        dictionary: {
            title: {
                main: "Davetiye",
                settings: "Davetiye Ayarları"
            },
            label: {
                Name: "DAVETİYEYE İSİM VERİN"
            }
        }
    };
    static readonly ROLE_RSVP_INVITATION: ReservationCreateRole = {path: "rsvp-invitation", parentRoutePath: "reservations", endPoint: "CreateRsvpInvitation", editorRole: "customer_assignment", 
        expirationTypes: ReservationCreateSettings.OPTIONS_INVITATIONS_EXPIRATION_TYPES,
        dictionary: {
            title: {
                main: "Davetiye",
                settings: "Davetiye Ayarları"
            },
            label: {
                Name: "DAVETİYENİZE İSİM VERİN",
                ExpirationType: "Davetiye geçerlilik süresini seçin"
            }
        }
    };
    static readonly ROLE_RSVP_POOL_INVITATION: ReservationCreateRole = {path: "rsvp-pool-invitation", parentRoutePath: "pool-invitations", endPoint: "CreateRsvpPoolInvitation", editorRole: "customer_assignment",//"invitation_pool", 
        expirationTypes: ReservationCreateSettings.OPTIONS_INVITATIONS_EXPIRATION_TYPES,
        seatCountPerCustomerOptions: ReservationCreateSettings.OPTIONS_SEAT_COUNT_PER_CUSTOMER_OPTIONS,
        dictionary: {
            title: {
                main: "Davetiye",
                settings: "Davetiye Ayarları"
            },
            label: {
                Name: "DAVETİYENİZE İSİM VERİN",
                ExpirationType: "Davetiye geçerlilik süresini seçin",
                SeatCountPerCustomer: "Kişi bazlı giriş hakkını seçiniz",
            }
        }
    };
}