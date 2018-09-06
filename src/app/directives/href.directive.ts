import { Directive, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[href]'
})
export class HrefDirective {
  @Input() href;
  @HostListener('click', ['$event']) onClick(event) {this.preventDefault(event);}

  private preventDefault(event) {
      if (this.href.length === 0 || this.href === '#') {
          event.preventDefault();
      }
  }
  constructor() { }

}
