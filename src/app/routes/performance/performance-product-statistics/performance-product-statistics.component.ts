import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'app-performance-product-statistics',
  templateUrl: './performance-product-statistics.component.html',
  styleUrls: ['./performance-product-statistics.component.scss']
})
export class PerformanceProductStatisticsComponent implements OnInit {
  @HostBinding('class.or-performance-statistics') true;

  constructor() { }

  ngOnInit() {
  }

}
