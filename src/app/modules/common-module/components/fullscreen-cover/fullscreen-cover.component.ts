import { Component, OnInit, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-fullscreen-cover',
  templateUrl: './fullscreen-cover.component.html',
  styleUrls: ['./fullscreen-cover.component.scss']
})
export class FullscreenCoverComponent implements OnInit {
  @HostBinding('class.c-fullscreen-cover') true;
  
  @Input() backgroundColor: string;
  @Input() backgroundImage: string;

  constructor() { 
    
   }

  ngOnInit() {
  }

}
