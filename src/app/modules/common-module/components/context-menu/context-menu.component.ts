import { GetIconPipe } from './../../../../pipes/get-icon.pipe';
import { Component, OnInit, HostBinding, HostListener, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { TetherDialog } from '../../modules/tether-dialog/tether-dialog';
import { MockService } from '../../../../services/mock.service';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {
  @HostBinding('class.c-context-menu') true;

  @Output() actionEvent: EventEmitter<Object> = new EventEmitter();

  @Input() title: string;
  @Input() data: {}[];
  @Input() iconSet: string = "context";

  get items(): {}[] {
     return this.data ? this.data.filter( item => item["type"] === undefined ) : null;
  }

  get asideItems(): {}[]  {
    return this.data ? this.data.filter( item => item["type"] === "aside" ) : null;
  }

  clickCount:number;

  constructor(
    public tetherService: TetherDialog,
    private elementRef: ElementRef,
    private mockService:MockService
    ) { 
     //mockService.fillInputs(this, {});
  }

  ngOnInit() {
    if(!this.title) this.title = "İŞLEMLER";
    let iconPipe: GetIconPipe = new GetIconPipe();
    this.data.forEach( item => {
      if(!item['icon']) {
        item['icon'] = iconPipe.transform(item['action'], this.iconSet);
        if(!item['icon']) item['icon'] = iconPipe.transform(item['action'], 'context');
      }
    });
  }

  callAction(item):void {
    try{
      this.tetherService.close(item);
    }catch(error) {
      console.log("tetherService aktif değil");
    }
    this.actionEvent.emit(item);
  }

}
