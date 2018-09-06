import { Component, OnInit, EventEmitter, HostBinding, Output, Input, ElementRef } from '@angular/core';
import { TetherDialog } from "../../modules/tether-dialog/tether-dialog";
import { MockService } from "../../../../services/mock.service";
import { GetIconPipe } from "../../../../pipes/get-icon.pipe";

@Component({
  selector: 'app-context-menu-filter',
  templateUrl: './context-menu-filter.component.html',
  styleUrls: ['./context-menu-filter.component.scss']
})
export class ContextMenuFilterComponent implements OnInit {
  @HostBinding('class.c-context-menu-filter') true;

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
  ) { }

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
