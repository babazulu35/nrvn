import { FileUploadBoxComponent } from './../../../base-module/components/file-upload-box/file-upload-box.component';
import { EntityService } from './../../../../services/entity.service';
import { Product } from './../../../../models/product';
import { Performance } from './../../../../models/performance';
import { PerformanceProduct } from './../../../../models/performance-product';
import { PriceList } from './../../../../models/price-list';
import { SeatStatus } from './../../../../models/seat-status.enum';
import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { NotificationService } from './../../../../services/notification.service';
import { CustomerSearchBoxComponent } from './../customer-search-box/customer-search-box.component';
import { VenueTemplateEditorComponent } from './../../components/venue-template-editor/venue-template-editor.component';
import { Component, OnInit, HostBinding, Input, Inject, ChangeDetectorRef, ComponentFactoryResolver, ComponentRef, Injector, ViewChild, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-customer-seat-capacity-editor',
  templateUrl: './customer-seat-capacity-editor.component.html',
  styleUrls: ['./customer-seat-capacity-editor.component.scss'],
  entryComponents: [ CustomerSearchBoxComponent ],
  providers: [
    {provide: 'performanceProductEntityService', useClass: EntityService }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerSeatCapacityEditorComponent implements OnInit {
  @HostBinding('class.oc-customer-seat-capacity') true;
  @ViewChild(VenueTemplateEditorComponent) venueTemplateEditor: VenueTemplateEditorComponent;
  @ViewChild(FileUploadBoxComponent) csvUpload: FileUploadBoxComponent;

  @Input() productId: number;
  @Input() title: string;
  @Input() editorRole: string = VenueTemplateEditorComponent.ROLE_RESERVATION;
  @Input() minCustomerCount: number = 1;
  @Input() maxCustomerCount: number = 1;
  @Input() minSeatCount: number = 1;
  @Input() maxSeatCount: number = 1;
  @Input() matchSeatsAndCustomers: boolean;
  @Input() csvAvailable: boolean;
  @Input() customers: {
    PhoneNumber: string,
    Name: string,
    Surname: string,
    Email: string,
    MemberId?: number
  }[];
  @Input() csv: {
    file: File,
    fileData: any,
    payload?: any
  }

  public breadcrumbs: {title:string, link?:string}[];
  public performance: Performance;
  public product: Product;
  public currentPrice: PriceList;
  public isLoading: boolean;
  public isPromising: boolean;
  
  public selectedSeatTags: {name: string, label: string, type?: any, params?: any}[] = [];

  public customerSearchBox: CustomerSearchBoxComponent;
  public customerFormSubmitSubscription: any;

  public standingBlocks:{
    id: number,
    title: string,
    currentCapacity?: number,
    oldCapacity?: number,
    availableCapacity?: number
    totalCapacity: number,
    availableSeats?: {Id: number}[],
    currentSeats?: {Id: number}[]
  }[];

  public get customerList(): any { return this.csv ? null : this.customers };

  public get canBeAddedNewCustomer():boolean {
    return this.maxCustomerCount == 0 || !this.customers || this.customers.length < this.maxCustomerCount;
  }

  public get isValid():boolean {
    return this.matchSeatsAndCustomers ? this.customers && this.selectedSeatTags && this.selectedSeatTags.length == this.customers.length : this.customers && this.customers.length >= this.minCustomerCount && (this.maxCustomerCount == 0 || this.customers.length <= this.maxCustomerCount) && this.selectedSeatCount + this.standingSeatCount >= this.minSeatCount && this.selectedSeatCount + this.standingSeatCount <= this.maxSeatCount;
  }

  public get selectedSeatCount():number {
    return this.selectedSeatTags ? this.selectedSeatTags.length : 0;
  }

  public get standingSeatCount():number {
    let count: number = 0;
    if(this.standingBlocks) this.standingBlocks.forEach( block => count += block.currentCapacity || 0 );
    return count;
  }

  constructor(
    @Inject('performanceProductEntityService') public performanceProductEntityService: EntityService,
    public injector: Injector,
    public resolver: ComponentFactoryResolver,
    public tetherService: TetherDialog,
    public changeDetector: ChangeDetectorRef,
    public notificationService: NotificationService
  ) { }

  ngOnInit() {
    // console.log("min / max customer ", this.minCustomerCount, this.maxCustomerCount);
    // console.log("min / max seat ", this.minSeatCount, this.maxSeatCount);
    // console.log("customers : ", this.customers);
    this.performanceProductEntityService.data.subscribe( entities => {
      if(entities && entities[0]) {
        this.performance = new Performance(entities[0]["Performance"]);
        this.product = new Product(entities[0]["Product"]);
        this.currentPrice = this.product.PriceLists[0];
        this.product.PriceLists.forEach( item => {
          if(item.BeginDate > new Date() && this.currentPrice.BeginDate < item.BeginDate) this.currentPrice = item;
        });
        this.setEditor();
      }
    });

    this.isLoading = true;
    this.performanceProductEntityService.setCustomEndpoint('GetAll');
    this.performanceProductEntityService
      .fromEntity('EPerformanceProduct')
      .where('ProductId', '=', this.productId)
      .expand(['Performance', 'Localization'])
      .expand(['Performance', 'VenueTemplate', 'Venue', 'Localization'])
      .expand(['Product', 'Localization'])
      .expand(['Product', 'PriceLists'])
      .take(1)
      .page(0)
      .executeQuery();
  }

  public setEditor() {
    this.breadcrumbs = [];
    if(this.performance) {
      this.breadcrumbs.push({title: this.performance.Localization.Name})
    }
    if(this.product) {
      this.breadcrumbs.push({title: this.product.Localization.Name})
    }
    if(this.title) {
      this.breadcrumbs.push({title: this.title})
    }
    this.changeDetector.detectChanges();
  }

  public openCustomerSearchBox(event) {
    if(this.venueTemplateEditor) this.venueTemplateEditor.resize(null);
    let component:ComponentRef<CustomerSearchBoxComponent> = this.resolver.resolveComponentFactory(CustomerSearchBoxComponent).create(this.injector);
    this.customerSearchBox = component.instance;
    this.customerSearchBox.guestFormHasIdNo = false;
    this.customerSearchBox.guestFormHasCityTown = false;
    this.customerSearchBox.guestFormShowQuickFill = false;
    this.customerSearchBox.hasBorder = true;

    this.tetherService.modal(component, {
      escapeKeyIsActive: true,
      dialog: {
        style: { maxWidth: "600px", width: "50vw", height: "auto" }
      },
      attachment: "top right",
      targetAttachment: "80px right",
      offset: "0px 10px"
      
    }).then(result => {
        this.addCustomer(result);
      }).catch( reason => {});
  }

  public addCustomer(customer){
    if(!this.customers) this.customers = [];
    let existCustomer = this.customers.find( item => customer["PhoneNumber"] ? item.PhoneNumber == customer["PhoneNumber"] : item.MemberId == customer["MemberId"])
    if(!existCustomer) {
      this.customers.push(customer);
      this.changeDetector.detectChanges();
    }else{
      this.notificationService.add({type: "danger", text: "Bu müşteri daha önce eklendiğinden işlem gerçekleşmedi"});
    }
  }

  public removeCustomer(customer) {
    let existCustomer = this.customers.find( item => item.PhoneNumber == customer["PhoneNumber"]);
    if(existCustomer) this.customers.splice(this.customers.indexOf(existCustomer), 1);
    this.changeDetector.detectChanges();
  }

  public venueEditorEventHandler(event) {
    switch(event.type) {
      case VenueTemplateEditorComponent.EVENT_LAYOUT_READY:
        this.isLoading = false;
        this.standingBlocks = [];
        let standingBlock: { id: number, title: string, currentCapacity?: number, currentSeats?: {Id:number}[], oldCapacity?: number, availableCapacity?: number, totalCapacity: number, availableSeats?: {Id:number}[]};

        if(event.payload && event.payload.Sections) {
          event.payload.Sections.forEach( section => {
            if(section.Blocks) section.Blocks.forEach( block => {
              if(block.IsStanding) {
                standingBlock = {
                  id: block.Id,
                  title: block.Name,
                  totalCapacity: block.RowCount * block.RowMaxSeat
                }
                block.Rows.forEach( row => {
                  if(row.Seats) {
                    if(this.editorRole == VenueTemplateEditorComponent.ROLE_RESERVATION) {
                      standingBlock.availableSeats = row.Seats.filter( seat => seat.ProductId == this.productId && seat.Status != SeatStatus.Reserved && (seat.Status == SeatStatus.OnSale || seat.Status == SeatStatus.Hold));
                      standingBlock.availableCapacity = standingBlock.availableSeats.length;
                      //standingBlock.currentSeats = row.Seats.filter( seat => seat.Status == SeatStatus.Reserved);
                      standingBlock.currentCapacity = 0; //standingBlock.currentSeats.length;
                      standingBlock.oldCapacity = standingBlock.currentCapacity;
                    }
                  }
                });
                this.standingBlocks.push(standingBlock);
              }
            })
          });
          this.venueTemplateEditor.resize();
          this.changeDetector.detectChanges();
        }
      break;
      case VenueTemplateEditorComponent.EVENT_SELECT:
        if(event.payload && this.maxSeatCount < event.payload.length) {
          let selectedItems = [];
          this.selectedSeatTags.forEach( item => {
            selectedItems.push(item.name);
          });
          this.notificationService.add({type: 'danger', text: 'Seçebileceğiniz maksimum koltuk adedini aştınız.'});
          let self = this;
          setTimeout(function() {
            self.venueTemplateEditor.selectSeats(null);
            self.venueTemplateEditor.selectSeats(selectedItems);
          }, 50);
          //this.venueTemplateEditor.selectSeats(null);
          //this.venueTemplateEditor.selectSeats(selectedItems);
        }else{
          let existItem: any;
          this.selectedSeatTags = [];
          event.payload.forEach( item => {
            if(item["Status"] != null) {
              this.selectedSeatTags.push({
                name: item["Id"],
                label: item["Name"] +"(" + item["Id"] + ")",
                params: {seat: item}
              });
            }
          });
        }
      break;
    };
    this.changeDetector.detectChanges();
  }

  csvChangeHandler(event) {
    this.csv = event;
    if(this.csv) this.customers = this.csv.payload;
  }

  csvValidationHandler(event) {
    if(event.valid) {
      let customerCount: number = event.payload && event.payload.length ? event.payload.length : 0;
      let message: string;
      let minValid: boolean = this.minCustomerCount > 0 ? customerCount >= this.minCustomerCount : true;
      let maxValid: boolean = this.maxCustomerCount > 0 ? customerCount <= this.maxCustomerCount : true;
      if(minValid && maxValid) {
        message = customerCount + " adet müşteri eklendi";
        this.notificationService.add({text: message, type: "success"});
      }else {
        if(this.minCustomerCount > 0 && customerCount < this.minCustomerCount) message = "CSV dosyasındaki müşteri sayısı hatalı. En az " + this.minCustomerCount + " müşteri kaydı olmalı";
        if(this.maxCustomerCount > 0 && customerCount > this.maxCustomerCount) message = "CSV dosyasındaki müşteri sayısı hatalı. En fazla " + this.maxCustomerCount + " müşteri kaydı olmalı";
        this.notificationService.add({text: message, type: "danger"});
        this.removeCsv();
      }
    }else {
      this.notificationService.add({text: event.message, type: "danger"});
    }
  }

  removeCsv() {
    this.csv = null;
    this.customers = null;
    if(this.csvUpload) this.csvUpload.removeFile(null);
  }

  public standingBlockChangeHandler(event) {
    let existBlock;
    event.forEach( block => {
      existBlock = this.standingBlocks.find( standingBlock => standingBlock.id == block.id );
      if(existBlock) existBlock.currentCapacity = block.currentCapacity;
    });

  }

  public submit(event:any) {
    if(this.standingBlocks && this.standingBlocks.length) {
      if(!this.selectedSeatTags) this.selectedSeatTags = [];
      let seat: any;
      this.standingBlocks.forEach( block => {
        if(this.editorRole == VenueTemplateEditorComponent.ROLE_RESERVATION) {
          for(let i:number = 0; i<block.currentCapacity; i++) {
            seat = block.availableSeats[i];
            if(seat) {
              this.selectedSeatTags.push({
                name: seat["Id"].toString(),
                label: seat["Name"] +"(" + seat["Id"] + ")",
                params: {seat: seat}
              });
            }
          }
        }
      })
    }
    this.tetherService.close( {seats: this.selectedSeatTags, customers: this.customers} );
  }

}
