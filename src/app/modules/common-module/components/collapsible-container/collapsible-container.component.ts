import { VenueTemplateEditorComponent } from './../venue-template-editor/venue-template-editor.component';
import { DomSanitizer } from '@angular/platform-browser';
import { GridListComponent } from './../grid-list/grid-list.component';
import { Component, OnInit, HostBinding, HostListener, Input, Renderer, ElementRef, ContentChildren, ContentChild, ViewChild } from '@angular/core';

declare var $:any;

@Component({
  selector: 'app-collapsible-container',
  templateUrl: './collapsible-container.component.html',
  styleUrls: ['./collapsible-container.component.scss'],
})

export class CollapsibleContainerComponent implements OnInit {
  @ViewChild('content') content:ElementRef;
  @ViewChild('aside') aside:ElementRef;

  @ContentChild(VenueTemplateEditorComponent) venueEditor: VenueTemplateEditorComponent;
  @ContentChildren(GridListComponent) grids: GridListComponent[]

  @HostListener('window:resize')
  resizeHandler() {
    this.resize();
  }

  @HostBinding('class.c-collapsible-container') true;

  @HostBinding('class.c-collapsible-container--gray')
  isGray: boolean;

  @HostBinding('class.c-collapsible-container--toggle-gray')
  isToggleGray: boolean;

  @HostBinding('class.main-loader')
  @Input() isLoading: boolean;
  @Input() showToggleIcon?:boolean = true;
  @Input() asideWidth: number = 260;
  @Input() asideHasNoPadding: boolean = false;
  @Input() contentHasNoPadding: boolean = false;
  @Input() hasOverlay: boolean;
  @Input() isAsideVisible: boolean = true;
  @Input() hasAsideFooter: boolean = false;
  @Input() offsetY: number = 0;

  @Input() set isAsideOpen(value: boolean) {
    this.asideOpened = value;
    if(this.asideOpened && this.isAsideVisible) {
      let asideWidth = (this.isAsideVisible ? this.asideWidth : 0)+"px";
      this.renderer.setElementStyle(this.aside.nativeElement, 'width', asideWidth);
      this.renderer.setElementStyle(this.content.nativeElement, 'width', this.sanitizer.bypassSecurityTrustStyle("calc(100% - "+asideWidth+")")["changingThisBreaksApplicationSecurity"]);
    }else{
      let asideWidth = this.isAsideVisible ? "20px" : "0px"
      this.renderer.setElementStyle(this.aside.nativeElement, 'width', asideWidth);
      this.renderer.setElementStyle(this.content.nativeElement, 'width', this.sanitizer.bypassSecurityTrustStyle("calc(100% - "+asideWidth+")")["changingThisBreaksApplicationSecurity"]);
      if(!this.isAsideVisible) this.renderer.setElementStyle(this.content.nativeElement, 'min-height', 'auto');
    }
    this.resize();
  }

  get isAsideOpen():boolean { return this.asideOpened };

  @Input() set theme(value:string) {
    this.isGray = value == "gray";
    this.isToggleGray = value == "toggle-gray";
  }

  asideOpened: boolean;

  constructor(
    private renderer: Renderer, 
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.isAsideOpen = this.isAsideOpen;
  }

  ngOnDestroy() {
    if(this.venueEditor) this.venueEditor.ngOnDestroy();
  }

  ngAfterViewInit(){
    this.triggerResize();
  }

  ngAfterContentInit(){
    this.triggerResize();
  }

  resize() {
    this.position();
  }

  position() {
    let height = (window.innerHeight - this.offsetY - this.elementRef.nativeElement.getBoundingClientRect().top).toString()+"px";
    this.renderer.setElementStyle(this.elementRef.nativeElement, 'min-height', height);
    this.renderer.setElementStyle(this.aside.nativeElement, 'min-height', this.content.nativeElement.offsetHeight + "px");
    if(this.venueEditor) this.venueEditor.resize();
  }

  toggleAside(){
    this.isAsideOpen = !this.asideOpened;
    this.triggerResize();
    if(this.grids) this.grids.forEach( grid => grid.render() )
  }

  triggerResize() {
    $(window).trigger('resize');
    window.dispatchEvent(new Event('resize'));
    setTimeout(function() {
      $(window).trigger('resize');
      window.dispatchEvent(new Event('resize'));  
    }, 1500);
  }

}
