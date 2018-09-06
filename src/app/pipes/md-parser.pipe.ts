import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import * as  Marked from 'marked';

@Pipe({
  name: 'mdParser'
})
export class MdParserPipe implements PipeTransform {
  md = Marked;

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  transform(value: any, args?: any): any {
    return value && value.length > 0 ? this.sanitizer.bypassSecurityTrustHtml(this.md.parse(value)) : "";
  }
}