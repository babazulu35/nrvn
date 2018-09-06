import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linky'
})
export class LinkyPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value) return value;
    let urlStr = value.toLocaleLowerCase();
    urlStr = urlStr.replace('http://', '');
    urlStr = urlStr.replace('https://', '');
    if (urlStr && urlStr.length > 0) {
      if (args && typeof args === 'number') {
        if (urlStr.length > args) {
          urlStr = urlStr.slice(0, args - 3);
          urlStr += '...';
        }
      } else {
        if (urlStr.charAt(urlStr.length - 1) === '/') {
          urlStr = urlStr.slice(0, urlStr.length - 1);
        }
      }
    }
    return urlStr;
  }

}
