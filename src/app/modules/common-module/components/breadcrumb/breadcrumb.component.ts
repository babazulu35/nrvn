import { Component, OnInit, Input, HostBinding, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  @HostBinding('class.c-breadcrumb') true;

  @Input() breadcrumbs: {
      title:string,
      link?:string,
  }[];
  constructor() { }

  ngOnInit() {

  }



}
