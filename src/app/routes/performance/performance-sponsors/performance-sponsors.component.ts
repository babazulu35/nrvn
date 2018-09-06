import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'app-performance-sponsors',
  templateUrl: './performance-sponsors.component.html',
  styleUrls: ['./performance-sponsors.component.scss']
})
export class PerformanceSponsorsComponent implements OnInit {
  @HostBinding('class.or-performance-sponsors') true;

  constructor() { }

  ngOnInit() {
  }

}
