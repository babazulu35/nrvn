import { Component, OnInit } from '@angular/core';
import { HeaderTitleService } from '../../services/header-title.service';
import { SUser } from '../../models/suser';
import { RoleService } from '../../services/role.service';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  providers: [RoleService]
})
export class UsersComponent implements OnInit {

  selectedUser: SUser;

  constructor(
    private headerTitleService: HeaderTitleService,
  ) { }

  ngOnInit() {
    this.headerTitleService.setTitle('Kullanıcılar');
    this.headerTitleService.setLink('/users');
  }

  showUserInfo(user: SUser) {
    this.selectedUser = user;
  }

  discard() {
    this.selectedUser = null;
  }

}
