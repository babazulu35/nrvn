import { Subscription } from 'rxjs/Subscription';
import { NotificationService } from './../../../../services/notification.service';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { Performance } from './../../../../models/performance';
import { MulitplePerformanceService } from './../../mulitple-performance.service';
import { Component, OnInit, HostBinding, Input, ViewChild, ElementRef, ComponentRef, ComponentFactoryResolver, Injector, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { TimeInputComponent } from '../../../base-module/components/time-input/time-input.component';

import * as moment from 'moment';
import { LocalizationBoxComponent } from '../../../base-module/components/localization-box/localization-box.component';
import { AppSettingsService } from '../../../../services/app-settings.service';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-performance-cell-box',
  templateUrl: './performance-cell-box.component.html',
  styleUrls: ['./performance-cell-box.component.scss'],
  entryComponents: [LocalizationBoxComponent]
})
export class PerformanceCellBoxComponent implements OnInit {
  @ViewChild(TimeInputComponent) timeInput: TimeInputComponent;
  
  @HostBinding('class.c-performance-cell-box') true;

  @Input() performance: Performance;
  eventSubscription: Subscription;
  @Input() cellPosition: {
    rowIndex: number,
    colIndex: number,
    colID:any
  }
  @Output() changeEvent:EventEmitter<any> = new EventEmitter();
  @Output() countEvent:EventEmitter<{count:number}> = new EventEmitter();
  rawTime;
  @Input() day: Date;

  @Input() set rawTimeData(value) {
    this.rawTime = value;
  }

  get rawTimeData() {
    return this.rawTime;
  }

  actions: {label: string, action: string, icon?: string}[];
  locales: {id: string, code: string, value: string}[];
  defaultLocale: {id: string, code: string, value: string};

  get isDirty(): boolean {
    let isDirty: boolean;
    if(this.performance && this.multiplePerformanceService.basePerformanceFactory) {
      if(this.performance.Localization) {
        if(!isDirty) isDirty = !isEqual(this.multiplePerformanceService.basePerformanceFactory.model.Localization, this.performance.Localization);
      }
    }
    
    return isDirty;
  }

  constructor(
    private multiplePerformanceService: MulitplePerformanceService,
    private tetherService: TetherDialog,
    private elementRef: ElementRef,
    private appSettings: AppSettingsService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private changeDetector: ChangeDetectorRef,
    private notification: NotificationService
  ) { }

  ngOnInit() {   
    this.addPerformance();
  }

  ngOnDestroy() {
    this.actionHandler({action: 'remove'});
    if(this.eventSubscription) this.eventSubscription.unsubscribe();
  }

  ngOnChanges() {

    if(this.rawTimeData && this.performance) {
      
      let parts = this.rawTime.split(':');
      let performanceDate = moment(this.day).set({hour:parseInt(parts[0]),minute:parseInt(parts[1])})
      let isExist = this.multiplePerformanceService.currentEventFactory.getPerformanceByDate(moment(performanceDate, 'DD.MM.YYYY, dddd HH:mm', true).toISOString());
      if(!isExist)
      {
      this.performance.Date = moment(performanceDate, 'DD.MM.YYYY, dddd HH:mm', true).toISOString(); 
      
      }
      else {
        
      }

      
    }

    this.eventSubscription = this.multiplePerformanceService.currentEventFactory$.subscribe(result => {
      
      if(result) {
        result.performances$.subscribe(performSubsresult => {
          if(performSubsresult)
          {
            let notNullDates = performSubsresult.filter(result => result.Date != null);
            let countPerformances = notNullDates.length;
            this.countEvent.emit({count:countPerformances});
          }
          
          if(performSubsresult && performSubsresult.length > 0 && performSubsresult[0].Date != null) {
             return this.changeEvent.emit({isValid:true});
          }
          else {
            return this.changeEvent.emit({isValid:false});
          }
        })
      }
    })
  }

  addPerformance(reactivate?:boolean) {
    if(!this.multiplePerformanceService.currentEventFactory) return;
    this.multiplePerformanceService.currentEventFactory.addPerformance(null, true).then( performance => {
      this.performance = performance;    
      
      if(reactivate) {
        let parts = this.rawTime.split(':');
        let performanceDate = moment(this.day).set({hour:parseInt(parts[0]),minute:parseInt(parts[1])})
        let isExist = this.multiplePerformanceService.currentEventFactory.getPerformanceByDate(moment(performanceDate, 'DD.MM.YYYY, dddd HH:mm', true).toISOString());
        if(!isExist)
        {
        this.performance.Date = moment(performanceDate, 'DD.MM.YYYY, dddd HH:mm', true).toISOString();    
        this.changeEvent.emit({isValid:true});    
        }
        else {
          
        }
      }
    });
  }

  openContextMenu(event:any) {
    this.actions = []; 
    !this.performance ?  this.actions.push({label: 'Aktive Et', action: 'activate', icon: 'visibility'}) : this.actions.push({label: 'İsmini Değiştir', action: 'editName', icon: 'edit'},{label: 'Sil', action: 'remove', icon: 'visibility_off'}) ;
    this.tetherService.context({
			title: "İŞLEMLER",
			data: this.actions
		}, {target: this.elementRef.nativeElement, attachment: "top right", targetAttachment: "top right",}).then( action => this.actionHandler(action)).catch(error => {});
  }

  actionHandler(event:any) {
    switch(event.action) {
      case "editName":
        this.openLocalizationBox("Name", "Performans Adını Değiştirin");
      break;
      case "remove":
        this.multiplePerformanceService.currentEventFactory.removePerformance(this.performance);
        this.performance = null;
      break;

      case "activate":
          this.addPerformance(true);        
      break;
      
    }
  }

  openLocalizationBox(targetField: string, label: string) {
    let component: ComponentRef<LocalizationBoxComponent> = this.resolver.resolveComponentFactory(LocalizationBoxComponent).create(this.injector);
    let localizationBox: LocalizationBoxComponent = component.instance;
    
    localizationBox.title = label;
    localizationBox.target = {name: targetField, input: "textinput"};
    localizationBox.locales = this.getLocalesByField(targetField);
    
    
    this.tetherService.modal(component).then( result => {
      if(result) {
        let localization: {} = {};
        result.forEach( item => localization[item.id]=item.value);
        this.performance.set(targetField, localization, true);
      }
    }).catch( reason => {
      
    });
  }

  getLocalesByField(targetField) {
    let locales: {id: string, code: string, value?: string}[] = JSON.parse(JSON.stringify(this.appSettings.getLocalSettings("locales")));
    if(this.performance && this.performance.Localization && this.performance.Localization[targetField]) {
      locales.forEach( item => {
        if(this.performance.Localization[targetField][item.id]) item.value = this.performance.Localization[targetField][item.id];
      });
    }
    return locales;
  }

}
