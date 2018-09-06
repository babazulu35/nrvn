import { Router } from '@angular/router';
import { ModalSearchBoxComponent } from './../modal-search-box/modal-search-box.component';
import { Component, OnInit, HostBinding, HostListener, Input, Output, Renderer, ComponentFactoryResolver, ComponentRef, Injector, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { TypeaheadComponent } from '../typeahead/typeahead.component';
import { TetherDialog } from '../../modules/tether-dialog/tether-dialog';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-title-switcher',
  templateUrl: './title-switcher.component.html',
  styleUrls: ['./title-switcher.component.scss'],
  entryComponents: [ ModalSearchBoxComponent ]
})
export class TitleSwitcherComponent implements OnInit {
  @HostBinding('class.c-title-switcher') true;
  @HostBinding('class.c-title-switcher--dark') themeIsDark:boolean;
  @HostBinding('class.c-title-switcher--is-finder') 
  
  finder: ModalSearchBoxComponent;

  @Output() searchEvent: EventEmitter<any> = new EventEmitter();
  @Output() changeEvent: EventEmitter<any> = new EventEmitter();
  @Output() actionEvent: EventEmitter<{action:string}> = new EventEmitter();
  
  @Input() title:string;
  @Input() finderTitle: string;
  @Input() finderSettings: {
    search: {
      placeholder: string,
      feedback: {
        title: string,
        description: string,
        action?: {action: string, label: string, params?: Object},
        icon?: {type: string, name: string}
      }
    }
  }

  @Input() set finderSearchResults(result: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?:any}[] }[]>) {
    if(this.finder) this.finder.searchResults = result;
  }

  @Input() set finderPresets(result: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?:any}[] }[]>) {
    if(this.finder) this.finder.presets = result;
  }

  @Input() set theme(value:string) {
    this.themeIsDark = value == "dark";
  }

  searchEventSubscription: any;
  finderActionHandlerSubscription: any;

  constructor(
    private renderer:Renderer,
    private elementRef: ElementRef,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    private router: Router,
    public tether: TetherDialog
  ) { }

  ngOnInit() {
    
  }

  openFinder(e) {
    let component:ComponentRef<ModalSearchBoxComponent> = this.resolver.resolveComponentFactory(ModalSearchBoxComponent).create(this.injector);
    this.finder = component.instance;
    this.finder.title = this.finderTitle.toUpperCase();
    if(this.finderSettings) this.finder.settings = this.finderSettings;
    this.finder.theme = "narrow";

    this.searchEventSubscription = this.finder.searchEvent.subscribe( event => this.searchEvent.emit(event));
    this.finderActionHandlerSubscription = this.finder.actionEvent.subscribe ( event => this.finderActionHandler(event) );

    this.tether.modal(component, {
      escapeKeyIsActive: true,
      dialog: {
        style: { maxWidth: "450px", width: "80vw", height: "55vh" }
      },
      target: this.elementRef.nativeElement,
      attachment: "top left",
      targetAttachment: "top left"
    }).then(result => {
      this.emitFinderResult(result);
      this.onFinderClose();
    }).catch( reason => {
      this.onFinderClose();
    });

    this.actionEvent.emit({action: "finderOpen"});
  }

  onFinderClose() {
    this.searchEventSubscription.unsubscribe();
    this.finderActionHandlerSubscription.unsubscribe();
  }

  emitFinderResult(result) {
    this.title = result['title'];
    this.changeEvent.emit(result);
  }

  finderActionHandler(event) {
    switch(event.action) {
			case "gotoLink":
			  this.router.navigateByUrl(event.params.link);
			break;
		}
  }
}
