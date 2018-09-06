
import { AfterContentInit, AfterViewInit, Directive, Inject, OnInit, ViewContainerRef, Renderer, Input, ElementRef,DoCheck } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Directive({
  selector: '[sticky]'
})
export class StickyDirective implements OnInit,AfterContentInit,AfterViewInit,DoCheck {

  private defaults = {
    top : '0',
    release: null,
    display: '',
    width: 'inherit',
    zindex: '1024',
    sticky: 'isSticky',
    pinned: false,
    start: 0,
    selectorName: 'o-main-container',
    followMenu: false,
    menuMoveListener: 'c-main-menu__toggle-btn'
  }

  private pageTopOffset:string = this.defaults.top;
  private pageReleaseOffset:number = this.defaults.release;
  private pageLeftOffset:string;
  private pageAutoOffset:boolean;
  private stickyStartPosition:number= this.defaults.start;

  private displayProperties:string = this.defaults.display;
  private widthProperties:string = this.defaults.width;
  private zindexProperties:string = this.defaults.zindex;
  private heightProperties:number;

  private isPinned:boolean = this.defaults.pinned;

  private querySelectorName:Element;
  private stickyElement:any;
  private stickyClass:string = this.defaults.sticky;
  private pinnedClassName:string;
  private followMenuMove:boolean = this.defaults.followMenu;

  private scrollListener:Observable<any>;
  private reSetStartPoint:number;
  private elOptions:Object;
  private pinnedElementsData:any;
  private pinnedElement:Element;
  private followMenuMoveValue:string;

  private selectorClassName;

  @Input('sticky-main-scroller') set querySelector(selectorName:string){
    if(selectorName == '' || 'undefined' || 'main'){
      const classSelector = document.getElementsByClassName(this.defaults.selectorName);
      this.querySelectorName = document.documentElement.querySelector(`.${classSelector[0]['className']}`);
      this.selectorClassName = this.defaults.selectorName;
    }
    else
    {
      const classSelector = document.getElementsByClassName(selectorName)
      this.querySelectorName = document.documentElement.querySelector(`.${classSelector[0]['className']}`);
      this.selectorClassName = selectorName;
    }
  }
  @Input('sticky-is-pinned-to') set stickyIsPinned(stickyIsPinned:string) {
      this.pinnedClassName = stickyIsPinned;
      this.isPinned = true;
  }
  @Input('sticky-release-offset') set releaseOffset(pageReleaseOffset:number){
      this.pageReleaseOffset = pageReleaseOffset;
  }
  @Input('sticky-offset-top') set topOffset(pageTopOffset:string) {
    this.pageTopOffset = pageTopOffset;
  }
  @Input('sticky-class') set stickyClassName(stickyClassName:string) {
    this.stickyClass = stickyClassName;
  }
  @Input('sticky-width-property') set stickyWidthProperty(stickyWidthProperty:string){
    this.widthProperties = stickyWidthProperty;
  }
  @Input('sticky-zindex-property') set zindexProperty(zindexProperty:string){
    this.zindexProperties = zindexProperty;
  }

  @Input('sticky-display-property') set displayProperty(displayProperty:string){
    this.displayProperties = displayProperty;
  }

  @Input('sticky-start-point') set stickyStartPoint(stickyStartPoint:number){
    this.stickyStartPosition = stickyStartPoint;
  }
  @Input('sticky-follow-menu-moves') set followMenuMoves(followMenuMoves:string) {
      this.followMenuMove = true
  }

  constructor(
    @Inject(ViewContainerRef) private viewContainer: ViewContainerRef,
    @Inject(Renderer) private renderer: Renderer
     ){}

  ngOnInit(){

  }
  ngDoCheck() {

  }

  ngAfterViewInit(){

    // Check If The Element is Pinned To Another's Tail
    if(this.isPinned) {
        this.classCheckIfisExist(this.pinnedClassName,this.stickyClass);
    }

    // Set Sticky Element Options
    this.stickyElement = this.viewContainer.element.nativeElement;


    // Just For Use If The Element is None Displayed on Elements Settings
    if(this.stickyElement.offsetHeight == 0) {
       this.heightProperties = 55;
    }
    else {
      this.heightProperties = this.stickyElement.offsetHeight;
    }

    // Set Element Options
    let elementObj = {
        stickyClass:  this.stickyClass,
        elementOffset: this.stickyElement.offsetTop,
        elementHeight: this.heightProperties,
        elementPosition: 'fixed',
        topOffset: this.pageTopOffset,
        releaseOffset: this.pageReleaseOffset,
        display: this.displayProperties,
        width: this.widthProperties,
        zindex: this.zindexProperties,
        startToStick: this.stickyStartPosition,
      }

    // Set Scroll Listener
    this.scrollListener = Observable.fromEvent(this.querySelectorName,'scroll').map(e => {
      return e;
    });

    // Subscribe Event Result
    this.scrollListener.subscribe(result => {
      // Set Scroller Options
      let parentScrollObj = {
        scrollTop : result['srcElement']['scrollTop'],
        scrollHeight: result['srcElement']['scrollHeight'],
        clientHeight: result['srcElement']['clientHeight']
      }
  	/*
      console.log("Parent Scroll Height Is",parentScrollObj.scrollHeight);
      console.log("Client Height Is",parentScrollObj.clientHeight);
      console.log("Element Offset Is",elementObj.elementOffset);
      console.log("Scroll Position",parentScrollObj.scrollTop);
      console.log("Element Height",elementObj.elementHeight);
      console.log(result);
	*/
      // Fix for Shake scrolling effect
      const maxScrollHeight = parentScrollObj.scrollHeight - parentScrollObj.clientHeight;
      const getElementFullHeight = elementObj.elementOffset + elementObj.elementHeight;
      let getScrollDifference =  getElementFullHeight - maxScrollHeight;
      if (elementObj.elementOffset < getScrollDifference) {
        this.reSetStartPoint = getScrollDifference - elementObj.elementOffset ;
       }

       else {
          this.reSetStartPoint = elementObj.elementOffset - getScrollDifference;
       }

      // Start Sticky Logic
    if(((Math.max(0,elementObj.elementOffset - elementObj.startToStick )) < parentScrollObj.scrollTop)){
         this.setOptions(this.stickyElement,elementObj);

         // Main Menu Follow is Setted
         if(this.followMenuMove)
         {
            let selectorsOffsetLeftValue = document.getElementsByClassName(this.selectorClassName);
            this.setSingleField(this.viewContainer.element.nativeElement,'width',`calc(100% - ${selectorsOffsetLeftValue[0]['offsetLeft']}px)`);

            let menuListenerElement = document.documentElement.querySelector(`.${this.defaults.menuMoveListener}`);
            let menuMoveListener = Observable.fromEvent(menuListenerElement,'click').map(e => {
              return e;
            })
            menuMoveListener.subscribe(() => {
              let selectorsOffsetLeftValue = document.getElementsByClassName(this.selectorClassName);
              let reSetOffSets = 0;

              if(this.stickyElement.classList.contains(this.stickyClass))
              {
                if(selectorsOffsetLeftValue[0]['offsetLeft'] == 205) {
                  reSetOffSets = 90;
                }
                else if(selectorsOffsetLeftValue[0]['offsetLeft'] == 90) {
                  reSetOffSets = 205;
                }
                this.setSingleField(this.viewContainer.element.nativeElement,'width',`calc(100% - ${reSetOffSets}px)`);
              }
              else
              {
                this.setSingleField(this.viewContainer.element.nativeElement,'width','');
              }

          })
         }

       }
       else {
         if((Math.max(0,(elementObj.elementOffset - elementObj.elementHeight) + elementObj.releaseOffset ) > parentScrollObj.scrollTop) || (parentScrollObj.scrollTop == 0 )) {
           this.resetOptions(this.stickyElement,elementObj);
         }
       }
    })
  }

  ngAfterContentInit(){
  }

  private classCheckIfisExist(element:any,className:string) {
     const pinSelector = document.getElementsByClassName(element)
    this.pinnedElement =document.documentElement.querySelector(`.${pinSelector[0]['className']}`);

    // Is Sticky Attr Setted ?
     if(this.pinnedElement.attributes.getNamedItem('sticky') != null)
     {

        this.pinnedElementsData = this.pinnedElement.clientHeight;
     }
     else
     {
       console.log('Sticky Directive is not Active');
       this.pinnedElementsData = '';
     }


  }


  private setOptions(element:any,params:any) :void{
    this.renderer.setElementClass(element,params['stickyClass'],true);
    this.renderer.setElementStyle(element,'top',params['topOffset'] + 'px');
    this.renderer.setElementStyle(element,'display',params['display']);
    this.renderer.setElementStyle(element,'width',params['width']);
    this.renderer.setElementStyle(element,'z-index',params['zindex']);
    this.renderer.setElementStyle(element,'margin','0');
  }

  private resetOptions(element:any,params:any) {
    this.renderer.setElementClass(element,params['stickyClass'],false);
    this.renderer.setElementStyle(element,'top','');
    this.renderer.setElementStyle(element,'display','');
    this.renderer.setElementStyle(element,'width','');
    this.renderer.setElementStyle(element,'z-index','');
    this.renderer.setElementStyle(element,'margin','');

  }
  private setSingleField(element:any,cssName,cssVal) {
    this.renderer.setElementStyle(element,cssName,cssVal);
  }



}
