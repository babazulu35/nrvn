import { CmsField } from './models/cms-field';
import { Roles } from './models/roles';
import { countries } from './dicts/countries';

export const localSettings = {
	reservationDelayTimes:[
		{time:3, label:"3 Saat Ötele" },
		{time:8, label:"8 Saat Ötele" },
		{time:24, label:"1 Gün Ötele" },
		{time:24*5, label:"5 Gün Ötele" },
	],
	defaultLocale:'tr-TR',
	defaultCustomer: {
		Name: "Mobilet",
		Surname: "Box Office",
		Email: "merkez@mobilet.com",
		TCNumber: "11111111111"
	},
	customerCsvFields: ["Name", "Surname", "PhoneNumber", "Email"],
	locales:[
		{id:"tr-TR", code:"tr"},
		{id:"en-US", code:"en"}
	],
	useLocalCountryDict: true,
	countries: null, //set by country-service
	assetsCDNSource: "https://pozmedia.doracdn.com/static/",
	terminalEndDateWarningInDays: 15,
	vatList: [
		{text: '%0', value: 0},
		{text: '%1', value: 0.01},
		{text: '%8', value: 0.08},
		{text: '%18', value: 0.18}
	],
	entityTypes:[
		{name:'Event', label:'Etkinlik', endpoint:"EEvent"},
		{name:'Venue', label:'Mekan', endpoint:"VVenue"},
		{name:'Performer', label:'Sanatçı', endpoint:"EPerformer"},
		{name:'Performance', label:'Performans', endpoint:"EPerformance"},
		{name:'Firm', label:'Firma', endpoint:"FFirm"},
		{name:'Contents', label:'İçerik', endpoint:null }
	],
	cmsFields:[
		<CmsField>{FieldType:"Text", Label:"Metin", Icon:"title", Settings:[
			{
				Label:"Tip", Key:"type", ComponentType:"selectbox", ComponentOptions:{
					options: [
						{text:"Metin", value:"text"},
						{text:"Sayı", value:"number"},
						{text:"Alfa Karakterler", value:"alpha"},
						{text:"Metin", value:"text"},
						{text:"Fiyat", value:"price"},
						{text:"Eposta", value:"email"},
						{text:"Web Adresi", value:"url"},
						{text:"Telefon", value:"tel"},
						{text:"Koordinat", value:"latlon"},
					]
				}
			},
			{
				Label:"Placeholder Metni", Key:"placeholder", ComponentType:"text-input",
			},
			{
				Label:"Maksimum Karakter", Key:"maxlength", ComponentType:"text-input", ComponentOptions:{
					type:"number"
				}
			},
			{
				Label:"Çoklu Dil Girişi Yapılabilir", Key:"allowMultiLang", ComponentType:"checkbox"
			}
		]},
		// <CmsField>{FieldType:"TextField", Label:"Metin", Icon:"title", Settings:[
		// 	{
		// 		Label:"Tip", Key:"type", ComponentType:"selectbox", ComponentOptions:{
		// 			options: [
		// 				{text:"Metin", value:"text"},
		// 				{text:"Sayı", value:"numeric"},
		// 				{text:"Alfa Karakterler", value:"alpha"},
		// 				{text:"Metin", value:"text"},
		// 				{text:"Fiyat", value:"price"},
		// 				{text:"Eposta", value:"email"},
		// 				{text:"Web Adresi", value:"url"},
		// 				{text:"Telefon", value:"tel"},
		// 				{text:"Koordinat", value:"latlon"},
		// 			]
		// 		}
		// 	},
		// 	{
		// 		Label:"Placeholder Metni", Key:"placeholder", ComponentType:"text-input"
		// 	},
		// 	{
		// 		Label:"Maksimum Karakter", Key:"maxlength", ComponentType:"text-input", ComponentOptions:{
		// 			type:"number"
		// 		}
		// 	},
		// 	{
		// 		Label:"Çoklu Dil Girişi Yapılabilir", Key:"allowMultiLang", ComponentType:"checkbox"
		// 	}
		// ]},
		<CmsField>{FieldType:"FormattedText", Label:"Uzun Metin", Icon:"text_fields", Settings:[
			{
				Label:"Placeholder Metni", Key:"placeholder", ComponentType:"text-input"
			},
			{
				Label:"Maksimum Karakter", Key:"maxlength", ComponentType:"text-input", ComponentOptions:{
					type:"number"
				}
			},
			{
				Label:"Çoklu Dil Girişi Yapılabilir", Key:"allowMultiLang", ComponentType:"checkbox"
			}
		]},
		// <CmsField>{FieldType:"TextArea", Label:"Uzun Metin", Icon:"text_fields", Settings:[
		// 	{
		// 		Label:"Placeholder Metni", Key:"placeholder", ComponentType:"text-input"
		// 	},
		// 	{
		// 		Label:"Maksimum Karakter", Key:"maxlength", ComponentType:"text-input", ComponentOptions:{
		// 			type:"number"
		// 		}
		// 	},
		// 	{
		// 		Label:"Çoklu Dil Girişi Yapılabilir", Key:"allowMultiLang", ComponentType:"checkbox"
		// 	}
		// ]},
		<CmsField>{FieldType:"Number", Label:"Sayı", Icon:"looks_one", Settings:[
			{
				Label:"Placeholder Metni", Key:"placeholder", ComponentType:"text-input"
			},
			{
				Label:"Minimum Değer", Key:"min", ComponentType:"text-input", ComponentOptions:{
					type:"number"
				},
			},
			{
				Label:"Maksimum Değer", Key:"max", ComponentType:"text-input", ComponentOptions:{
					type:"number"
				},
			},
		]},
		<CmsField>{FieldType:"DateTime", Label:"Tarih / Saat", Icon:"today", Settings:[
			{
				Label:"Placeholder Metni", Key:"placeholder", ComponentType:"text-input"
			},
			{
				Label:"Minimum Tarih", Key:"minDate", ComponentType:"text-input", ComponentOptions:{
					type:"datepicker"
				}
			},
			{
				Label:"Maksimum Tarih", Key:"maxDate", ComponentType:"text-input", ComponentOptions:{
					type:"datepicker"
				}
			}
		]},
		<CmsField>{FieldType:"Time", Label:"Saat", Icon:"timer", Settings:[
			
		]},
		<CmsField>{FieldType:"Image", Label:"Resim", Icon:"insert_photo", Settings:[
			{
				Label:"Çoklu Dil Girişi Yapılabilir", Key:"allowMultiLang", ComponentType:"checkbox"
			}
		]},
		<CmsField>{FieldType:"Checkbox", Label:"Onay Kutusu", Icon:"check_box", Settings:[
			
		]},
		<CmsField>{FieldType:"Selectbox", Label:"Seçim Kutusu", Icon:"arrow_drop_down_circle", Settings:[
			{
				Label:"Placeholder Metni", Key:"placeholder", ComponentType:"text-input"
			},
			{
				Label:"Liste seçenekleri", Key:"options", ComponentType:"selectbox", ComponentOptions: {
					options: "lovs" // "lovs" is a key for auto complete List Of Values
				}
			}
		]},

	],
	paymentEndDateForRefundableItems: new Date(2017, 7, 8),
	bulkSMSMaxCSVRowCount: 500, // 0 is infinitive
	timeoutForSMSVerification: 180 // (sn)
};
