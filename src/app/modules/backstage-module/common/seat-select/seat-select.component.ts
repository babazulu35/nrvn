import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'app-seat-select',
  templateUrl: './seat-select.component.html',
  styleUrls: ['./seat-select.component.scss']
})
export class SeatSelectComponent implements OnInit {
  @HostBinding('class.oc-seat-select') true;
	public performanceId = 3;
	public firmCode = 'MBT';
	public channelCode = 'Web';
  isLoading: boolean = false;
  constructor() { }

  ngOnInit() {
  }
public venueEditorEventHandler(event) {
    switch(event.type) {
      case 1:
        //this.isLoading = false;
      break;
      case 2:
        console.log(event);
      break;
    }
  }
}
