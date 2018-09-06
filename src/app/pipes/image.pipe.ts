import { Pipe, PipeTransform } from '@angular/core';
import { AppSettingsService } from '../services/app-settings.service';

@Pipe({
  name: 'image'
})
export class ImagePipe implements PipeTransform {
	private appSettingsService : AppSettingsService;
	constructor(appSettingsService: AppSettingsService) {
		this.appSettingsService = appSettingsService;
	}

	transform(value: any, args?: any): any {
		if(value != 'null' && value != null && value != undefined && value.length > 0){
			if(value.slice(0,4) === 'http'){
				return value
			}else{
				/*
				let seperator = value.indexOf(',') > -1 ? ',' : ';';
				let images = value.split(seperator),
					path = (args) ? this.appSettingsService.findClientSetting('LinkHelper.'+args+'ImagePath') : '',
					basePath = this.appSettingsService.findClientSetting('LinkHelper.AppRootUrl'),
					image = (images.length > 0) ? images[0] : value;
				return basePath  +  path + '/' + image;
				*/
				let seperator = value.indexOf(',') > -1 ? ',' : ';',
					images = value.split(seperator),
					image = (images.length > 0) ? images[0] : value;
				return this.appSettingsService.getLocalSettings("assetsCDNSource") + image;
			}
		}
		return null;
	}

}
