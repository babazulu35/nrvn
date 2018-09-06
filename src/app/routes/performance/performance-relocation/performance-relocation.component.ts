import { CollapsibleContainerComponent } from './../../../modules/common-module/components/collapsible-container/collapsible-container.component';
import { NotificationService } from './../../../services/notification.service';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { EntityService } from './../../../services/entity.service';
import { PerformanceService } from './../../../services/performance.service';
import { VenueTemplateEditorComponent } from './../../../modules/common-module/components/venue-template-editor/venue-template-editor.component';
import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { SeatStatus } from './../../../models/seat-status.enum';
import { PerformanceStatus } from '../../../models/performance-status.enum';
import { Performance } from '../../../models/performance';

@Component({
  selector: 'app-performance-relocation',
  templateUrl: './performance-relocation.component.html',
  styleUrls: ['./performance-relocation.component.scss'],
  providers: [
    {provide: 'performanceEntityService', useClass: EntityService },
    {provide: 'getSeatBySeatIdService', useClass: PerformanceService },
  ]
})
export class PerformanceRelocationComponent implements OnInit {
  @ViewChild(VenueTemplateEditorComponent) venueTemplateEditor: VenueTemplateEditorComponent;
  @ViewChild(CollapsibleContainerComponent) collapsibleContainer: CollapsibleContainerComponent;

  performance: Performance;
  PerformanceStatus = PerformanceStatus;

  currentLocations: {id:number, name:string, params?:{} }[];
  newLocations: {id:number, name:string, params?:{} }[];
  relocationIsActive: boolean = false;

  routeSubscription: any;
  isLoading: boolean = false;
  isPromising: boolean = false;
  isEditorEnabled: boolean = true;

  editorRole: string = VenueTemplateEditorComponent.ROLE_RELOCATION_SELECT_SOURCE;

  relocateSeatsData: {
    SourceSeatList: number[],
    TargetSeatList: number[]
  }

  get isValid():boolean {
    return this.currentLocations ? !this.currentLocations.find( loc => loc.params["new"] == null) : false;
  }

  constructor(
    @Inject('performanceEntityService') private performanceEntityService: EntityService,
    @Inject('getSeatBySeatIdService') private getSeatBySeatIdService: EntityService,
    private performanceService: PerformanceService,
    
    private router: Router,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tetherService: TetherDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.routeSubscription = this.route.parent.params.subscribe( params =>  {
      if(!params) return;
      this.isLoading = true;
      this.performanceEntityService.data.subscribe( entities => {
        if(entities[0]) {
          this.performance = entities[0];
          console.log(this.performance);
        }
      });

      this.performanceEntityService.setCustomEndpoint('GetAll');
      this.performanceEntityService.fromEntity('EPerformance')
        .where('Id', '=', params["id"])
        .take(1).page(0)
        .executeQuery();
    });

    this.getSeatBySeatIdService.data.subscribe( result => {
      if(result && result.length > 1) {
        this.tetherService.confirm({
          title: "Seçtiğiniz koltuk toplu satılmış bir koltuk grubunun parçasıdır.",
          image: "assets/images/confirm/group-seats.png",
          description: "<b>ÖNEMLİ! </b>Toplu olarak satılmış koltuklar gruba dahil olan diğer koltuklarla birlikte taşınabilirler",
          confirmButton: {label: "DEVAM ET", theme: "secondary"},
          dismissButton: {type: "link", label: "VAZGEÇ"}
        }, {
          dialog: {
            style: {
              width: "400px",
              height: "auto",
              minHeight: "100px",
              maxWidth: "auto",
              backgroundColor: null
            }
          }
        }).then( feedback => {
          let ids: number[] = [];
          result.forEach( item => ids.push(item.SeatId));
          this.venueTemplateEditor.selectSeats(ids);
          this.venueTemplateEditor.changeSelectionLimit(0);
        }).catch( reason => {
          this.venueTemplateEditor.selectSeats(null);
          this.venueTemplateEditor.changeSelectionLimit(0);
        });
      }
      this.isLoading = false;
      this.changeDetector.detectChanges();
    }, error => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.routeSubscription = null;
  }

  venueEditorEventHandler(event) {
    switch(event.type) {
      case VenueTemplateEditorComponent.EVENT_LAYOUT_READY:
        this.isLoading = false;
        if(this.collapsibleContainer) this.collapsibleContainer.resize();
      break;
      case VenueTemplateEditorComponent.EVENT_SELECT:
        if(this.relocationIsActive){
          this.newLocations = [];
        }else{
          this.currentLocations = [];
        }

        event.payload.forEach( item => {
          switch(item._type) {
            case VenueTemplateEditorComponent.TYPE_SEAT:
              if(this.relocationIsActive) {
                this.newLocations.push({id: item.Id, name: item.BlockName + " / " + item.RowName + "-" + item.Name, params: {seat: item}});
                this.relocateSeats();
              }else{
                this.currentLocations.push({id: item.Id, name: item.BlockName + " / " + item.RowName + "-" + item.Name, params: {seat: item}});
              }
            break;
          }
        });
        if(!this.relocationIsActive && this.currentLocations.length == 1) this.checkSeatRelations(this.currentLocations[0].id);
        if(this.relocationIsActive && !this.newLocations.length) this.relocateSeats();
      break;
    }
    this.changeDetector.detectChanges();
  }

  checkSeatRelations(seatId) {
    //todo check relations and reselect seats
    this.getSeatBySeatIdService.setCustomEndpoint('GetSeatsBySeatId');
    this.getSeatBySeatIdService.query({pageSize: 100}, [{key: "SeatId", value: seatId}]);
    this.isLoading = true;
  }

  addSeatToCurrentLocations(seat: any) {
    if(!this.currentLocations) this.currentLocations = [];
    this.currentLocations.push({id: seat.Id, name: seat.BlockName + " / " + seat.RowName + "-" + seat.Name, params: {seat: seat}});
  }

  startRelocation() {
    this.relocationIsActive = true;
    this.venueTemplateEditor.selectSeats(null);
    let ids: number[] = [];

    this.currentLocations.forEach( item => ids.push(item.id));
    this.venueTemplateEditor.changeRole(VenueTemplateEditorComponent.ROLE_RELOCATION_SELECT_TARGET);
    this.venueTemplateEditor.changeSelectionLimit(ids.length);
    this.venueTemplateEditor.disableSeats(ids);
  }

  relocateSeats() {
    if(!this.currentLocations || !this.currentLocations.length) return;
    let index: number = 0;
    let newLoc: any;
    this.currentLocations.forEach( currentLoc => {
      newLoc = this.newLocations[index];
      currentLoc.params["new"] = newLoc;
      index++;
    })
  }

  newLocationActionHandler(event) {
    switch(event.action) {
      case "remove":
        let location = this.newLocations.find( loc => loc.id == event.data.id);
        if(location) this.newLocations.splice(this.newLocations.indexOf(location), 1);
        let selectedIds: number[] = [];
        this.newLocations.forEach( loc => selectedIds.push(loc.id));
        this.venueTemplateEditor.selectSeats(null);
        this.venueTemplateEditor.selectSeats(selectedIds);
      break;
    }
  }

  saveRelocation() {
    this.relocateSeatsData = {
      SourceSeatList: [],
      TargetSeatList: []
    };
    this.currentLocations.forEach( loc => this.relocateSeatsData.SourceSeatList.push(loc.id) );
    this.newLocations.forEach( loc => this.relocateSeatsData.TargetSeatList.push(loc.id) );
    
    this.isPromising = true;
    this.performanceService.setCustomEndpoint('RelocateSeats');
    this.performanceService.create(this.relocateSeatsData).subscribe(
      result => {
        this.notificationService.add({type: "success", text: "Koltuk taşıma işlemi başarıyla gerçekleştirildi"});
        let location;
        if(result.RelocatedSeats) result.RelocatedSeats.forEach( relocatedSeat => {
          location = this.currentLocations.find( item => item.id == relocatedSeat.SourceSeat);
          if(location) {
            location.params.seat.Status = SeatStatus.Hold;
            this.venueTemplateEditor.setSeat(location.params.seat);
          }
          location = this.newLocations.find( item => item.id == relocatedSeat.TargetSeat);
          if(location) {
            location.params.seat.Status = SeatStatus.Sold;
            this.venueTemplateEditor.setSeat(location.params.seat);
          }
        });
        this.reset();
      },
      error => {
        this.notificationService.add({type: 'danger', text: error.Message});
        this.reset();
      }
    )
  }

  reset(){
    this.currentLocations = null;
    this.newLocations = null;
    this.venueTemplateEditor.changeRole(VenueTemplateEditorComponent.ROLE_RELOCATION_SELECT_SOURCE);
    this.venueTemplateEditor.changeSelectionLimit(1);
    this.venueTemplateEditor.selectSeats(null);
    this.venueTemplateEditor.disableSeats(null);
    this.relocationIsActive = false;
    this.isPromising = false;
  }

}
