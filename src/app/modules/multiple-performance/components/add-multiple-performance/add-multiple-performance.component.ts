import { Subscription } from 'rxjs/Subscription';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { MulitplePerformanceService } from './../../mulitple-performance.service';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { Component, OnInit, HostBinding, EventEmitter, Output, ViewChildren, QueryList, AfterViewInit, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import * as moment from 'moment';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-add-multiple-performance',
  templateUrl: './add-multiple-performance.component.html',
  styleUrls: ['./add-multiple-performance.component.scss'],
})
export class AddMultiplePerformanceComponent implements OnInit {
  @HostBinding('class.c-add-multiple-performance') true;

  @Output() changeEvent:EventEmitter<any> = new EventEmitter();
  @Output() countEvent:EventEmitter<any> = new EventEmitter();

  @Input() performanceList;
  constructor( 
    public multiplePerformanceService: MulitplePerformanceService,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef,
    private tether:TetherDialog
  ) { }
  
  row = 0;
  col = 0;
  field = [];
  colField = [];
  columnFieldName = 'Saat';
  groupedData;
  
  fullTime = [];
  minutes = [];
  hour = [];

  dateSelected = [];

  minDate = [];

  isDateEmpty = true;
  
  selectedDate = [];

  ngOnInit() {

    this.field[0] = new Array();
    this.colField[0] = new Array();
    this.minDate[0] = moment();
  }
  addDate(event)
  {
    if(event) {
      this.row = this.row + 1;
      this.field[this.row] = new Array(0); 
      }
  }
  addTime(event) {
    
    if (event) {  
      this.col = this.col + 1;
      this.colField[this.col] = this.generateId();
    }
  }

  dateChangeHandler(event, rowIndex) {
    event == undefined ? this.dateSelected[rowIndex] = false : this.dateSelected[rowIndex] = true;
    this.selectedDate[rowIndex] = event;
    this.minDate[rowIndex + 1] =  moment(event).add('days', 1);
    this.changeDetector.detectChanges();
  }

  resetDataTableArray(rowIndex) {
    this.colField = [];
    this.field.splice(rowIndex,1);
    this.row = 0; 
    this.col = 0;
    this.field[0] = new Array();
    this.colField[0] = new Array();
    
    
  }
  generateId() {
    return this.multiplePerformanceService.generateRandomUniqueID();
  }

  setDataStructure(structure) {
    this.groupedData = structure.reduce((a, b) => {
        a[b.date] = a[b.date] || [];
        a[b.date].push(b);
        return a; 
      },{});
  }

  deleteColumn(colIndex) {
    let founded = this.colField.findIndex(result => result == colIndex);
    this.colField.splice(founded,1);
    this.col = this.colField.length -1;
  }

  deleteConfirmation(event,type,Id) {
    this.tether.confirm({
      title: `Seçtiğiniz alanı silmek istediğinize emin misiniz? `,
      description: `Bu alanı silmek ona bağlı tüm verileri de silecektir!`,
      confirmButton: {label: 'DEVAM'},
      dismissButton: {label: 'İPTAL'}
    }).then(result => {
      switch(type) {
        case "Cell":
          this.deleteColumn(Id);
        break;
        case "Row":
          this.deleteRow(Id);
        break;
      }
      
    }).catch( reason => {
      console.log(reason);
    });
  }

  deleteRow(rowIndex) {

    if(this.field.length -1 == rowIndex || this.dateSelected[rowIndex] == false)
    {
    if(rowIndex == 0 && this.field.length == 1) {
      this.resetDataTableArray(rowIndex);
    }
    else
    {
      this.field.splice(rowIndex,1);
      this.row = this.field.length;    
    }
      this.dateSelected[rowIndex] = false;
  }
  else {
    this.notificationService.add({text:'Lütfen silme işlemini sondan başa doğru yapınız',type:'warning'})
  }

}

  selectChangeHandler(event,selectType:string,colIndex) {
    
    this.fullTime[colIndex] = null;
   
    switch(selectType) {
      case "Hour":
        
        if(event > 23) {
          this.hour[colIndex] = 23;
        }
        else if(event != undefined && event.toString().length == 1) {
          this.hour[colIndex] = "0" + event;
        }
        else
        {
          this.hour[colIndex] = event;
        }
      break;

      case "Minutes":
      if(event > 59) {
        this.minutes[colIndex] = 59;
      }
      else if(event != undefined && event.toString().length == 1)  {
        this.minutes[colIndex] = "0" + event;
      }
      else
      {
        this.minutes[colIndex] = event;
      }      
      break;
    }
    if(this.hour[colIndex] != undefined && this.minutes[colIndex] != undefined) {
        this.fullTime[colIndex] = this.hour[colIndex] + ':' + this.minutes[colIndex];
        this.changeDetector.detectChanges();
    }
    
  }

  isDateSelected(event) {

    this.changeEvent.emit({isValid:event.isValid});
  }

  performanceCount(event) {
    this.countEvent.emit(event);
  }

}
