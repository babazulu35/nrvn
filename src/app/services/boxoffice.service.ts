import { Event } from './../models/event';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';

@Injectable()
export class BoxofficeService {

  quickSaleEvent: BehaviorSubject<Event> = new BehaviorSubject(null);

  constructor() { }

}
