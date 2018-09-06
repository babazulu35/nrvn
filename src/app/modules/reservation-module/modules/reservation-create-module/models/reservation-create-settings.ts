export class ReservationCreateSettings {
    static readonly OPTIONS_RESERVATIONS_EXPIRATION_TYPES: {value: any, label: string}[] = [
        {value: 0, label: "Süre yok"},
        {value: 1, label: "Performans başlangıcına belirli bir zaman kala"},
        {value: 2, label: "Rezervasyon yapıldıktan belirli bir zaman sonra"}
    ];

    static readonly OPTIONS_INVITATIONS_EXPIRATION_TYPES: {value: any, label: string}[] = [
        {value: 0, label: "Süre yok"},
        {value: 1, label: "Performans başlangıcına belirli bir zaman kala"},
        {value: 2, label: "Davetiye oluşturulduktan belirli bir zaman sonra"}
    ];

    static readonly OPTIONS_HOURS_RANGE: {value: any, text: string}[] = [
        {value: 0, text: "Süre seçin"},
		{value: 4*60, text: "4 saat"},
		{value: 12*60, text: "12 saat"},
		{value: 24*60, text: "1 gün"},
		{value: 2*24*60, text: "2 gün"},
		{value: 4*24*60, text: "4 gün"},
		{value: 7*24*60, text: "1 hafta"}
    ];

    static readonly OPTIONS_SEAT_COUNT_PER_CUSTOMER_OPTIONS: {value: any, text: string}[] = [
        {value: 0, text: "Seçiniz"},
        {value: 1, text: "1"},
        {value: 2, text: "2"},
        {value: 3, text: "3"},
        {value: 4, text: "4"},
        {value: 5, text: "5"},
        {value: 6, text: "6"},
        {value: 7, text: "7"},
        {value: 8, text: "8"},
        {value: 9, text: "9"},
        {value: 10, text: "10"}
    ]

    static readonly OPTIONS_RSVP: {label: string, value: any, icon: string, disabled?: boolean}[] = [
        {label: 'RSVP’li Davetiye', value: "rsvp-invitation",  icon: 'timelapse'},
        {label: 'Promoter Rezervasyon', value: "reservation", icon: 'timelapse'}
    ]
}