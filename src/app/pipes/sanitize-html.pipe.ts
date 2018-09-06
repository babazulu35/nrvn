import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer){}  

  transform(value: any, args?: any): any {
    return value && value.length > 0 ? this.sanitizer.bypassSecurityTrustHtml(value) : ""; 
  }

}
