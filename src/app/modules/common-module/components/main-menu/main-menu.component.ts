import { CheckboxComponent } from './../../../base-module/components/checkbox/checkbox.component';
import { RelativeDatePipe } from './../../../../pipes/relative-date.pipe';
import { EventDatesByPerformancesPipe } from './../../../../pipes/event-dates-by-performances.pipe';
import { VenuesByPerformancesPipe } from './../../../../pipes/venues-by-performances.pipe';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { Event } from './../../../../models/event';
import { EntitySearchBoxComponent } from './../../common/entity-search-box/entity-search-box.component';
import { BoxofficeService } from './../../../../services/boxoffice.service';
import { AuthenticationService } from './../../../../services/authentication.service';
import { Component, ComponentFactory, ComponentRef, ComponentFactoryResolver, EventEmitter, Injector, OnInit, Output, HostBinding, AfterViewInit, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { GetIconPipe } from '../../../../pipes/get-icon.pipe';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { ContextMenuComponent } from '../../components/context-menu/context-menu.component';
import { MenuItemService } from './../../../../services/menu-item.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  entryComponents:[ContextMenuComponent, EntitySearchBoxComponent]
})
export class MainMenuComponent implements OnInit {
    @ViewChild('quickSaleCheckbox') quickSaleCheckbox: CheckboxComponent;
	@HostBinding('class.c-main-menu') true;
	@HostBinding('class.c-main-menu--collapsed') @Input() isSideMenuCollapsed:boolean;
	@Output() toggleSideMenu : EventEmitter<boolean> = new EventEmitter<boolean>();
    
    itemsSet = [];
    items:Array<Object>;
    testFlag: boolean;
    quickSale: {
        isEnabled: boolean,
        event: Event,
        detailList: {label: string, value: string}[]
    } = {
        isEnabled: false,
        event: null,
        detailList: null
    }

    private entitySearchBox: EntitySearchBoxComponent;
    
    private menuTypes : { main : number } = { main : 1 };

 	constructor(
        private router: Router,
        private route: ActivatedRoute,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        public tetherService: TetherDialog,
        private menuItemService : MenuItemService,
        private authenticationService: AuthenticationService,
        private appSettingsService: AppSettingsService,
        private boxofficeService: BoxofficeService,
        private changeDetector: ChangeDetectorRef
     ) { }

	ngOnInit() {
        this.menuItemService.data.subscribe( result =>{
            if(result && result.length > 0) {
                let mainMenuItems = [];
                result.forEach(item => {
                    if(item.Type == this.menuTypes.main && item.IsActive){
                        if(item.ParentId){
                            let parentMenuItem = mainMenuItems.find(parentItem => {
                                return (parentItem.id == item.ParentId)
                            });
                            if(!parentMenuItem){
                                parentMenuItem = result.find(parentItem => {
                                    return (parentItem.Id == item.ParentId)
                                });
                                parentMenuItem = {
                                    id: parentMenuItem.Id,
                                    label: parentMenuItem['Localization']['Tr']['Label'],
                                    icon: (item.ClassName) ? item.ClassName : "event",
                                    submenu:[]
                                };
                                mainMenuItems.push(parentMenuItem);
                            }
                            parentMenuItem.submenu.push({
                                id:item.Id,
                                action: 'link',
                                label: item['Localization']['Tr']['Label'],
                                icon: (item.ClassName) ? item.ClassName : "event",
                                routerLink: item.Url
                            })
                        }else{
                            mainMenuItems.push({
                                id: item.Id,
                                label: item['Localization']['Tr']['Label'],
                                icon: (item.ClassName) ? item.ClassName : "event",
                                routerLink: item.Url,
                                submenu:[]
                            });
                        };
                        this.items = mainMenuItems;
                    }
                });
            }else{
                
            }
        });
        if(this.authenticationService.getAuthenticatedUser()) {
            this.getMenuItems();
        }else {
            this.authenticationService.user$.subscribe( user => {
                this.getMenuItems();
            });
        }

        this.router.events.subscribe( event => {
            if(event instanceof NavigationEnd) {
                this.checkUrl(event.urlAfterRedirects);
            }
        });
        this.checkUrl(this.router.url);

        this.boxofficeService.quickSaleEvent.subscribe( event => {
            this.quickSale.event = event;
            if(this.quickSale.event && this.quickSale.event.Id) {
                // if(this.isSideMenuCollapsed) this.toggle();
                let venuesByPerformancesPipe: VenuesByPerformancesPipe = new VenuesByPerformancesPipe();
                let eventDatesBypPerformancesPipe: EventDatesByPerformancesPipe = new EventDatesByPerformancesPipe();
                let eventDate = eventDatesBypPerformancesPipe.transform(this.quickSale.event.Performances);
                let dates: any[] = [];
                if(eventDate.BeginDate) dates.push(eventDate.BeginDate);
                if(eventDate.EndDate) dates.push(eventDate.EndDate);
                let relativeDate: RelativeDatePipe = new RelativeDatePipe();

                this.quickSale.detailList = [];
                this.quickSale.detailList.push({label: "ETKİNLİK", value: this.quickSale.event.Localization.Name});
                this.quickSale.detailList.push({label: "MEKAN", value: venuesByPerformancesPipe.transform(this.quickSale.event.Performances, 'odata')});
                this.quickSale.detailList.push({label: "TARİH", value: relativeDate.transform(dates)});
            }else{
                this.quickSale.detailList = null;
                this.quickSale.event = null;
                //this.router.navigate(['boxoffice', 'events']);
            }
            this.checkCollapsed();
        });
  	}

	ngAfterViewInit() {}

    private getMenuItems() {
        this.menuItemService.setHeader('Authorization', 'bearer ' + this.authenticationService.getToken());
        this.menuItemService.query({pageSize: 100});
    }

    checkUrl(url: string) {
        let parts = url.split('?')[0].split('/');
        this.quickSale.isEnabled = parts[1] == "boxoffice";
        if(this.quickSale.isEnabled) this.checkCollapsed();
    }

    checkCollapsed() {
        //if(this.quickSale.isEnabled && !this.isSideMenuCollapsed && !this.quickSale.event) this.toggle(); 
        if(this.quickSale.isEnabled) {
            this.isSideMenuCollapsed = !this.quickSale.event;
            this.toggleSideMenu.emit(this.isSideMenuCollapsed);
        }
    }

    gotoRoute(routerLink: string) {
        if(routerLink) this.router.navigateByUrl(routerLink);
    }

	openEventsContextMenu(e, index) {
        let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector)
        let instance: ContextMenuComponent = component.instance;
        let iconPipe:GetIconPipe = new GetIconPipe();
        instance.actionEvent.subscribe(action => {
            //this.eventService[action.action](event, action.parameters);
        });
        // let willChangeEventSaleStatus = event.status === 6 ? 2 : 6;
        // let willChangeEventPublishStatus = event.status === 8 ? 1 : 8;

        let dataso = this.items[index]['submenu'].length;
        this.itemsSet = [];
        for(let s = 0; s < this.items[index]['submenu'].length; s++){
            this.itemsSet.push(this.items[index]['submenu'][s]);
            instance.title = this.items[index]['label'];
        }
        instance.data = this.itemsSet;

        this.tetherService.context({
            title: "İŞLEMLER",
            data: this.itemsSet
          }, {
            target: e.currentTarget,
            attachment: "top left",
            targetAttachment: "top left",
            targetOffset: "8px 40px",
            overlay: {
                closeWhenClicked: true
            }
          }).then( result => {
            if(result) {
                switch(result['action']){
                    case('link'):
                        this.router.navigate([result['routerLink']]);
                    break;
                }
            }
          }).catch( reason => {
            this.itemsSet.length = 0;
          }
        );
    }

    openEntitySearchBox() {
        let component:ComponentRef<EntitySearchBoxComponent> = this.resolver.resolveComponentFactory(EntitySearchBoxComponent).create(this.injector);
        this.entitySearchBox = component.instance;
        this.entitySearchBox.selectedEntitiyType = this.appSettingsService.getLocalSettings('entityTypes').find( item => item.name == "Event");
        this.entitySearchBox.hasSearchOptions = false;
        this.entitySearchBox.entityExpandList = [
            ["Localization"],
            ['Performances','VenueTemplate','Venue','Localization'],
            ['Performances','VenueTemplate','Venue','Town','City']
        ]
        this.tetherService.modal(component, {
          escapeKeyIsActive: false,
        }).then(result => {
            this.boxofficeService.quickSaleEvent.next(result.params.entity);
        }).catch( reason => {
            this.boxofficeService.quickSaleEvent.next(this.quickSale.event && this.quickSale.event.Id ? this.quickSale.event : null);
            if(this.quickSaleCheckbox && !this.quickSale.event) this.quickSaleCheckbox.emitCheckEvent(false);
        });
      }

    quickSaleCheckHandler(event) {
        if(event) {
            this.openEntitySearchBox();
        }else{
            this.boxofficeService.quickSaleEvent.next(null);
        }
    }

  	toggle(){
	    this.isSideMenuCollapsed = !this.isSideMenuCollapsed;
	    this.toggleSideMenu.emit(this.isSideMenuCollapsed);
    }

    checkIsActive(routerLink: string):boolean {
        let active: boolean = false;
        if(routerLink) active = ('/'+this.router.url.split('?')[0].split('/')[1]).indexOf(routerLink) >= 0
        return active;
    }
}
