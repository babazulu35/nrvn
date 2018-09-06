import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-reports-data-table',
  templateUrl: './reports-data-table.component.html',
  styleUrls: ['./reports-data-table.component.scss']
})
export class ReportsDataTableComponent implements OnInit {
  @Input() viewTable:string;
  
  tableLevel:number = 1 ;

  @Input() get tableShow() {
    return this.viewTable;
  }

  @Input() set tableName(value){
    this.viewTable = value;
  }
  
  tableData:{
    thead:{
      label:string
    }[],
    tbody:{
      tableRow:{
        label:string,
        extraStyle?:string
      }[],
    }[],
  };

  constructor() { }

  ngOnInit() {
    console.log(this.viewTable);
    console.log(this.tableLevel);
  
    /*Mock Table Data*/
    this.tableData ={
      thead:
      [
        {
         label:'Two Door Cinema Club Kon...' 
        },
        {
          label:'Django Django'
        },
        {
          label:'Man With a Plan'
        },
        {
          label: 'HVOB'
        },
        {
          label: 'Astrofella'
        }
        
      ],
      tbody:[
        {
        tableRow:[ { label:''},{ label: ''},{ label: ''},{label: ''},{label: ''}],
        },
      ]
    }
  };

  moveNext() {
    if(this.tableLevel > 0) {
      this.tableLevel + 1;
    }
    else {
      return this.tableLevel;
    }
  }

  movePrev() {

  }

}
