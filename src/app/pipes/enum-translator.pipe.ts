import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumTranslator'
})
export class EnumTranslatorPipe implements PipeTransform {
	private values: Object = {
		Cancel:				{ TR: 'Cancel',							EN: 'Cancel' },
		Cancelled:			{ TR: 'İptal Edildi',					EN: '' },
		CarPark: 			{ TR: 'Park',							EN: '' },
		Closed: 			{ TR: 'Kapalı',							EN: '' },
		Comp: 				{ TR: 'Complimentary',					EN: 'Complimentary' },
		ConfigurationReady: { TR: 'Konfigürasyona Hazır',			EN: '' },
		Draft:				{ TR: 'Taslak',							EN: '' },
		Event:				{ TR: 'Etkinlik',						EN: '' },
		EventSponsor:		{ TR: 'Etkinlik Sponsoru',				EN: '' },
		Expired:			{ TR: 'Süresi Doldu',					EN: '' },
		Fbvr:				{ TR: 'Yemek ve İçecek',				EN: '' },
		Group:				{ TR: 'Group',							EN: 'Group' },
		Individual:			{ TR: 'Bireysel',						EN: '' },
		Invitation:			{ TR: 'Davetiye',						EN: 'Invitation' },
		MainSponsor:		{ TR: 'Ana Sponsor',					EN: '' },
		MediaSponsor:		{ TR: 'Media Sponsoru',					EN: '' },
		Membership:			{ TR: 'Üyelik',							EN: '' },
		Merchant:			{ TR: 'Satıcı',							EN: '' },
		NotSet:				{ TR: 'Seçilmemiş',						EN: 'Not Set' },
		OnSale:				{ TR: 'Satışta',						EN: '' },
		Open:				{ TR: 'Açık',							EN: '' },
		OtherSponsor:		{ TR: 'Diğer Sponsor',					EN: '' },
		Published:			{ TR: 'Yayınlandı',						EN: '' },
		Refund: 			{ TR: 'İade',							EN: 'İade' },
		Refound:			{ TR: 'Cancel',							EN: 'Cancel' },
		ReserveForComp:		{ TR: 'Reservation for Complimentary',	EN: 'Reservation for Complimentary' },
		ReserveForSale:		{ TR: 'Reservation for Sale',			EN: 'Reservation for Sale' },
		Sale:				{ TR: 'Sale',							EN: 'Sale' },
		Sales:				{ TR: 'Satış',							EN: 'Sales' },
		Seasonal:			{ TR: 'Seasonal',						EN: 'Seasonal' },
		Selected:			{ TR: 'İşleniyor',						EN: '' },
		SoldOut:			{ TR: 'Tükendi',						EN: '' },
		Sponsor:			{ TR: 'Sponsor',						EN: '' },
		SubSponsor:			{ TR: 'Yan Sponsor',					EN: '' },
		Suspended:			{ TR: 'Beklemede',						EN: '' },
		TargetGroup:		{ TR: 'Hedef Kitle',					EN: '' },
		Unknown:			{ TR: '-',								EN: '-' },
		Void:				{ TR: 'Void',							EN: 'Void' }
	}
  	transform(value: any, args?: any): any {
  		let locale = 'TR';
    	return (this.values.hasOwnProperty(value)) ? this.values[value][locale] : 'Enum Translation Not Found!';
  	}

}
