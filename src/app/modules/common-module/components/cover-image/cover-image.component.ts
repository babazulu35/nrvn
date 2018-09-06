import { Component, OnInit, HostBinding, Input,Type,ViewContainerRef } from '@angular/core';
import { TetherDialog } from '../../modules/tether-dialog/tether-dialog';

@Component({
  selector: 'app-cover-image',
  templateUrl: './cover-image.component.html',
  styleUrls: ['./cover-image.component.scss']
})
export class CoverImageComponent implements OnInit {
  @HostBinding('class.c-cover-image') true;
  @HostBinding('style.background-image')
  get backgroundSource():string {
    return "url(" + this.backgroundImage +")";
  }

  @HostBinding('class.c-cover-image--collapsed')
  @Input() isCollapsed: boolean

  @Input() backgroundImage:string;

  constructor(
    public viewContainer: ViewContainerRef,

  ) { }

  ngOnInit() {
  }


}
