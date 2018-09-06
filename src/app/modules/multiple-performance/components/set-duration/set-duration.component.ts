import { Component, OnInit, HostBinding, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-set-duration',
  templateUrl: './set-duration.component.html',
  styleUrls: ['./set-duration.component.scss']
})
export class SetDurationComponent implements OnInit {
  
  @HostBinding('class.c-set-duration') true;
  
  @Output() changeEvent:EventEmitter<any> = new EventEmitter();

  @Input() durationValue;
  @Input() placeholder:string = '';
  @Input() required: boolean = false;

  constructor() { }

  ngOnInit() {
  
  }

  inputEventHandler(event) {
    this.changeEvent.emit({duration:event});
  }



}
