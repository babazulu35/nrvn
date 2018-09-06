import { environment } from './../../../../../environments/environment';
import { AuthenticationService } from './../../../../services/authentication.service';
import { Router } from '@angular/router';
import {
    Component,
    ComponentFactory,
    ComponentRef,
    ComponentFactoryResolver,
    Type,
    ViewContainerRef,
    Injector,
    OnInit,
    ChangeDetectorRef
} from '@angular/core';

import { HeaderTitleService } from './../../../../services/header-title.service';
import { TetherDialog } from '../../modules/tether-dialog/tether-dialog';
import { EntityService } from './../../../../services/entity.service';

//Dialog Contents...
import { HeaderSearchBarComponent } from '../header-search-bar/header-search-bar.component';
import { ModalSearchBoxComponent } from '../modal-search-box/modal-search-box.component';

import { ContextMenuComponent } from '../context-menu/context-menu.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    entryComponents: [HeaderSearchBarComponent, ContextMenuComponent, ModalSearchBoxComponent],
    host: {
        class: "c-header"
    },
    providers: [EntityService],
})
export class HeaderComponent implements OnInit {

    username: string;
    firstname: string;
    lastname: string;
    images: string;
    letters: string;
    logo: string;
    timer: string;
    showTimer: boolean;

    get fullname():string {
        return this.firstname + " " + this.lastname;
    }

    get title() {
        return this.headerTitleService.getTitle();
    }
    get link() {
        return this.headerTitleService.getLink();
    }

    constructor(
        private authenticationService: AuthenticationService,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        private viewContainer: ViewContainerRef,
        private router: Router,
        public tetherService: TetherDialog,
        private headerTitleService: HeaderTitleService,
        private entityService: EntityService,
        private changeDetector: ChangeDetectorRef
    ) {

    }

    ngOnInit() {
        let user = this.authenticationService.getAuthenticatedUser();
        if(user) {
            this.firstname = user.FirstName;
            this.lastname = user.LastName;
            this.images = user.Images;
        }
        if(this.images == 'null') this.images = null;
        if(this.firstname == 'null') this.firstname = null;
        if(this.lastname == 'null') this.lastname = null;

        if(this.firstname && this.lastname) this.letters = this.firstname.charAt(0) + this.lastname.charAt(0);
        if(this.username && this.username.length > 1 && !this.letters) this.letters = this.username.charAt(0).toUpperCase() + this.username.charAt(1).toLocaleLowerCase();
        (this.firstname) ? this.firstname.split(/\b/)[0] : this.firstname;

        this.changeDetector.detectChanges();

        this.entityService.setCustomEndpoint('GetAll');
        this.entityService.fromEntity('SUserPromoter')
            .where('UserId', '=', user.Id)
            .expand(['Promoter'])
            .take(1).page(0)
            .executeQuery();

        this.entityService.data.subscribe(entities => {
            if (entities && entities[0] && entities[0].Promoter) {
                this.logo = entities[0].Promoter.Logo;
                this.authenticationService.setPromoter(entities[0].Promoter);
            }
        });

        //Test için timer açılabilir.
        // this.authenticationService.tokenExpiresInTime$.subscribe( time => {
        //     this.timer = this.getFormattedTimer(time);
        // });

        // this.showTimer = environment.name == "test";
    }

    openUserActions(event) {
        let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector)
        let instance: ContextMenuComponent = component.instance;

        instance.data = [
            // {action: "refreshToken", icon: 'replay', label: 'Refresh Token'},
            {action: "gotoLink", icon: 'exit_to_app', label: 'Oturumu Kapat', params: "/logout"}
        ]
        this.tetherService.context(component,
            {
                target: event.target,
                attachment: "top right",
                targetAttachment: "top right",
                targetOffset: '-13px 0px'
            }).then(result => {
                switch(result['action']) {
                    case "gotoLink":
                        this.router.navigate([result['params']])
                    break;
                    case "refreshToken":
                        this.authenticationService.refreshLogin();
                    break;
                }
            }).catch(reason => {

            });
    }

    showUserDetail(event) {

    }


	private getFormattedTimer(duration: number) {
		let s = duration;
		let ms = s % 1000;
		s = (s - ms) / 1000;
		let secs = s % 60;
		s = (s - secs) / 60;
		let mins = s % 60;
		let hrs = (s - mins) / 60;
		
		return this.pad(hrs) + ':' + this.pad(mins) + ':' + this.pad(secs);
	}

	private pad(n:number, z?:number) {
		z = z || 2;
		return ('00' + n).slice(-z);
    }
    
    // openHeaderSearchBar(event) {
    //     this.tetherService.modal(this.resolver.resolveComponentFactory(HeaderSearchBarComponent),
    //         {
    //             escapeKeyIsActive: false,
    //             dialog: {
    //                 style: {
    //                     width: "40vw",
    //                     height: "55vh"
    //                 }
    //             },
    //             target: event.target,
    //             attachment: "top right",
    //             targetAttachment: "top right"
    //         }).then(result => {
    //             console.log("promise result : ", result);
    //         }).catch(reason => {
    //             console.log("dismiss reason : ", reason);
    //         });
    // }

    // openHelpDrawer() {
    //     this.tetherService.drawer(this.resolver.resolveComponentFactory(HeaderSearchBarComponent),
    //         {

    //         }).then(result => {
    //             console.log("promise result : ", result);
    //         }).catch(reason => {
    //             console.log("dismiss reason : ", reason);
    //         });
    // }

    // openNotificationModal() {
    //     let component: ComponentRef<ModalSearchBoxComponent> = this.resolver.resolveComponentFactory(ModalSearchBoxComponent).create(this.injector)
    //     let instance: ModalSearchBoxComponent = component.instance;

    //     instance.title = "Notification Ara"
    //     instance.settings = {
    //         search: {
    //             placeholder: 'Eklemek istediğiniz notification ismini yazın',
    //             feedback: {
    //                 title: 'Aramanız ile eşleşen notification kaydı bulunamadı',
    //                 description: 'Arama kriterlerini değiştirerek yeniden deneyebilir ya da yeni notification ekleyebilirsiniz',
    //                 action: {
    //                     action: 'createNewNotification',
    //                     label: 'YENİ NOTIFICATION OLUŞTUR',
    //                     params: { link: '/notification/create' }
    //                 }
    //             }
    //         }
    //     }
    //     instance.resultEvent.subscribe(result => {
    //         console.log("Result Event Hanlder : ", result);
    //     })

    //     this.tetherService.modal(component,
    //         {
    //             dialog: {
    //                 class: "c-tether-dialog__content--half"
    //             },
    //             //dismissConfirm: true,
    //             //dismissConfirmMessage: "İşleminizi kaydetmeden çıkmak istiyor musunuz?"
    //         }).then(result => {
    //             console.log("promise result : ", result);
    //         }).catch(reason => {
    //             console.log("dismiss reason : ", reason);
    //         });
    // }
}
