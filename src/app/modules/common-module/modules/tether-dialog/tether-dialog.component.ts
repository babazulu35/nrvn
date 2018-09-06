import { ConfirmModalComponent } from './../../components/confirm-modal/confirm-modal.component';
import { ContextMenuComponent } from './../../components/context-menu/context-menu.component';
import { Router, NavigationStart } from '@angular/router';
import {
  Component,
  ComponentFactoryResolver,
  ComponentFactory,
  ComponentRef,
  Renderer,
  TemplateRef,
  EmbeddedViewRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  Injectable,
  Injector,
  ReflectiveInjector,
  HostBinding,
  HostListener,
  ElementRef,
  ViewChild,
  EventEmitter,
  Output,
  NgZone
} from '@angular/core';

import { isDefined, isString } from '../../../../util/is.util';

import { TetherOptions } from './tether-options';
import { TetherDialogContentComponent } from './tether-dialog-content.component';
import { TetherDialogOverlayComponent } from './tether-dialog-overlay.component';
import { TetherDialog } from './tether-dialog';

declare var Tether: any;
declare var $: any;

@Component({
  selector: 'app-tether-dialog',
  //templateUrl: './tether-dialog.component.html',
  template: `
    template: '<ng-template #overlayContainer></ng-template>'
    template: '<ng-template #contentContainer></ng-template>'
  `,
  entryComponents: [TetherDialogContentComponent, TetherDialogOverlayComponent, ConfirmModalComponent, ContextMenuComponent],
  styleUrls: ['./tether-dialog.component.scss']
})

export class TetherDialogComponent implements OnInit, OnDestroy {
  @HostBinding('class.c-tether-dialog') true;

  @HostBinding('style.pointer-events') 
  get pointerEvents():string { return this.activeDialog && this.activeDialog.settings && this.activeDialog.settings.outsideClickIsActive ? "auto" : "none"};

  @ViewChild('overlayContainer', {read: ViewContainerRef})
  overlayRefContainer: ViewContainerRef;

  @ViewChild('contentContainer', {read: ViewContainerRef})
  contentRefContainer: ViewContainerRef;

  @HostListener('click', ['$event'])
  clickHandler(event) {
    if(!this.activeDialog) return;
    if(this.dialogIsOpen && this.activeDialog.settings.outsideClickIsActive){
      this.tetherService.dismiss({target: "overlay"});
    }
    if(this.activeDialog) this.activeDialog.clickCount++;
  }

  @HostListener('window:keyup', ['$event'])
  keyUpHandler($event:KeyboardEvent) {
    if(!this.activeDialog) return;
    if(this.dialogIsOpen && this.activeDialog.settings['escapeKeyIsActive']){
      if($event.keyCode == 27){
        this.tetherService.dismiss();
      }
    }
  }

  @HostBinding('class.c-tether-dialog--is-menu-collapsed') public isMenuCollapsed: boolean;

  @Output() actionEvent:EventEmitter<{action: string, tetherOptions?:any}> = new EventEmitter();

  public get activeDialog():TetherDialogContentComponent { 
    return this.dialogs.length ? this.dialogs[this.dialogs.length-1].instance : null;
  }

  overlayRef: ComponentRef<TetherDialogOverlayComponent>;

  dialogs: ComponentRef<TetherDialogContentComponent>[] = new Array();
  tether: any;
  routerSubscription: any;

  clickCount:number = 0;

  dialogIsOpen: Boolean = true;
  @HostBinding('class.c-tether-dialog--on')
  get isOpen():Boolean {
    return this.dialogIsOpen;
  }
  
  bodyLocked: Boolean = false;
  get isBodyLocked():Boolean {
    return this.bodyLocked;
  }

  constructor(
    private renderer: Renderer,
    private resolver: ComponentFactoryResolver,
    public tetherService: TetherDialog,
    private injector: Injector,
    private router: Router,
    private ngZone: NgZone
  ) {
    tetherService.registerComponent(this);
  };

  ngOnInit() {
    
  }

  ngOnDestroy() {

  }

  ngAfterViewInit() {
    let self = this;
    setTimeout(function(){self.dialogIsOpen = false;},0);
  }
  openContext(contextOptions: any, tetherOptions: TetherOptions): TetherDialogComponent {
    	let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector);
		  let contextMenu:ContextMenuComponent = component.instance;
      
      contextMenu.title = contextOptions.title;
      contextMenu.data = contextOptions.data;
      contextMenu.iconSet = contextOptions.iconSet;

      return this.open(component, tetherOptions);
  }

  openConfirm(confirmOptions: {title: string, confirmButton?: {label: string, theme?: string, type?:string}, dismissButton?: {label: string, theme?: string, type?:string}, description?: string, image?: string, feedback?: {label: string}, timer?:number,showCloseButton?: boolean}, tetherOptions: TetherOptions): TetherDialogComponent {
    	let component: ComponentRef<ConfirmModalComponent> = this.resolver.resolveComponentFactory(ConfirmModalComponent).create(this.injector);
		  let confirmModal:ConfirmModalComponent = component.instance;
      
      confirmModal.title = confirmOptions.title;
      confirmModal.confirmButton = confirmOptions.confirmButton;
      confirmModal.dismissButton = confirmOptions.dismissButton;
      confirmModal.description = confirmOptions.description;
      confirmModal.feedback = confirmOptions.feedback;
      confirmModal.timer = confirmOptions.timer;
      confirmModal.image = confirmOptions.image;
      confirmModal.showCloseButton = confirmOptions.showCloseButton;

      return this.open(component, tetherOptions);
  }

  open(content: any, tetherOptions: TetherOptions):TetherDialogComponent {
    if(!this.dialogs.length) {
      this.dialogIsOpen = true;
      this.bodyLocked = tetherOptions.type != 'context';
      if(tetherOptions.settings.overlay){
        this.overlayRef = <ComponentRef<TetherDialogOverlayComponent>>this.overlayRefContainer.createComponent(this.resolver.resolveComponentFactory(TetherDialogOverlayComponent));
      }
    }

    this.addContent(content, tetherOptions);

    this.routerSubscription = this.router.events
    .filter(event => event instanceof NavigationStart)
      .subscribe((event:NavigationStart) => {
        this.tetherService.dismiss();
      });
    
    this.actionEvent.emit({action: "open", tetherOptions: tetherOptions})

    return this;
  }

  close() {    
    let component:ComponentRef<TetherDialogContentComponent> = this.dialogs.pop();
    if(component) component.destroy();
    
    if(!this.dialogs.length) {
      if(this.overlayRef) this.overlayRef.destroy();

      if(this.contentRefContainer) this.contentRefContainer.clear();
      if(this.overlayRefContainer) this.overlayRefContainer.clear();

      this.dialogIsOpen = false;
      this.bodyLocked = false;
    }
    if(this.routerSubscription) this.routerSubscription.unsubscribe();
    this.tetherService.action$ = null;
  }

  position(){
    this.dialogs.forEach(item => item.instance.position() );
  }

  addContent(content: any, tetherOptions: TetherOptions) {
    let contentFactory: ComponentFactory<TetherDialogContentComponent> = this.resolver.resolveComponentFactory(TetherDialogContentComponent);
    let component:ComponentRef<TetherDialogContentComponent> = contentFactory.create(this.injector);
    
    if(this.activeDialog && this.activeDialog.contentTether) {
      if(tetherOptions.settings.target == this.activeDialog.contentTether.target) return;
    }

    this.contentRefContainer.insert(component.hostView);
    component.instance.setDialogSettings(tetherOptions);
    
    if(!content) {
 
    }else if(content instanceof ElementRef) {
      console.log("element ref : ", content);
      component.instance.contentContainer.insert(content.nativeElement);
    }else if(content instanceof TemplateRef) {
      component.instance.contentContainer.createEmbeddedView(content);
    }else if(isString(content)) {
      this.renderer.createText(null, `${content}`);
    }else if(content instanceof ComponentFactory) {
      component.instance.contentContainer.createComponent(content);
    }else if(content instanceof ComponentRef) {
       component.instance.contentContainer.insert(content.hostView);
    }else{ // content = component
      //const contentFactory = this.resolver.resolveComponentFactory(content);
      //component.instance.contentContainer.createComponent(contentFactory, 0);
      //console.log("4. nedir : ", content);
    };
    this.dialogs.push(component);
    this.triggerResize();
  }

  private triggerResize() {
    this.ngZone.runOutsideAngular(function() {
      $(window).trigger('resize');
      // window.dispatchEvent(new Event('resize'));
      setTimeout(function() {
        $(window).trigger('resize');
        window.dispatchEvent(new Event('resize'));
      }, 200);
    });
  }

}
