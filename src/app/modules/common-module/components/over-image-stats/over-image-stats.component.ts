import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-over-image-stats',
  templateUrl: './over-image-stats.component.html',
  styleUrls: ['./over-image-stats.component.scss'],
})
export class OverImageStatsComponent implements OnInit {

  @Input() data: Array<Object>;

  constructor() { }
  ngOnInit() {
     for(let i = 0;  i < this.data.length; i++){
       if(this.data[i]['value'] == "undefined" || this.data[i]['value'] == null)
       {
         this.data[i]['value'] = 0;
       }
       else
       {
         return this.data[i]['value'];
       }
       
     }
  }

}
