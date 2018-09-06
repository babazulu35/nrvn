import { Component, OnInit, Input,HostBinding } from '@angular/core';

@Component({
  selector: 'app-generic-loading-box',
  templateUrl: './generic-loading-box.component.html',
  styleUrls: ['./generic-loading-box.component.scss']
})
export class GenericLoadingBoxComponent implements OnInit {
	@Input() isLoading : boolean = false;
  @HostBinding('class.c-generic-loading-box') true;
  constructor() { }

  ngOnInit() {
  }

}
