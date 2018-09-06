import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { Component, OnInit, HostBinding, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-expandable-block',
  templateUrl: './expandable-block.component.html',
  styleUrls: ['./expandable-block.component.scss']
})
export class ExpandableBlockComponent implements OnInit {
  @HostBinding('class.c-expandable-block') true;

  @Output() actionEvent : EventEmitter<Object> = new EventEmitter<Object>();

  @HostBinding('class.c-expandable-block--expanded') 
  @Input() isExpanded: boolean;

  @HostBinding('class.c-expandable-block--hasSubTitle') get hasSubTitle():boolean { return this.subTitle && this.subTitle.length > 0 };

  @Input() leftIcon: string = 'menu';
  @Input() isDraggable: boolean;
  @Input() title: string;
  @Input() subTitle: string;
  @Input() contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];

  constructor(
    public tetherService: TetherDialog,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if(this.isDraggable) this.leftIcon = "menu";
  }

  public collapse() {
    this.isExpanded = false;
    this.changeDetector.detectChanges();
  }

  public expand() {
    this.isExpanded = true;
    this.changeDetector.detectChanges();
  }

  toggleExpand(e:any=null) {
    this.isExpanded = !this.isExpanded;
    this.changeDetector.detectChanges();
  }

  openContextMenu(event) {
    if(!this.contextMenuData || this.contextMenuData.length == 0) return;

    this.tetherService.context({
			title: "İŞLEMLER",
			data: this.contextMenuData
		}, {
      target: event.target
    }).then( result => this.actionEvent.emit(result)).catch( reason => {});

  }

}
