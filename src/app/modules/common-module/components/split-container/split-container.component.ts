import { Component, OnInit, ViewChild, ElementRef, HostBinding, Input, Renderer, HostListener } from '@angular/core';

declare var $:any;

@Component({
  selector: 'app-split-container',
  templateUrl: './split-container.component.html',
  styleUrls: ['./split-container.component.scss']
})
export class SplitContainerComponent implements OnInit {
  @ViewChild('fluid') fluid:ElementRef;
  @ViewChild('fixed') fixed:ElementRef;

  @HostBinding('class.c-split-container') true;

  @HostListener('window:resize')
  resizeHandler() {
    this.resize();
  }

  @HostBinding('class.main-loader')
  @Input() isLoading: boolean;

  @Input() fixedFloat: string;
  @Input() hasBorder: boolean = true;
  @Input() fixedWidth: number = 400;
  @Input() offsetHeight: number = -7;

  constructor(
    private renderer: Renderer, 
    private element: ElementRef
  ) { }

  ngOnInit() {
    this.resize();
    this.triggerResize(5000);
  }

  ngAfterViewInit() {
    this.resize();
    this.triggerResize();
  }

  ngAfterContentInit(){
    this.resize();
    this.triggerResize();
  }

  resize() {
    if(!this.element || !this.fixed || !this.fluid) return;
    this.renderer.setElementStyle(this.fluid.nativeElement, 'height', (window.innerHeight + this.offsetHeight - this.element.nativeElement.offsetTop).toString()+"px");
    this.renderer.setElementStyle(this.fixed.nativeElement, 'height', (window.innerHeight + this.offsetHeight  - this.element.nativeElement.offsetTop).toString()+"px");
  }

  triggerResize(timeout:number = 500) {
    setTimeout(function() {
      $(window).trigger('resize');
      window.dispatchEvent(new Event('resize'));  
    }, timeout);
  }

}
