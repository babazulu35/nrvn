import { Router } from '@angular/router';
import { NotificationService } from './../../../../services/notification.service';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { AddTerminalUserBoxComponent } from './../../common/add-terminal-user-box/add-terminal-user-box.component';
import { TerminalUser } from './../../../../models/terminal-user';
import { Terminal } from './../../../../models/terminal';
import { Component, OnInit, HostBinding, Input, ComponentRef, ComponentFactoryResolver, Injector } from '@angular/core';

import * as moment from 'moment';

@Component({
  selector: 'app-terminal-user-list',
  templateUrl: './terminal-user-list.component.html',
  styleUrls: ['./terminal-user-list.component.scss'],
  entryComponents: [AddTerminalUserBoxComponent]
})
export class TerminalUserListComponent implements OnInit {
  @HostBinding('class.c-terminal-user-list') true;

  @HostBinding('class.c-terminal-user-list--empty')
  get isEmpty(): boolean {
    return (this.terminalUsers && this.terminalUsers.length > 0) ? false : true;
  };

  @Input() terminalUsers: TerminalUser[];
  @Input() terminalId: number;
  @Input() hasPreviousTerminalUsers: boolean;

  addTerminalUserBox: AddTerminalUserBoxComponent;

  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit() {

  }

  formatDate(targetDate: any) {
    let date = moment(targetDate);
    if (date.isValid()) {
      return date.format('DD.MM.YYYY HH:mm');
    } else {
      return '-';
    }
  }

  openAddTerminalUserBox(targetTerminalUser: any = null) {
    let component:ComponentRef<AddTerminalUserBoxComponent> = this.resolver.resolveComponentFactory(AddTerminalUserBoxComponent).create(this.injector);
    this.addTerminalUserBox = component.instance;
    this.addTerminalUserBox.terminalUser = targetTerminalUser;

    this.tether.modal(component, {
      escapeKeyIsActive: true
    }).then(result => {
      let existTerminalUser:TerminalUser = this.terminalUsers ? this.terminalUsers.find( item => item.User.Id == result.terminalUser.User.Id) : null;
      if(existTerminalUser) {
        //this.notificationService.add({type: 'danger', text:  existTerminalUser.User.FirstName + ' ' + existTerminalUser.User.LastName + " kullanıcısı daha önce eklenmiş!"});
        this.terminalUsers[this.terminalUsers.indexOf(existTerminalUser)] = result.terminalUser;
      }else{
        if(result.terminalUser) {
          if(!this.terminalUsers) this.terminalUsers = [];
          this.terminalUsers.push(result.terminalUser);
        }
      }
    }).catch( reason => {
      console.log(reason);
    });
  }

  userCardActionHandler(event) {
    let i;
    if (event.params.user) {
      i = this.terminalUsers.findIndex(x => x.User.Id === event.params.user.Id);
    }
    if (i === -1) { return; }

    switch (event.action) {
      case 'editUser':
        this.openAddTerminalUserBox(this.terminalUsers[i]);
        break;
      case 'activateUser':
        this.terminalUsers[i].IsActive = true;
        break;
      case 'deactivateUser':
        this.terminalUsers[i].IsActive = false;
      break;
    }
  }

  gotoPreviousUsers() {
    this.tether.confirm({
      title: "Devam etmek istiyor musunuz?",
      description: "Kaydedilmemiş değişiklikleriniz kaybolacaktır.",
      confirmButton: {label: 'DEVAM'},
      dismissButton: {label: 'İPTAL'}
    }).then(result => {
      this.router.navigate(['terminal', this.terminalId, 'users']);
    }).catch( reason => {
      console.log(reason);
    });
  }

  getContextMenuForUser(terminal) {
    let contextMenuData = [{action: 'editUser', label: 'Düzenle', params: {user: terminal.User}}];
    if (terminal.IsActive) {
      contextMenuData.push({action: 'deactivateUser', label: 'Pasifleştir', params: {user: terminal.User}});
    } else {
      contextMenuData.push({action: 'activateUser', label: 'Aktifleştir', params: {user: terminal.User}});
    }
    return contextMenuData;
  }

}
