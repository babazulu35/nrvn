import { Directive, Input, Renderer, ElementRef, HostBinding, ChangeDetectorRef } from '@angular/core';

@Directive({
  selector: 'li'
})
export class ListItemDirective {
  
  @Input() set listItemClass(value: string) {
    this.renderer.setElementClass(this.element.nativeElement, value, true);
  }

  @Input() set width(value: string) {
    // this.renderer.setElementStyle(this.element.nativeElement, 'flex', '0 0 '+value);
    // this.renderer.setElementStyle(this.element.nativeElement, 'max-width', value);
    this.renderer.setElementStyle(this.element.nativeElement, 'max-width', value);
  }

  @Input() set margin(value: string) {
    this.renderer.setElementStyle(this.element.nativeElement, 'margin', value);
  }
  
  constructor(private renderer: Renderer, private element: ElementRef, private changeDetector: ChangeDetectorRef) { }

  ngOnChanges(changes) {
    this.changeDetector.detectChanges();
  }

}
