import { VenueEditorSeat } from './../../../../models/venue-editor-seat';
import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { environment } from './../../../../../environments/environment';
import { AuthenticationService } from './../../../../services/authentication.service';
import { Router } from '@angular/router';
import { Component, OnInit, HostBinding, Input, Renderer, ElementRef, Output, EventEmitter, ChangeDetectorRef, NgZone } from '@angular/core';


@Component({
  selector: 'app-venue-template-editor',
  templateUrl: './venue-template-editor.component.html',
  styleUrls: ['./venue-template-editor.component.scss']
})
export class VenueTemplateEditorComponent implements OnInit {

  static readonly TYPE_VENUE = 0;
	static readonly TYPE_SECTION = 1;
	static readonly TYPE_BLOCK = 2;
	static readonly TYPE_ROW = 3;
	static readonly TYPE_SEAT = 4;
	static readonly TYPE_STATIC_OBJECT = 5;
	static readonly TYPE_GATE = 6;

  static readonly EVENT_READY: string = "JSB:EVENT_READY";
  static readonly EVENT_SELECT: string = "JSB:EVENT_SELECT";
  static readonly EVENT_SELECT_LAST: string = "JSB:EVENT_SELECT_LAST";
  static readonly EVENT_SAVE_SUCCESS: string = "JSB:EVENT_SAVE_SUCCESS";
  static readonly EVENT_SAVE_FAIL: string = "JSB:EVENT_SAVE_FAIL";
  static readonly EVENT_LAYOUT_READY: string = "JSB:EVENT_LAYOUT_READY";

  static readonly COMMAND_CHANGE_ALLOWED_BLOCKS: string = "JSB:COMMAND_CHANGE_ALLOWED_BLOCKS";
  static readonly COMMAND_CHANGE_ALLOWED_SEATS: string = "JSB:COMMAND_CHANGE_ALLOWED_SEATS";
  static readonly COMMAND_CHANGE_SELECTABLES: string = "JSB:COMMAND_CHANGE_SELECTABLES";
  static readonly COMMAND_FOCUS_BLOCK: string = "JSB:COMMAND_FOCUS_BLOCK";
  static readonly COMMAND_NEW: string = "JSB:COMMAND_NEW";
  static readonly COMMAND_SAVE: string = "JSB:COMMAND_SAVE";
  static readonly COMMAND_SET_OBJECT_DATA: string = "JSB:COMMAND_SET_OBJECT_DATA";
  static readonly COMMAND_SELECT_SEATS: string = "JSB:COMMAND_SELECT_SEATS";
  static readonly COMMAND_CHANGE_DISABLED_SEATS: string = "JSB:COMMAND_CHANGE_DISABLED_SEATS";
  static readonly COMMAND_SELECT_BLOCKS: string = "JSB:COMMAND_SELECT_BLOCKS";
  static readonly COMMAND_COMMAND_RESIZE: string = "JSB:COMMAND_RESIZE";
  static readonly COMMAND_CHANGE_ROLE: string = "JSB:COMMAND_CHANGE_ROLE";
  static readonly COMMAND_CHANGE_SELECTION_LIMIT: string = "JSB:COMMAND_CHANGE_SELECTION_LIMIT";
  static readonly COMMAND_CHANGE_ASSIGNED_CUSTOMER: string = "JSB:COMMAND_CHANGE_ASSIGNED_CUSTOMER";
  static readonly COMMAND_BATCH_ASSIGN_CUSTOMERS: string = "JSB:COMMAND_BATCH_ASSIGN_CUSTOMERS";
  static readonly COMMAND_CHANGE_ASSIGNED_PRODUCT: string = "JSB:COMMAND_CHANGE_ASSIGNED_PRODUCT";
  static readonly COMMAND_BATCH_ASSIGN_PRODUCTS: string = "JSB:COMMAND_BATCH_ASSIGN_PRODUCTS";
  static readonly COMMAND_CHANGE_ASSIGNED_FILTER: string = "JSB:COMMAND_CHANGE_ASSIGNED_FILTER";
  static readonly COMMAND_BATCH_ASSIGN_FILTERS: string = "JSB:COMMAND_BATCH_ASSIGN_FILTERS";
  static readonly COMMAND_CHANGE_SEAT_COLORING_MODE: string = "JSB:COMMAND_CHANGE_SEAT_COLORING_MODE";
  static readonly COMMAND_GET_CURRENT_VENUE_DATA: string = "JSB:COMMAND_GET_CURRENT_VENUE_DATA";


  static readonly ROLE_VENUE: string = "venue_editor";
  static readonly ROLE_PERFORMANCE: string = "performance_editor";
  static readonly ROLE_PRODUCT: string = "product_editor";
  static readonly ROLE_MULTI_PRODUCT: string = "multi_product";
  static readonly ROLE_SALES_MOBILET: string = "sales_screen_mobilet";
  static readonly ROLE_SALES_BACKOFFICE: string = "sales_screen_box_office";
  static readonly ROLE_CANCEL_BLOCK: string = "cancel_block";
  static readonly ROLE_GROUP_SALES: string = "group_sales";
  static readonly ROLE_RESERVATION: string = "reservation";
  static readonly ROLE_RELOCATION_SELECT_SOURCE: string = "relocation_select_source";
  static readonly ROLE_RELOCATION_SELECT_TARGET: string = "relocation_select_target";
  static readonly ROLE_INVITATION_POOL: string = "invitation_pool";
  static readonly ROLE_CUSTOMER_ASSIGNMENT: string = "customer_assignment";

  @HostBinding('class.c-venue-template-editor') true;

  @Output() actionEvent: EventEmitter<{action: string, data?: any}> = new EventEmitter();
  @Output() editorEvent: EventEmitter<any> = new EventEmitter();

  @Input() role: string;
  @Input() venueId: any = null;
  @Input() templateId: any = null;
  @Input() performanceId: any = null;
  @Input() productId: any = null;
  @Input() firmCode: any = null;
  @Input() channelCode: any = null;
  @Input() seatSelectionEnabled: boolean;
  @Input() selectionLimit: number;
  @Input() productColor: string;

  @Input() templateName: string = null;

  @Input() environmentApiPath: string = environment["api"]["host"] + "/" + environment["api"]["path"] + "/";
  environmentName: string = environment['name'];

  @Input() set moduleName(value: string) {
    if(!value) value = "host";
    this.environmentApiPath = environment["api"][value] + "/" + environment["api"]["path"] + "/";
  }

  public venuedScript;
  public venued;
  public venuedConf;

  isLoading: boolean = false;
  selectedSeats: {}[];
  
  isBatching: boolean = false;
  batchPromise: Promise<any>;
  batchResolve: (result?: any) => void;
  batchReject: (reason?: any) => void;

  isSelecting: boolean = false;
  selectPromise: Promise<any>;
  selectResolve: (result?: any) => void;
  selectReject: (reason?: any) => void;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private element: ElementRef,
    private renderer: Renderer,
    private changeDetector: ChangeDetectorRef,
    private tetherService: TetherDialog,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if(this.venuedScript) {
      this.element.nativeElement.removeChild(this.venuedScript);
      delete this.venuedScript;
      delete this.venued;
      this.venuedScript = null;
      this.venued = null;
      delete window["_venued_jsb"];
      delete window["_venued_jsb_receiver"];
    }
  }

  ngAfterViewInit(){
    let conf: {
      role: string, 
      env: string, 
      accessToken: any, 
      venueId?: any, 
      templateId?: any, 
      performanceId?: any, 
      productId?: any, 
      firmCode?:any, 
      channelCode?: any,
      seatSelectionEnabled?: boolean,
      selectionLimit?: number,
      overrideHost?:string
      productColor?: string,
    };
    conf = {
      role: this.role,
      env: this.environmentName,
      overrideHost: this.environmentApiPath,
      accessToken: this.authenticationService.getToken()
    };

    let hasError: boolean = false;
    switch(this.role) {
      case VenueTemplateEditorComponent.ROLE_VENUE:
        if(this.venueId) {
          conf.venueId = this.venueId;
          conf.templateId = this.templateId || -1
        }else{hasError = true};
      break;
      case VenueTemplateEditorComponent.ROLE_PRODUCT:
        if(this.performanceId) {
          conf.performanceId = this.performanceId;
          conf.productId = this.productId;
        }else{hasError = true};
      break;
      case VenueTemplateEditorComponent.ROLE_MULTI_PRODUCT:
        if(this.templateId) {
          conf.templateId = this.templateId;
          conf.productId = this.productId;
          conf.productColor = this.productColor;
        }else{hasError = true};
      break;
      case VenueTemplateEditorComponent.ROLE_RESERVATION:
        if(this.performanceId && this.productId) {
          conf.performanceId = this.performanceId;
          conf.productId = this.productId;
        }else{hasError = true};
      break;
      case VenueTemplateEditorComponent.ROLE_PERFORMANCE:
      case VenueTemplateEditorComponent.ROLE_CANCEL_BLOCK:
      case VenueTemplateEditorComponent.ROLE_GROUP_SALES:
      case VenueTemplateEditorComponent.ROLE_RELOCATION_SELECT_SOURCE:
      case VenueTemplateEditorComponent.ROLE_RELOCATION_SELECT_TARGET:
      case VenueTemplateEditorComponent.ROLE_INVITATION_POOL:
      case VenueTemplateEditorComponent.ROLE_CUSTOMER_ASSIGNMENT:
        if(this.performanceId) {
          conf.performanceId = this.performanceId;
        }else{hasError = true};
      break;
      case VenueTemplateEditorComponent.ROLE_SALES_BACKOFFICE:
      case VenueTemplateEditorComponent.ROLE_SALES_MOBILET:
        if(this.performanceId) {
          conf.performanceId = this.performanceId;
          conf.firmCode = this.firmCode;
          conf.channelCode = this.channelCode;
          conf.productId = this.productId;
          conf.seatSelectionEnabled = this.seatSelectionEnabled;
          conf.selectionLimit = this.selectionLimit;
        }else{hasError = true};
      break;

    }

    if(hasError) {
      alert("Venue Editor " + this.role +" rolü için gerekli alanlar eksik");
    }else{
      let self = this;
      this.ngZone.runOutsideAngular( function() {
        window["_venued_conf"] = conf;
        self.setupVenueEditor();
      })
    }
  }

  public getSeatIds(seats: VenueEditorSeat[]):number[] {
    let seatIds: number[];
    if(seats && seats.length) {
      seatIds = [];
      seats.forEach( seat => seatIds.push(seat.Id));
    }
    return seatIds;
  }

  public save(payload: {}) {
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_SAVE, payload);
  }

  public setSeat(payload: {}) {
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_SET_OBJECT_DATA, payload);
  }

  public changeRole(payload: string) {
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_CHANGE_ROLE, payload);
  }

  public changeSelectionLimit(payload: number) {
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_CHANGE_SELECTION_LIMIT, payload);
  }

  public selectSeats(payload: number[], timeout?:number): Promise<any> {
    this.isSelecting = true;
    this.selectPromise = new Promise((resolve, reject) => {
      this.selectResolve = resolve;
      this.selectReject = reject;
    });
    if(timeout){
      setTimeout(() => this.sendToApp(VenueTemplateEditorComponent.COMMAND_SELECT_SEATS, payload), timeout);
    }else{
      this.sendToApp(VenueTemplateEditorComponent.COMMAND_SELECT_SEATS, payload);
    }
    return this.selectPromise;
  }

  public disableSeats(payload: number[]) {
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_CHANGE_DISABLED_SEATS, payload);
  }

  public selectBlocks(payload: number[]) {
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_SELECT_BLOCKS, payload);
  }

  public setCustomer(customerId: any, selectedSeats?: number[]) {
    let promise: Promise<any>;
    if(selectedSeats) {
      promise = this.selectCustomerSeats([{
        customerId: customerId,
        seatIds: selectedSeats
      }])
    }
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_CHANGE_ASSIGNED_CUSTOMER, {customerId: customerId});
    return promise  || Promise.resolve();
  }

  public selectCustomerSeats(customersPayload: {customerId: any, seatIds?: number[]}[], targetProp?:any):Promise<any> {
    this.isBatching = true;
    this.batchPromise = new Promise((resolve, reject) => {
      this.batchResolve = resolve;
      this.batchReject = reject;
    });
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_BATCH_ASSIGN_CUSTOMERS, {assignments: customersPayload, targetProp: targetProp});
    return this.batchPromise;
  }

  public setFilter(filterId: any, selectedSeats?: number[]) {
    let promise: Promise<any>;
    if(selectedSeats) {
      promise = this.selectFilterSeats([{
        filterId: filterId,
        seatIds: selectedSeats
      }])
    }
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_CHANGE_ASSIGNED_FILTER, {filterId: filterId});
    return promise  || Promise.resolve();
  }

  public selectFilterSeats(filtersPayload: {filterId: any, seatIds?: number[]}[], targetProp?:any):Promise<any> {
    this.isBatching = true;
    this.batchPromise = new Promise((resolve, reject) => {
      this.batchResolve = resolve;
      this.batchReject = reject;
    });
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_BATCH_ASSIGN_FILTERS, {assignments: filtersPayload, targetProp: targetProp});
    return this.batchPromise;
  }

  public resize(payload: {width: number, height: number} = null) {
    if(this.tetherService.component && this.tetherService.component.dialogIsOpen) return;
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_COMMAND_RESIZE, payload);
  }

  public setProduct(productId: number, productColor?: string, selectedSeats?: number[]) {
    if(selectedSeats) {
      this.selectProductSeats([{
        productId: productId,
        productColor: productColor,
        seatIds: selectedSeats
      }])
    }
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_CHANGE_ASSIGNED_PRODUCT, {productId: productId, productColor: productColor});
  }

  public selectProductSeats(productPayloads: {productId: number, productColor?: string, seatIds?: number[]}[]):Promise<any> {
    this.isBatching = true;
    this.batchPromise = new Promise((resolve, reject) => {
      this.batchResolve = resolve;
      this.batchReject = reject;
    });
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_BATCH_ASSIGN_PRODUCTS, productPayloads);
    return this.batchPromise;
  }

  public getCurrentVenueData(callBack:(payload: any)=>void) {
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_GET_CURRENT_VENUE_DATA, callBack);
  }

  public changeColorMode(theme?: string) {
    this.sendToApp(VenueTemplateEditorComponent.COMMAND_CHANGE_SEAT_COLORING_MODE, theme);
  }

  public sendToApp(type: string, payload: any) {
    let self = this;
    this.ngZone.runOutsideAngular( function() {
      if(self.venued) self.venued.sendToApp({type: type, payload: payload});
    });
  }

  setupVenueEditor(){
    let self = this;
    this.isLoading = true;
    this.venuedScript = document.createElement('script');
    this.venuedScript.type = "text/javascript";
    this.venuedScript.id = "venued-loader";

    this.venuedScript.onload = function(){
      self.venued = window["_venued_jsb"];
      //console.log("loaded : ", this, window["_venued_jsb"]);
    }

    window["_venued_jsb_receiver"] = function(event) {
      switch(event.type) {
        case VenueTemplateEditorComponent.EVENT_READY:
        case VenueTemplateEditorComponent.EVENT_LAYOUT_READY:
          self.isLoading = false;
          self.resize();
          setTimeout(function() {
            self.resize();
          }, 500);
        break;
        case VenueTemplateEditorComponent.EVENT_SELECT:
          setTimeout(() => {
            if(self.isBatching && self.batchResolve) {
              self.batchResolve(event.payload);
              self.batchPromise = null;
              self.batchResolve = null;
              self.batchReject = null;
            }
            if(self.isSelecting && self.selectResolve) {
              self.selectResolve(event.payload);
              self.selectPromise = null;
              self.selectResolve = null;
              self.selectReject = null;
            }
            self.isBatching = false
            self.isSelecting = false;
          }, 100);
        break;
      }
      self.editorEvent.emit(event);
    }

    this.venuedScript.src = environment.venued.jsPath;
    this.element.nativeElement.appendChild(this.venuedScript);
  }
}
