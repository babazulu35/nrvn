import { Component, OnInit, Input, OnChanges, HostBinding } from '@angular/core';
import {EventStatus} from '../../../../models/event-status.enum';

@Component({
  selector: 'app-status-tag',
  templateUrl: './status-tag.component.html',
  styleUrls: ['./status-tag.component.scss']
})
export class StatusTagComponent implements OnInit {

  constructor() { }

  eventStatus = EventStatus;

  @HostBinding('class.c-status-tag') true;

  @Input() fontColor;
  @Input() backColor;
  @Input() label: String;
  @Input() set status(status){
    
    switch(status){
      case this.eventStatus.Cancelled:
        this.label = "İPTAL EDİLDİ"
        this.fontColor = "white"
        this.backColor = "#ec4e48"
      break;
      case this.eventStatus.Closed:
        this.label = "KAPATILDI"
        this.fontColor = "white"
        this.backColor = "#ec4e48"
      break;
      case this.eventStatus.ConfigurationReady:
        this.label = "YAPILANDIRMA HAZIR"
        this.fontColor = "black"
        this.backColor = "#ffcc00"
      break;
      case this.eventStatus.Draft:
        this.label = "TASLAK"
        this.fontColor = "black"
        this.backColor = "#f7f7f7"
      break;
      case this.eventStatus.OnSale:
        this.label = "SATIŞTA"
        this.fontColor = "white"
        this.backColor = "#7cb342"
      break;
      case this.eventStatus.Published:
        this.label = "YAYINDA"
        this.fontColor = "white"
        this.backColor = "#7cb342"
      break;
      case this.eventStatus.SoldOut:
        this.label = "SATILDI"
        this.fontColor = "white"
        this.backColor = "#ec4e48"
      break;
      case this.eventStatus.Suspended:
        this.label = "BEKLEMEDE"
        this.fontColor = "black"
        this.backColor = "#ffcc00"
      break;
      case this.eventStatus.Unknown:
        this.label = "BİLİNMİYOR"
        this.fontColor = "black"
        this.backColor = "#f7f7f7"
      break;
    }
  }

  ngOnInit() {
  }

}
