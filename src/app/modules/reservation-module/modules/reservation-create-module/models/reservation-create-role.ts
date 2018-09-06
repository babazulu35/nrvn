export class ReservationCreateRole {
    path: string;
    parentRoutePath: string;
    endPoint: string;
    editorRole: string;
    expirationTypes?: {value: any, label: string}[];
    seatCountPerCustomerOptions?: {value: any, text: string}[];
    dictionary?: {};
}