import { localSettings } from './../settings';

export class BaseModel {

	constructor(object : Object = {}){
    	for (let key in object) {
			if(typeof object[key] !== "function") {
				this[key] = object[key];
			}
		}
    }
    //Localization objesini veya varsayılan dile ait değeri kaydeder
    set(key, value, hasLocalization?:boolean, isCrud?: boolean){
		if(hasLocalization) {
			if(value && value.localization !== undefined) value = value.localization;
			if(!this["Localization"]) this["Localization"] = {};
			let locales = localSettings.locales;
			let defaultLocale = localSettings.defaultLocale;
			if(isCrud) {
				let code: string;
				locales.forEach( locale => {
					code = locale.code.charAt(0).toUpperCase() + locale.code.slice(1);
					if(!this["Localization"][code]) this["Localization"][code] = {};
					if(typeof value === "string") {
						if(locale.id == defaultLocale) this["Localization"][code][key] = value;
					}else{
						if(value && value[locale.id]){
							this["Localization"][code][key] = value[locale.id];
						}else{
							this["Localization"][code][key] = null;
						}
					}
				});
			}else{
				this["Localization"][key] = value;
			}
		}else{
			this[key] = value;
		}
	}
	//Localization objesini veya varsayılan dile ait değeri döndürür
	get(key: string, hasLocalization?: boolean) {
		if(hasLocalization) {
			let locales = localSettings.locales;
			let defaultLocale = localSettings.defaultLocale;
			let locale = locales.find( item => item.id == defaultLocale );
			let code = locale.code.charAt(0).toUpperCase() + locale.code.slice(1);
			if(this["Localization"]) {
				if(this["Localization"][code]) {
					return this["Localization"][code][key];
				}else {
					if(this["Localization"][key]) {
						if(typeof this["Localization"][key] === "string") {
							return this["Localization"][key];
						}else{
							return this["Localization"][key][defaultLocale];
						}
					}else{
						return null;
					}
				}
			}else{
				return null;
			}
		}else{
			return this[key];
		}
	}
	//Crud localization objesini odata ve uygulamaya uygun localization objesine dönüştürüyor.
	setLocalization(rawLocalization) {
		let locales = localSettings.locales;
		let code: string;
		let localeObject: {};
		let Localization = {};
		locales.forEach( locale => {
			code = locale.code.charAt(0).toUpperCase() + locale.code.slice(1);
			localeObject = rawLocalization[code];
			Object.keys(localeObject).forEach(key => {
				if(localeObject[key] !== null) {
					if(!Localization[key]) Localization[key] = {};
					Localization[key][locale.id] = localeObject[key];
				}
			});
		});
		this["Localization"] = Localization;
	}
	//odata ve uygulamanın localization objesi crud localizationa kaydeder.
	saveRawLocalization() {
		if(this["Localization"]) {
			let Localization = this["Localization"];
			delete this["Localization"];
			Object.keys(Localization).forEach( key => {
				if(Localization[key]) {
					this.set(key, Localization[key], true, true);
				}
			});
		}
	}
	//normalize crud localization datasını döndürür
	getRawLocalization(forceToCopyDefaultToLocales?:boolean) {
		let locales = localSettings.locales;
		let defaultLocale = localSettings.defaultLocale;
		let code: string;

		let Localization = Object.assign({}, this["Localization"]);
		let rawLocalization = {};
		let value;	
		let defaultValue;	

		Object.keys(Localization).forEach( key => {
			value = Localization[key];					
			locales.forEach( locale => {
				if(value && forceToCopyDefaultToLocales) defaultValue = typeof value === "string" ? value : value[defaultLocale];
				code = locale.code.charAt(0).toUpperCase() + locale.code.slice(1);
				if(!rawLocalization[code]) rawLocalization[code] = {};
				if(typeof value === "string") {
					if(locale.id == defaultLocale && value !== null) rawLocalization[code][key] = value;
				}else{
					//if(value && value[locale.id] !== null) rawLocalization[code][key] = value[locale.id];
					rawLocalization[code][key] = value ? value[locale.id] : null;
				}
				if((!rawLocalization[code][key] || rawLocalization[code][key] == "") && forceToCopyDefaultToLocales) rawLocalization[code][key] = defaultValue;
			});
		});
		return rawLocalization;
	}
	//Kaydet ve update için gerekli olan normalize crud datasını döndürür
	getRawData(): any {
		let rawData = Object.assign({}, this);
		Object.keys(rawData).forEach( key => {
			if(typeof rawData[key] === "function") {
				delete rawData[key];
			}
		});
		rawData["Localization"] = this.getRawLocalization();
		return rawData;
	}
	//Field bazında localization olduğu veya olmadığı durumlarda validasyon yapar
	isValid(key:string, hasLocalization?: boolean, options?: any):boolean {
		let valid: boolean;
		if(hasLocalization) {
			let defaultLocale = localSettings.defaultLocale;
			if(this["Localization"] && this["Localization"][key]) {
				valid = this["Localization"][key][defaultLocale] ? this["Localization"][key][defaultLocale].length > 0 : this["Localization"][key].length > 0;
			}
		}else{
			valid = this[key] && this[key].toString().length > 0;
		}
		return valid;
	}
}
