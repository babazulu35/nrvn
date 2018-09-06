import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, HostBinding, ComponentFactoryResolver, ChangeDetectorRef, Injector, ComponentRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { ContextMenuComponent } from "../../../modules/common-module/components/context-menu/context-menu.component";
import { TetherDialog } from "../../../modules/common-module/modules/tether-dialog/tether-dialog";

@Component({
  selector: 'app-event-reports',
  templateUrl: './event-reports.component.html',
  styleUrls: ['./event-reports.component.scss'],
  entryComponents:[ContextMenuComponent]
})
export class EventReportsComponent implements OnInit,AfterViewInit {
  @HostBinding('class.or-event-reports') true;
  
  private contextResult:string = "ticketStatistics";
  
  private reportStatistics:{label:string,progressData?:{value: string,color: string},key:string }[];
  private reportStatisticsTrans:{label:string,progressData?:{value: string,color: string},key:string }[];

  constructor(
		private resolver: ComponentFactoryResolver,
		private injector: Injector,
		private changeDetector: ChangeDetectorRef,
		private tetherService: TetherDialog,  
    private route: ActivatedRoute  
  ) { 
    
  }
  
  ngOnInit() {
 
    this.reportStatistics = [{
      label:'HBO',
      key: '2165',
      progressData:{
        value: '15',
        color:'#ec4e48'
      }
    },{
      label:'HAO',
      key: '2185',
      progressData:{
        value: '22',
        color:'#ff9aff'
      }    
    }]

    this.reportStatisticsTrans = [{
      label:'HBO',
      key: '2165',
      progressData:{
        value: '85',
        color:'#54dddd'
      }
    }]    
  }

  ngAfterViewInit() {
    console.log(this.route);
  }
  
  openReportsMenu(event) {
    let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector);
		let instance: ContextMenuComponent = component.instance;
		instance.title = "DEĞİŞTİR";
        instance.data = [
            { label: 'Bilet Satış İstatistikleri', action: "ticketStatistics"},
            { label: 'Etkinlik Sayfası Ziyaret Bilgileri', action: 'eventVisitData'},
            { label: 'Demografik Dağılımlar', action:'demographic'}
        ];   

		this.tetherService.context(component,
		{
			  overlay:{},
				target: event.target,
				attachment: "top left",
				targetAttachment: "top left",
			}
		).then(result =>  {
      
      this.contextResult = result.action;
		
		}).catch(reason => {
		
		})
         

  }
    
}
