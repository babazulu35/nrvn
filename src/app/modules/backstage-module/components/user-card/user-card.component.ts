import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { User } from './../../../../models/user';
import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent implements OnInit {
  @HostBinding('class.c-user-card') true;

  @Output() actionEvent : EventEmitter<Object> = new EventEmitter<Object>();

  @Input() user: User;
  @Input() info: string;
  @Input() contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  @Input() isActive: boolean;

  constructor(
    public tetherService: TetherDialog
  ) { }

  get fullname(): string { return this.user ? this.user.FirstName + ' ' + this.user.LastName : null; }

  ngOnInit() {
    if (!this.contextMenuData) {
      this.contextMenuData = [{action: 'editUser', label: 'Düzenle', params: {user: this.user}}];
    }
  }

  openContextMenu(event) {
    if (!this.contextMenuData || this.contextMenuData.length === 0) {
      return;
    }

    this.tetherService.context({
			title: 'İŞLEMLER',
			data: this.contextMenuData
		}, {
      target: event.target
    }).then( result => this.actionEvent.emit(result)).catch( reason => {});

  }

}
