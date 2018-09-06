
import { Component, OnInit, Input, ElementRef, ViewChild, Output, EventEmitter, HostBinding, AfterViewInit } from '@angular/core';


import * as Chart from "chart.js";

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit,AfterViewInit {
  @HostBinding('class.c-line-chart') true;
  
  @ViewChild("line") line:ElementRef;
 
  @Input() type: string;
  @Input() data: any;
  @Input() options: any;  

  @Output() resultEvent = new EventEmitter<Object>();

  public currentState:number = 1;
  public chartLabel:Array<String>;
  @Input() dataSets:{currentState:number,label:any[] , datas: {filterData:string,borderColor:string, data:any[] }[]}[];
  public defaults:{pointColor:string,pointStrokeColor:string,pointBackgroundColor:string,pointHoverBackgroundColor:string,tension:number,spanGaps:boolean,capBezierPoints:boolean,fill:boolean,data?:any[],borderColor?:string,backgroundColor:string};
  public showNextArrow:boolean;
  public showPrevArrow:boolean;
  public element:CanvasRenderingContext2D;
  public chartData = [];
  public lineChart;



  constructor() {
      
   }
  
  ngOnInit() {
    

   
  }
  ngAfterViewInit() {
    this.element = this.line.nativeElement.getContext("2d");
    this.currentState == 1 ? this.showPrevArrow = false : this.showPrevArrow = true;
    this.currentState == 1 || this.currentState > 1 ? this.showNextArrow = true : this.showNextArrow = false;
    

    let firstState =  this.dataSets.findIndex(result => result.currentState == 1);
    this.initializeChart(this.chartOptions(),this.dataSets[firstState],this.element);
    this.resultEvent.emit({currentState:this.currentState});      
  }
  ngOnDestroy() {
      this.lineChart.destroy();
  }

  chartLabelFix(label:any,type:string):any[] {
      // Ux için Yapıldı
      if(type=="string")
      {
          // Add empty space to last element
          label.splice(label.length,0,"");
          // Add empty space to first element
          label.splice(0,0,"");
          return label;
      }
      else if ( type=="number") {
          label.splice(label.length,0,null);
          // Add empty space to first element
          label.splice(0,0,null);
          return label;        
      }
  }

  chartOptions() {
    return this.options = {       
            legend:{
                display:false
            }, 
            title:{
                display:false,
            },
            animation: {
                duration:1,
                onComplete:function() {
                    console.log("Animation Completed");
                    var controller = this.chart.controller;
                    var chart = controller.chart;
                    var xAxis = controller.scales['x-axis-0'];
                
                    xAxis.margins.top = 100;
                    xAxis.paddingTop = 50;
                    xAxis.height = 130;
                    xAxis.ticks.forEach(function(value,index) {
                        console.log(xAxis)
                    });
                }
            },                       
            responsive: true,
            maintainAspectRatio: true,
            scales: {               
                yAxes: [{
                    gridLines:{
                        drawBorder:true,
                        display:true,
                        offsetGridLines:true,
                    } ,                  
                    ticks: {
                        max: 1000,
                        min: 0,
                        stepSize: 250,
                        beginAtZero:false,              
                    }
                }],
                xAxes:[{
                    ticks: {
                        beginAtZero:false,          
                    }                  
                }], 
          
            }
       
    }
  }
  

  chartDefaults(borderColor,data){
    return this.defaults = {
        pointColor: 'rgba(255,255,255,1)',
        pointStrokeColor: 'rgba(255,255,255,1)',
        pointBackgroundColor: 'rgba(255,255,255,1)',
        pointHoverBackgroundColor: 'rgba(255,255,255,1)',
        tension:0,
        spanGaps:true,
        capBezierPoints:false,
        fill:false,
        borderColor: borderColor,
        data: data,
        backgroundColor: 'rgba(54, 162, 235,0.5)',
    }
  }
  
  initializeChart(options,dataset,element){
  
   for(let i = 0; i < dataset['datas'].length; i++)
   {
    this.chartData.push(this.chartDefaults(dataset.datas[i].borderColor,dataset.datas[i].data));
   } 
    this.lineChart = new Chart(element,{
        type:'line',
        data:{
            labels:dataset.label,
            datasets: this.chartData
        },
        options:options
    });

  }

  nextDataSet(currentPosition) {
    this.chartData = []; 
    this.currentState = currentPosition + 1;   
    if(this.dataSets.length < this.currentState || this.dataSets.length == this.currentState )
    {
        this.showNextArrow = false;
        this.showPrevArrow = true;
        let nextState =  this.dataSets.findIndex(result => result.currentState == this.currentState);
        this.resultEvent.emit({currentState:this.currentState});
        this.initializeChart(this.chartOptions(),this.dataSets[nextState],this.element);        
    }
    else
    {
        let nextState =  this.dataSets.findIndex(result => result.currentState == this.currentState);
        this.resultEvent.emit({currentState:this.currentState});
        this.initializeChart(this.chartOptions(),this.dataSets[nextState],this.element); 
               
    }
      
  }

  prevDataSet(currentPosition) {
    this.chartData = [];
    this.currentState = currentPosition - 1; 
    if(this.currentState <= 1) {
        this.showPrevArrow = false;
        this.showNextArrow = true;
        let prevState =  this.dataSets.findIndex(result => result.currentState == 1);
        this.resultEvent.emit({currentState:this.currentState});
        this.initializeChart(this.chartOptions(),this.dataSets[prevState],this.element);          
    }
    else {
        this.showPrevArrow = true;
        let prevState =  this.dataSets.findIndex(result => result.currentState == this.currentState);
        this.resultEvent.emit({currentState:this.currentState});
        this.initializeChart(this.chartOptions(),this.dataSets[prevState],this.element); 
            
    }
  }

}
 