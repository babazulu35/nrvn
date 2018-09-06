import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class MockService {
    private guestComponent: any;

    constructor() {}
    fillInputs(self: Object, parameters: Object, ignore: boolean = false): void {
        if (!environment.production && !ignore) {
            let componentName = 'set' + self.constructor.name;
            this.guestComponent = self;
            this[componentName](parameters);
        }
    }
    private setSelectboxComponent(parameters): void {
        if (!this.guestComponent.options) {
            if (parameters.isString) {
                this.guestComponent.options = [{
                    value: 'performers',
                    text: 'SANATÇILAR'
                }, {
                    value: 'venues',
                    text: 'MEKANLAR'
                }];
                this.guestComponent.options = [{
                    value: 'products',
                    text: 'ADA GÖRE'
                }, {
                    value: 'venues',
                    text: 'SIRAYA GÖRE'
                }];
            } else {
                this.guestComponent.options = [{
                    value: 10,
                    text: '10'
                }, {
                    value: 20,
                    text: '20'
                }];
            }
        }
    }

    private setPromiseIconComponent(paramter): void {
        this.guestComponent.iconName = "search";
    }

    private setAvatarComponent(type?: string): void {
        switch (type) {
            case "source":
            default:
                this.guestComponent.source = "http://lorempixel.com/400/200/people/9/";
                break;
            case "icon":
                this.guestComponent.iconName = "person";
                break;
            case "letters":
                this.guestComponent.letters = "AC";
                break;
        }
    }

    private setProfilePhotoComponent(parameters): void {
        this.guestComponent.source = "http://lorempixel.com/400/200/people/9/";
        this.guestComponent.type = 'avatar';
    }
    private setNarrowInlineFeedbackComponent(paramters: any): void {
        if (paramters[0] == true) {
            this.guestComponent.iconName = paramters[1];
            this.guestComponent.countValue = paramters[3];
            this.guestComponent.title = "<strong>Sepete henüz ürün eklenmemiş.</strong>";
            this.guestComponent.iconAngle = paramters[2];
            this.guestComponent.description = ``;
        }
        else {
            this.guestComponent.iconName = "person";
            this.guestComponent.countValue = 32;
            this.guestComponent.title = "Lorem ipsum dolor sit amet";
            this.guestComponent.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam porta ex quis lacinia vehicula. In accumsan molestie fringilla. ";
            this.guestComponent.iconAngle = 0;
        }
    }

    private setPaginationComponent(parameters): void {
        this.guestComponent.totalItem = 43;
        this.guestComponent.showItemPerPage = 5;
        this.guestComponent.currentPage = 1;
    }

    private setHeaderSearchBarComponent(parameters) {
        this.guestComponent.title = "ARAYIN";
    }
    private setHeaderLargeSearchComponent(parameters): void {
        this.guestComponent.isPromising = false;
        this.guestComponent.options = [{
            value: "name",
            text: "İsim"
        }, {
            value: "date",
            text: "Tarih"
        }];
        this.guestComponent.data = "lorem ipsum";
        this.guestComponent.placeholder = {
            name: "İsme göre arama yapın",
            date: "Tarihe göre arama yapın"
        };
        this.guestComponent.inputType = "date"
    }

    private setInlineSearchInputComponent(parameters) {
        this.guestComponent.placeholder = "Görüntülemek İstediğiniz Mekan";
        this.guestComponent.iconName = "search";
    }

    private setTypeaheadComponent(paramters): void {
        this.guestComponent.searchPlaceholder = "Etkinlikler Arasında Arayın";
        this.guestComponent.searchIconName = "search";

        this.guestComponent.feedback = {
            title: "Aramanız ile eşleşen müşteri kaydı bulunamadı",
            description: "Arama kriterini değiştirerek yeniden deneyebilir ya da yeni müşteri ekleyebilirsiniz."
        }

        this.guestComponent.presets = Observable.of([{
            title: "GEÇMİŞ ARAMALAR",
            list: [{
                id: "01",
                icon: "event",
                title: "Babylon Bomonti",
                description: null
            },
            {
                id: "02",
                icon: "event",
                title: "Babylon Kilyos",
                description: null
            },
            {
                id: "03",
                icon: "event",
                title: "Babylon Çeşme",
                description: null
            }
            ]
        },
        {
            title: "ETKİNLİKLER",
            list: [{
                id: "01",
                icon: "event",
                title: "Akbank Caz Festivali: Imany",
                description: "(<i>21 Ekim 2016 Cuma Saat: 22:00,</i> <b>Vokswagen Arena</b>)"
            },
            {
                id: "02",
                icon: "event",
                title: "Akbank Caz Festivali: Cazlı Brunch",
                description: "(<i>21 Ekim 2016 Cuma Saat: 22:00,</i> <b>Vokswagen Arena</b>)"
            },
            {
                id: "03",
                icon: "event",
                title: "Akbank Caz Festivali: Cazlı Brunch",
                description: "(<i>21 Ekim 2016 Cuma Saat: 22:00,</i> <b>Vokswagen Arena</b>)"
            }
            ]
        },
        {
            title: "SANATÇILAR",
            list: [{
                id: "01",
                icon: "person",
                title: "Akbank Caz Festivali: Imany"
            },
            {
                id: "02",
                icon: "people",
                title: "Akbank Caz Festivali: Cazlı Brunch"
            }
            ]
        }
        ]);
    }


    private setInlineEditComponent(paramters): void{
        this.guestComponent.data = "";
        this.guestComponent.placeholder= "Burayı düzenle";
        this.guestComponent.isError = false;
        this.guestComponent.isEditing = false;
        this.guestComponent.isPromising = false;
        this.guestComponent.delay = 400;
    }
    private setHeaderInlineEditComponent(paramters): void{
        this.guestComponent.data = "Yeni Etkinlik";
        this.guestComponent.placeholder= "Yeni Etkinlik";
        this.guestComponent.breadcrumbs= [{label:'Etkinlikler', routerLink:'events/'}];
        this.guestComponent.isError = false;
        this.guestComponent.isEditing = false;
        this.guestComponent.isPromising = false;
        this.guestComponent.delay = 400;
    }

    private setTreeViewComponent(parameters): void {
        this.guestComponent.list = [{
            type: 'events',
            text: 'Etkinlik Bilgileri',
            id: 1
        }, {
            type: 'news',
            text: 'Haberler',
            id: 2
        }];
        this.guestComponent.isAllEnabled = true;
        this.guestComponent.title = "Title";
    }

    private setMultiSelectGroupComponent(parameters) {
        this.guestComponent.data = [{
            label: 'Müzisyen',
            value: 'musician',
            icon: 'audiotrack'
        },
        {
            label: 'Oyuncu',
            value: 'performer',
            icon: 'movie'
        },
        {
            label: 'Sporcu',
            value: 'athlete',
            icon: 'directions_run'
        },
        {
            label: 'Konuşmacı',
            value: 'speaker',
            icon: 'insert_comment'
        },
        {
            label: 'Şef',
            value: 'chef',
            icon: 'room_service'
        },
        {
            label: 'Ressam',
            value: 'illustrator',
            icon: 'color_lens'
        },
        {
            label: 'Fotoğraf Sanatçısı',
            value: 'photographer',
            icon: 'camera'
        },
        {
            label: 'Akademisyen',
            value: 'academician',
            icon: 'school'
        },
        {
            label: 'Yazar',
            value: 'author',
            icon: 'format_align_center'
        }
        ];
    }

    private setContextMenuComponent(parameters?: any): void {
        this.guestComponent.title = "Diğer Seçenekler"
        this.guestComponent.data = [{
            action: "gotoLink",
            parameters: ['sponsor'],
            icon: 'attach_money',
            label: 'Sponsorlar'
        },
        {
            action: "gotoLink",
            parameters: ['categories'],
            icon: 'local_offer',
            label: 'Kategoriler'
        },
        {
            action: "gotoLink",
            parameters: ['genre'],
            icon: 'queue_music',
            label: 'Tarzlar'
        },
        {
            action: "gotoLink",
            parameters: ['notes'],
            icon: 'receipt',
            label: 'Ön Tanımlı Notlar'
        },
        {
            action: "gotoLink",
            parameters: ['dummy'],
            icon: 'timeline',
            label: 'Lorem Ipsum Sit Amet'
        },
        {
            type: "aside",
            action: "openModal",
            parameters: ['sponsor'],
            label: 'Sponsorlar'
        },
        {
            type: "aside",
            action: "openModal",
            parameters: ['categories'],
            label: 'Kategoriler'
        },
        {
            type: "aside",
            action: "openModal",
            parameters: ['genre'],
            label: 'Tarzlar'
        }
        ]
    }
    private setIconGridComponent(parameters): void {
        this.guestComponent.data = [{
            id: 1,
            text: "Spor Karşılaşması",
            path: "assets/images/icon-grid/seating-arrangement01.jpg"
        },
        {
            id: 2,
            text: "Parti",
            path: "assets/images/icon-grid/seating-arrangement02.jpg",
            actions: [{
                label: 'Edit',
                router: '/venues'
            },
            {
                label: 'Delete',
                'router': '/performer/list'
            }
            ]
        },
        {
            id: 3,
            text: "Bölümlü Koltuklar",
            path: "assets/images/icon-grid/seating-arrangement03.jpg"
        }
        ];
        this.guestComponent.newButtonLabel = "Yeni Duzen";
    }

    private setCoverImageComponent(parameters?: any): void {
        this.guestComponent.backgroundImage = "../../assets/images/cover-image/cover-image.jpg";
        this.guestComponent.maskColor = "#dedede";
    }

    private setOverImageStatsComponent(parameters?: any): void {
        this.guestComponent.data = [{
            value: 17,
            label: 'ETKİNLİK'
        }, {
            value: 36,
            label: 'PERFORMANS'
        }, {
            value: 24,
            label: 'KİŞİ / EKİP'
        }]
    }

    private setTabBarComponent(parameters?: any): void {
        this.guestComponent.data = [{
            routerLink: "/venue/1/layouts",
            label: 'TEK GÜNLÜ ETKİNLİKLER'
        },
        {
            routerLink: "/performers/list",
            label: 'ÇOK GÜNLÜ ETKİNLİKLER'
        },
        {
            routerLink: "/events",
            label: 'ÇATI ETKİNLİKLERİ'
        }
        ]
    }
    private setVerticalKvListComponent(parameters?: any): void {
        this.guestComponent.data = [{
            key: 'total',
            label: 'TOPLAM KAPASİTE',
            value: '1500'
        },
        {
            key: 'sold',
            label: 'SATILAN',
            value: '60'
        },
        {
            key: 'stock',
            label: 'KALAN',
            value: '1440'
        }
        ]
    }
    private setMultiSelectionBarComponent(parameters?: any): void {
        this.guestComponent.selectedItems = [{
            key: 'total',
            label: 'TOPLAM KAPASİTE',
            value: '1500'
        },
        {
            key: 'sold',
            label: 'SATILAN',
            value: '60'
        },
        {
            key: 'stock',
            label: 'KALAN',
            value: '1440'
        }
        ];
        this.guestComponent.numberOfTotalItem = 29;
        this.guestComponent.actionButtons = [{
            label: 'Kopyala',
            icon: 'layers',
            action: 'copy'
        },
        {
            label: 'Gizle',
            icon: 'visibility',
            action: 'visibilityOn'
        },
        {
            label: 'Göster',
            icon: 'visibility_off',
            action: 'visibilityOff'
        },
        {
            label: 'Arşivle',
            icon: 'archive',
            action: 'archive'
        },
        {
            label: 'Sil',
            icon: 'delete',
            action: 'delete'
        },

        ]
    }
    private setCheckboxComponent(parameters): void {
        //this.guestComponent.isDisabled = false;
        //this.guestComponent.type = "lightswitch";
        //this.guestComponent.theme = "light";
        //this.guestComponent.isChecked = false;
        //this.guestComponent.label = "lorem ipsum";
    }

    private setTitleSwitcherComponent(paramters?: any): void {
        this.guestComponent.title = "Content Title";

        this.guestComponent.finderTitle = "ARAYIN"
        this.guestComponent.finderSearchPlaceholder = "Görüntülemek İstediğiniz Mekan";
        this.guestComponent.finderPresets = Observable.of([{
            title: "GEÇMİŞ ARAMALAR",
            list: [{
                id: "01",
                icon: "event",
                title: "Babylon Bomonti",
                description: null
            },
            {
                id: "02",
                icon: "event",
                title: "Babylon Kilyos",
                description: null
            },
            {
                id: "03",
                icon: "event",
                title: "Babylon Çeşme",
                description: null
            }
            ]
        }]);
        this.guestComponent.finderSearchFeedback = {
            title: "Aradığınız mekan bulunamadı",
            description: "Arama kriterini değiştirerek yeniden deneyebilir ya da yeni müşteri ekleyebilirsiniz."
        }
    }

    private setWideColBasketItemComponent(paramters?:any) {
        this.guestComponent.data = {
            id:"1",
            type:"Event",
            date:"11 Eylül 2017",
            location:"Bomonti Ada",
            isSeatable:true,
            maxCapacity:"5000",
            products: [ {
                id:"1",
                type:"single",
                title:"Nirvana Konseri Bileti",

                basketItem:[
                    {
                        userId: "1",
                        userName: 'Kurt Cobain',
                        userPhone: '0555 358 78 78',
                        isReserved: false,
                        seatNumber: Math.floor(Math.random() * 1001) + 'A',
                        fieldNumber: Math.floor(Math.random() * 1001),
                        price: 12,


                    },
                    {
                        userId: '2',
                        userName: 'DR.Emmet Brown',
                        userPhone: '0555 345 78 45',
                        isReserved: true,
                        seatNumber: Math.floor(Math.random() * 1001) + 'A',
                        fieldNumber: Math.floor(Math.random() * 1001),
                        price: 10,
                    }
                ]
            }]

        }
    }

    private setNarrowColBasketItemComponent(parameters?: any) {
        this.guestComponent.data = {
            id: '1',
            type: 'ETKİNLİK',
            title: 'Lorem Ipsum Dolor Sit Amet',
            date: '16 Kasım Çarşamba 20:00',
            location: 'Volkswagen Arena, İstanbul',
            products: [{
                id: '1',
                type: 'single',
                title: 'Lorem Ipsum Dolor Sit Amet Consectetur Bileti',
                price: '50.00'
            },
            {
                id: '2',
                type: 'single',
                title: 'Lorem Ipsum Dolor Sit Amet Consectetur Bileti',
                price: '50.00'
            },
            {
                id: '3',
                type: 'single',
                title: 'Lorem Ipsum Dolor Sit Amet Consectetur Bileti',
                price: '50.00'
            },
            {
                id: '4',
                type: 'multi',
                title: 'Lorem Ipsum Dolor Sit Amet Consectetur Bileti',
                price: '50.00',
                count: {
                    current: 2,
                    min: 1,
                    max: 10
                }
            },
            {
                id: '5',
                type: 'custom',
                title: 'Lorem Ipsum Dolor Sit Amet Consectetur Bileti',
                price: '50.00',
                isCustom: true
            }
            ]
        }
    }

    setNarrowClientDisplayComponent(parameters?: any) {
        this.guestComponent.addCustomerButtonLabel = 'Müşteri Bilgisi Ekle';
        this.guestComponent.userData = {
            id: '1',
            fullname: 'Altuğ Canıtez',
            phone: '0532 6945959',
            address: 'Beşiktaş, İstanbul',
            avatar: 'http://lorempixel.com/400/200/people/9/'
        }
    }

    setFullscreenCoverComponent(paramters?: any) {
        this.guestComponent.backgroundImage = 'https://placeimg.com/1000/800/any/grayscale';
        this.guestComponent.backgroundColor = '#3e3e3e';
    }

    getMemberInfo(memberId: number) {

        return Observable.of({
            PersonalInfo: {
                FirstName: 'Sevgi',
                LastName: 'Sevil',
                FullName: 'Sevgi M. Sevil',
                NationalIdentityNumber: '44526883736',
                Birthday: new Date(1986, 4, 1),
                Gender: 'Kadın',
                Region: 'İstanbul',
                ProfilePicture: ''},
            PhoneNumbers: [
                {
                    PhoneNumberType: 'GSM',
                    PhoneNumber: '6514465',
                    AreaCode: '536',
                    CountryCode: '90',
                    IsActivated: true,
                    IsDefault: true
                },
                {
                    PhoneNumberType: 'Ev',
                    PhoneNumber: '5943726',
                    AreaCode: '212',
                    CountryCode: '90',
                    IsActivated: false,
                    IsDefault: false
                },
            ],
            EmailAddresses: [
                {
                    EmailAddressType: 'Kişisel',
                    EmailAddress: 'this-person@personal.com',
                    IsActivated: true,
                    IsDefault: true
                },
                {
                    EmailAddressType: 'İş',
                    EmailAddress: 'this-employee@company.com',
                    IsActivated: false,
                    IsDefault: false
                },
            ],
            PostalAddresses: [
                {
                    PostalAddressType: 'Ev',
                    PostalAddress: 'Güzel mah. İyi cad. Harikulade apt. No:55/4 Bazıyer/İstanbul'
                },
                {
                    PostalAddressType: 'İş',
                    PostalAddress: 'Ciddi mah. Düzgün cad. Şu Plaza No:55 Kat:4 Önemliyer/İstanbul'
                },
            ],
            Licences: [
                {
                    LicenceText: 'İzin veriyorum.',
                    LicenceVersion: 5,
                    IsConfirmed: true
                },
                {
                    LicenceText: 'Aramanıza izin veriyorum.',
                    LicenceVersion: 2,
                    IsConfirmed: true
                },
                {
                    LicenceText: 'E-posta yollamanıza izin veriyorum.',
                    LicenceVersion: 1,
                    IsConfirmed: false
                },
                {
                    LicenceText: 'SMS yollamanıza izin veriyorum.',
                    LicenceVersion: 2,
                    IsConfirmed: true
                },
                {
                    LicenceText: 'Posta yollamanıza izin veriyorum.',
                    LicenceVersion: 12,
                    IsConfirmed: true
                },
            ],
            SocialMediaAccounts: [
                {
                    SocialMediaAccountType: 'facebook',
                    SocialMediaAccountUserName: 'sevgi-sevil',
                    IsConnected: true
                },
                {
                    SocialMediaAccountType: 'twitter',
                    SocialMediaAccountUserName: 'sevil99',
                    IsConnected: true
                },
                {
                    SocialMediaAccountType: 'youtube',
                    SocialMediaAccountUserName: 'sevgi-sev097',
                    IsConnected: true
                },
                {
                    SocialMediaAccountType: 'lastfm',
                    SocialMediaAccountUserName: 'sevgi-develops',
                    IsConnected: true
                },
                {
                    SocialMediaAccountType: 'instagram',
                    SocialMediaAccountUserName: 'sevgi-sevil',
                    IsConnected: true
                },
                {
                    SocialMediaAccountType: 'linkedin',
                    SocialMediaAccountUserName: 'sevgi-sevil',
                    IsConnected: true
                },
            ],
        });
    }

    sendOTP(phoneNumber) {
        return Observable.create(
            observer => {
                observer.onNext(true);
                observer.onCompleted();
            }
        );
    }

    sendConfirmationEmail(email) {
        return Observable.create(
            observer => {
                observer.onNext(true);
                observer.onCompleted();
            }
        );
    }

    addPhoneNumber(memberId, phoneNumberObj) {
        return Observable.create(
            observer => {
                observer.onNext(true);
                observer.onCompleted();
            }
        );
    }

    deletePhoneNumber(memberId, phoneNumber) {
        return Observable.create(
            observer => {
                observer.onNext(true);
                observer.onCompleted();
            }
        );
    }

    updatePhoneNumber(memberdId, phoneNumberObj) {
        return Observable.create(
            observer => {
                observer.onNext(true);
                observer.onCompleted();
            }
        );
    }

    addEmailAddress(memberId, emailAddressObj) {
        return Observable.create(
            observer => {
                observer.onNext(true);
                observer.onCompleted();
            }
        );
    }

    deleteEmailAddress(memberId, emailAddress) {
        return Observable.create(
            observer => {
                observer.onNext(true);
                observer.onCompleted();
            }
        );
    }

    updateEmailAddress(memberdId, emailAddressObj) {
        return Observable.create(
            observer => {
                observer.onNext(true);
                observer.onCompleted();
            }
        );
    }

    addPostalAddress(memberId, postalAddressObj) {
        return Observable.create(
            observer => {
                observer.onNext(true);
                observer.onCompleted();
            }
        );
    }

    deletePostalAddress(memberId, postalAddress) {
        return Observable.create(
            observer => {
                observer.onNext(true);
                observer.onCompleted();
            }
        );
    }

    updateSocialMediaAccount(memberId, socialMediaAccountObj){
        return Observable.create(
            observer => {
                observer.onNext(true);
                observer.onCompleted();
            }
        );
    }

    deleteMember(memberId){
        return Observable.create(
            observer => {
                observer.onNext(true);
                observer.onCompleted();
            }
        );
    }

    private setWideBasketComponent(parameters) {
        this.guestComponent.eventDetail = [
            {
                venueName: 'Bomonti Ada',
                venueType: true, // 0.Koltuk Seçeneği Aktif , 1.Koltuk Seçeneği in-aktif
                eventName: 'İsmail Türüt',
                eventId: 1,
                eventDate: '16 Kasım 2016',
                eventType: 1, // 1.Tekli Etkinlik,2.Çoklu Etkinlik
                eventPrice: '12,50',
                venueCapacity: 40,
                basketItem: [{
                    id: Math.floor(Math.random() * 1001),
                    seatNumber: Math.floor(Math.random() * 1001) + 'A',
                    fieldNumber: Math.floor(Math.random() * 1001),
                    userName: 'Hakan Hüriyet',
                    phoneNumber: '555456789645'
                },
                {
                    id: Math.floor(Math.random() * 1001),
                    seatNumber: Math.floor(Math.random() * 1001) + 'A',
                    fieldNumber: Math.floor(Math.random() * 1001),
                    userName: 'Aysan Hüriyet',
                    phoneNumber: '555456789645'

                },
                {
                    id: Math.floor(Math.random() * 1001),
                    seatNumber: Math.floor(Math.random() * 1001) + 'A',
                    fieldNumber: Math.floor(Math.random() * 1001),
                    userName: 'Alehandro Yılmaz',
                    phoneNumber: '555456789645'

                },
                ]

            },
            {
                venueName: 'Vw Arena',
                venueType: 1, // 0.Koltuk Seçeneği Aktif , 1.Koltuk Seçeneği in-aktif
                eventName: 'Sia',
                eventId: 2,
                eventDate: '16 Kasım 2016',
                eventType: 1, // 1.Tekli Etkinlik,2.Çoklu Etkinlik
                eventPrice: '12,50',
                venueCapacity: 20,
                basketItem: [{
                    id: Math.floor(Math.random() * 1001),
                    seatNumber: Math.floor(Math.random() * 1001) + 'A',
                    fieldNumber: Math.floor(Math.random() * 1001),
                    userName: 'Osman Orhan',
                    phoneNumber: '555456789645'
                    },
                    {
                        id: Math.floor(Math.random() * 1001),
                        seatNumber: Math.floor(Math.random() * 1001) + 'A',
                        fieldNumber: Math.floor(Math.random() * 1001),
                        userName: 'Gökçen Öğütçü',
                        phoneNumber: '555456789645'
                    }
                ]
            }
        ]
    }

	setAuthDialogBoxComponent(paramters?:any) {
		this.guestComponent.headerLogo = '../../assets/images/logo/nirvana.png';
		this.guestComponent.headerBackgroundColor = '#EE4C42';
	}

    private setVenueEditComponent():void {
        this.guestComponent.data = {
            name:'Babylon',
            address:'Bomonti Ada Eski Bira Fabrikası Bomonti/Istanbul',
            email:'babytio@babylon.com.tr',
            description:'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum, omnis, qui labore fuga non distinctio, reprehenderit tempora facilis, iure numquam eaque ratione. Molestiae doloremque ipsam architecto excepturi cumque. Nisi, dicta.',
            coordinate:{
                vertical:'22.457.445.65',
                horz:'13.54.789.200'
            },
            phone:{
                area:'0212',
                number:'7890054'
            }
        }
    }
    private setTextInputComponent(parameters):void {
        this.guestComponent.placeholder = 'Placeholder text';
    }
    private setNarrowColActionBlockComponent(parameters):void {
        this.guestComponent.data = {
            image: 'http://lorempixel.com/160/160/people/9',
            label: 'Akbank Caz Festivali Edebiyat & Caz : Murat Meriç ile Türkiye’de Müzik Tarihi',
            link: '#',
            isActive: true
        }
        this.guestComponent.action = {
            iconName: 'replay',
            name: 'revert'
        }
        this.guestComponent.contextMenuItems = [{
            action: 'copyEvent',
            parameters: '',
            label: 'Kopyala'
        },
        {
            action: 'changeStatus',
            parameters: '',
            label: 'Durdur'
        },
        {
            action: 'changeStatus',
            parameters: '',
            label: 'Yayından Kaldır'
        },
        {
            action: 'editEvent',
            parameters: '',
            label: 'Düzenle'
        },
        ];
    }
    private setNarrowColStatusFeedbackComponent(paramters): void {
        this.guestComponent.data = {
            iconName: 'do_not_disturb',
            title: 'bu etkinlik ertelenmiş',
            content: 'şu nedenlerle ertelenmiş',
            subTitle: 'erteleyen',
            subContent: 'osman orhan'
        }
        this.guestComponent.action = {
            name: 'lorem',
            label: 'ipsum'
        }
    }
    private setNarrowColEventCalendarComponent(parameters?: any) {
        this.guestComponent.title = '1. Hafta'
    }

    private setBasicButtonGroupComponent(parameters: any) {
        this.guestComponent.actions = [{
            name: 'button1',
            label: 'Alt Başlık',
            extraPropertyOne: 'lorem',
            extraPropertyTwo: false,
            extrapPropertThree: 123,
            isSelected: true,
            isDisabled: true
        }, {
            name: 'button2',
            label: 'Özet',
            extraPropertyOne: 'lorem',
            extraPropertyTwo: false,
            extrapPropertThree: 123,
            isSelected: true,
            isDisabled: false
        }, {
            name: 'button3',
            label: 'İçerik Metni',
            extraPropertyOne: 'lorem',
            extraPropertyTwo: false,
            extrapPropertThree: 123,
            isSelected: false,
            isDisabled: false
        }, {
            name: 'button4',
            label: 'Ipsum',
            extraPropertyOne: 'lorem',
            extraPropertyTwo: false,
            extrapPropertThree: 123,
            isSelected: false,
            isDisabled: false
        }, {
            name: 'button5',
            label: 'Sit',
            extraPropertyOne: 'lorem',
            extraPropertyTwo: false,
            extrapPropertThree: 123,
            isSelected: false,
            isDisabled: false
        }, {
            name: 'button6',
            label: 'Amet',
            extraPropertyOne: 'lorem',
            extraPropertyTwo: false,
            extrapPropertThree: 123,
            isSelected: false,
            isDisabled: false
        }, {
            name: 'button7',
            label: 'Lorem',
            extraPropertyOne: 'lorem',
            extraPropertyTwo: false,
            extrapPropertThree: 123,
            isSelected: false,
            isDisabled: true
        }]
        this.guestComponent.iconName = 'add'
    }

    private setNarrowColActionOfferComponent(parameters?: any) {
        this.guestComponent.theme = 'dark';
        this.guestComponent.data = [{label:'Deneme'}];

    }

    private setCardItemComponent(parameters?: any) {
        this.guestComponent.data = {
            entryType: 'event',
            model: {

            }
        }
    }
}
