import { Observable } from 'rxjs/Observable';
import { Component, OnInit, HostBinding, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { TetherDialog } from '../../modules/tether-dialog/tether-dialog';

import { TypeaheadComponent } from '../typeahead/typeahead.component';

@Component({
  selector: 'app-modal-search-box',
  templateUrl: './modal-search-box.component.html',
  styleUrls: ['./modal-search-box.component.scss']
})
export class ModalSearchBoxComponent implements OnInit {
  @ViewChild(TypeaheadComponent) typeahead: TypeaheadComponent;

  @HostBinding('class.c-modal-search-box') true;

  @HostBinding('class.c-modal-search-box--narrow') isNarrow: boolean;

  @Output() searchEvent: EventEmitter<any> = new EventEmitter();
  @Output() resultEvent: EventEmitter<any> = new EventEmitter();
  @Output() dismissEvent: EventEmitter<any> = new EventEmitter();
  @Output() actionEvent: EventEmitter<Object> = new EventEmitter();

  @Input() title: string;
  @Input() settings: {
    search: {
      placeholder: string,
      feedback: {
        title: string,
        description: string,
        action?: {action: string, label: string, params?: Object},
        icon?: {type: string, name: string}
      }
    }
  }

  @Input() presets: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?: any}[] }[]>;
  @Input() searchResults: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?:any}[] }[]>;

  @Input() isPromising: boolean = false;

  @Input() set theme(value:string) {
    this.isNarrow = value == "narrow";
  }

  get titleCase():string {
    if(this.isNarrow) return this.title.toUpperCase();
    return this.title.length > 0 ? this.title.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1).toLowerCase() )) : '';
  }

  resultEventSubscription:any;
  dismissEventSubscription:any;

  constructor(
    public tetherService: TetherDialog
  ) { }

  ngOnInit() {

  }

  resultHandler(event) {
    this.resultEvent.emit(event);
    this.tetherService.close(event);
  }

  dismissHandler(event) {
    this.dismissEvent.emit(event);
    this.tetherService.dismiss(event); 
  }
}
