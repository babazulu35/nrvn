import { Component, OnInit, HostBinding, HostListener, Input, QueryList, ElementRef, ViewChild, ContentChildren, ViewChildren, Renderer, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import { ListItemDirective } from '../../../../directives/list-item.directive';

declare var $:any;

@Component({
  selector: 'app-grid-list',
  templateUrl: './grid-list.component.html',
  styleUrls: ['./grid-list.component.scss']
})
export class GridListComponent implements OnInit {
  @ViewChild('container') container:ElementRef;
  @ContentChildren(ListItemDirective) items: QueryList<ListItemDirective>;
  @ViewChildren(ListItemDirective) emptyItems: QueryList<ListItemDirective>;

  @HostBinding('class.c-grid-list') true;

  @HostBinding('class.c-grid-list--promising')
  @Input() isLoading: boolean = false;

  @HostBinding('style.width')
  get width(){
    return this.sanitizer.bypassSecurityTrustStyle("calc(100% + "+this.gutter*2+"px)");
  }

  @HostBinding('style.margin')
  get margin(){
    return this.sanitizer.bypassSecurityTrustStyle("-"+this.gutter+"px");
  }


  @HostListener('window:resize') resizeHandler() {
    this.resize();
  }


  @Input() itemWidth: number = 205;
  @Input() gutter: number = 15;

  directives:ListItemDirective;

  containerWidth: number;
  emptyItemList: Array<any> = [];

  constructor(
    private element: ElementRef, 
    private renderer: Renderer, 
    private sanitizer: DomSanitizer,
    private changeDetector: ChangeDetectorRef) { }

  ngOnInit() { }

  ngAfterContentInit() {
    if(this.items) this.items.forEach( item => this.setItem(item));
    if(this.emptyItems) this.emptyItems.forEach( item => this.setItem(item));

    if(this.items) this.items.changes.subscribe( result => {
      result.forEach(item => this.setItem(item));
    });
    if(this.emptyItems) this.emptyItems.changes.subscribe( result => {
      result.forEach(item => this.setItem(item));
    });
    this.resize();
  }

  ngAfterViewInit() {
    this.resize();
  }

  setItem(item:ListItemDirective) {
    item.listItemClass = "c-grid-list__item";
    item.width = this.itemWidth+"px";
    item.margin = this.gutter+"px " +this.gutter+"px " + this.gutter + "px " + this.gutter + "px";
    this.resize();
  }

  render() {
    let self = this;
    self.resize();
    setTimeout(function() {
      self.resize();
    }, 300);
  }

  resize(){
    if(!this.items) return;
    this.renderer.setElementStyle(this.container.nativeElement, 'width', "auto");
    //this.renderer.setElementStyle(this.element.nativeElement, `position`, 'absolute');
    this.containerWidth = this.element.nativeElement.offsetWidth;
    this.renderer.setElementStyle(this.element.nativeElement, `position`, 'relative');
    let columnCount = Math.floor(this.containerWidth / (this.itemWidth + this.gutter*2));

    if(this.items.length > columnCount ) {
      this.renderer.setElementStyle(this.container.nativeElement, 'width', (columnCount * (this.itemWidth+this.gutter*2)) + "px");
    }else{
      this.renderer.setElementStyle(this.container.nativeElement, 'width', "auto");
    }
    
    //let mod = this.items.length % columnCount;
    //this.emptyItemList = mod ? new Array(columnCount - (this.items.length % columnCount)) : [];
    // this.changeDetector.detectChanges();
    // this.items.forEach( item => this.setItem(item));
    // this.emptyItems.forEach( item => this.setItem(item));
  }

}
