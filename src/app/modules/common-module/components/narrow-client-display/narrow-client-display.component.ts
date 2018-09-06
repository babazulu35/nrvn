import { Router } from '@angular/router';
import { CustomerSearchBoxComponent } from '../../common/customer-search-box/customer-search-box.component';
import { Component, OnInit, HostBinding, HostListener, Input, Output, Renderer, ComponentFactoryResolver, ComponentRef, Injector, ViewChild, ElementRef, EventEmitter,OnDestroy } from '@angular/core';
import { TypeaheadComponent } from '../typeahead/typeahead.component';
import { TetherDialog } from '../../modules/tether-dialog/tether-dialog';
import { Observable } from 'rxjs/Rx';
import { ShoppingCartService } from '../../../../services/shopping-cart.service';

@Component({
  selector: 'app-narrow-client-display',
  templateUrl: './narrow-client-display.component.html',
  styleUrls: ['./narrow-client-display.component.scss'],
  entryComponents: [ CustomerSearchBoxComponent ]
})
export class NarrowClientDisplayComponent implements OnInit,OnDestroy {
  @HostBinding('class.c-narrow-client-display') true;
  @HostBinding('class.c-narrow-client-display--filled')
  get hasUser():boolean { return this.user != null }

  @Input() addCustomerButtonLabel: string;
  @Input() set userData(data: Object) {
    this.user = data;
  }

  @Output() actionEvent: EventEmitter<{action: string, data?: any}> = new EventEmitter();
  @Output() userChangeEvent: EventEmitter<{}> = new EventEmitter();
  @Output() formSubmitEvent: EventEmitter<{}> = new EventEmitter

  @Output() addedUser: EventEmitter<any> = new EventEmitter();
  @Output() addUserDataEvent: EventEmitter<any> = new EventEmitter();

  customerSearchBox: CustomerSearchBoxComponent;
  public user: Object;

  get userLetters():string {
    let letters: string = "";
    if(this.user && this.user["Name"] && this.user["Name"].length) letters += this.user["Name"].charAt(0).toUpperCase();
    if(this.user && this.user["Surname"] && this.user["Surname"].length) letters += this.user["Surname"].charAt(0).toUpperCase();
    return letters;
  }

  constructor(
    private renderer:Renderer,
    private elementRef: ElementRef,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    private router: Router,
    public tether: TetherDialog,
    private shoppingCartService : ShoppingCartService
  ) {
    
  }

  ngOnInit() {
  	this.shoppingCartService.cartUserSubject.subscribe(user=>{
  		this.user = user;
  	})
  }

  ngAfterViewInit(){
    if(!this.addCustomerButtonLabel) this.addCustomerButtonLabel = "MÜŞTERİ BİLGİSİ EKLE";
  }

  ngOnDestroy() {

   }

  openCustomerSearchBox() {
    let component:ComponentRef<CustomerSearchBoxComponent> = this.resolver.resolveComponentFactory(CustomerSearchBoxComponent).create(this.injector);
    this.customerSearchBox = component.instance;

    this.tether.modal(component, {
      escapeKeyIsActive: true,
      dialog: {
          style: { maxWidth: "600px", width: "80vw", height: "auto" }
      },
      attachment: "top right",
      targetAttachment: "80px right",
      offset: "0px 25px"

    }).then(result => {
    	let user = null;
        if(result['selected'] == true) {
          user = result["params"]["customer"]
        }
        else {
          user = result;
        }
        this.userChangeEvent.emit(user);
      }).catch( reason => {
        console.log(reason);
      });
  }

  removeUserData() {
    this.userData = null;
    this.userChangeEvent.emit(this.user);
  }

}
