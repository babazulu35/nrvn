import { Component, OnInit, HostBinding, Input, ViewChild, ElementRef } from '@angular/core';

import * as Chart from 'chart.js';

@Component({
  selector: 'app-narrow-report-chart',
  templateUrl: './narrow-report-chart.component.html',
  styleUrls: ['./narrow-report-chart.component.scss']
})
export class NarrowReportChartComponent implements OnInit {
  public dashArray;
  public dashOffset;

  @Input() color?:string;
  
  @Input() percent:any;
  public radius:number = 20;

  @Input() viewType:string;
  @Input() data;
  @Input() label?:string;

  constructor( ) { }

  ngOnInit() {

    this.dashArray = 2 * Math.PI * this.radius;
    this.dashOffset = Math.abs(this.dashArray - (this.dashArray * this.percent / 100)); 

  }



}
