import {
  Component,
  ViewChild,
  ViewContainerRef,
  HostBinding,
  HostListener,
  ElementRef,
  NgZone
} from '@angular/core';

import { TetherOptions } from './tether-options';

declare var Tether: any;

@Component({
  selector: 'app-tether-dialog__content',
  template: `
      <ng-template #contentContainer></ng-template>
  `
})
export class TetherDialogContentComponent {
  @ViewChild('contentContainer', {read: ViewContainerRef})
  public contentContainer: ViewContainerRef;

  @HostBinding('class')
  get class() {
    return "c-tether-dialog__content " + this.customClass;
  };

  @HostBinding('style.width')
  styleWidth;

  @HostBinding('style.height')
  styleHeight;

  @HostBinding('style.min-height')
  styleMinHeight;

  @HostBinding('style.max-width')
  styleMaxWidth;

  @HostBinding('style.max-height')
  styleMaxHeight;

  @HostBinding('style.background-color')
  styleBackgroundColor;

  customClass:string = "";
  tetherOptions:TetherOptions;
  dialogSettings:any;
  tether:any;
  
  tetherPromise:Promise<Object>;
  tetherResolve: (result?: any) => void;
  tetherReject: (reason?: any) => void;

  get promise() { return this.tetherPromise };
  get resolve() { return this.tetherResolve };
  get reject() { return this.tetherReject };
  get settings() { return this.tetherOptions.settings };
  get element():ElementRef { return this.elementRef };
  get contentTether():any { return this.tether };

  public clickCount:number = 0;

  constructor(
    private elementRef: ElementRef,
    private ngZone: NgZone
  ) {  }

  public setDialogSettings(tetherOptions: TetherOptions){
    let styles= [];
    this.tetherOptions = tetherOptions;
    this.dialogSettings = tetherOptions.settings.dialog;
    if(this.dialogSettings){
      if(this.dialogSettings.style) {
        if(this.dialogSettings.style.width) this.styleWidth = this.dialogSettings.style.width;
        if(this.dialogSettings.style.height) this.styleHeight = this.dialogSettings.style.height;
        if(this.dialogSettings.style.minHeight) this.styleMinHeight = this.dialogSettings.style.minHeight;
        if(this.dialogSettings.style.maxWidth) this.styleMaxWidth = this.dialogSettings.style.maxWidth;
        if(this.dialogSettings.style.maxHeight) this.styleMaxHeight = this.dialogSettings.style.maxHeight;
        if(this.dialogSettings.style.backgroundColor) this.styleBackgroundColor = this.dialogSettings.style.backgroundColor;
      };
      if(this.dialogSettings.class){
        this.customClass = this.dialogSettings.class;
      };
    };

    switch(this.tetherOptions.type) {
      case "context":
        this.styleMinHeight = "auto";   
      break;
    }
    
    tetherOptions.settings.element = this.elementRef.nativeElement;
    let self = this;
    this.ngZone.runOutsideAngular(function(){
      self.tether = new Tether(tetherOptions.settings);
    })
    this.tetherPromise = new Promise((resolve, reject) => {
      this.tetherResolve = resolve;
      this.tetherReject = reject;
    });
    this.position();
  };
  
  public position() {
    let self = this;
    this.ngZone.runOutsideAngular(function(){
      self.tether.position();
    });
  }

  public ngAfterViewInit(){
      this.position();
  }
  
  public ngOnDestroy(){
    if (this.contentContainer) {
        this.contentContainer.clear()
        this.contentContainer = null;
    };

    if(this.tether) this.tether.destroy();

    this.clickCount = 0;
  };
}