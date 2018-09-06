import { AppSettingsService } from './../services/app-settings.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localization'
})
export class LocalizationPipe implements PipeTransform {

  constructor(private appSettingsService: AppSettingsService){}  

  transform(value: any, args?: any): any {
    let defaultLocale = this.appSettingsService.getLocalSettings("defaultLocale");
    let result = value;
    if(value && typeof value[defaultLocale] === "string") result = value[defaultLocale];
    if(typeof result !== "string") result = "";
    return result;
  }

}
