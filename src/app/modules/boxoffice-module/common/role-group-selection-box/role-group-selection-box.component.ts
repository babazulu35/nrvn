import { Component, OnInit, Output, Input, OnDestroy } from '@angular/core';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';
import { Observable } from 'rxjs';
import { GroupService } from '../../../../services/group.service';

class RoleListModel {
  RoleId: string;
  list: {
    id: any;
    title: string;
    icon?: string;
    description?: string;
    params?: any[];
  }
};

@Component({
  selector: 'app-role-group-selection-box',
  templateUrl: './role-group-selection-box.component.html',
  styleUrls: ['./role-group-selection-box.component.scss'],
  providers: [GroupService],
})
export class RoleGroupSelectionBoxComponent implements OnInit, OnDestroy {
  roleSelectSearchResults: Observable<{}> | Observable<RoleListModel[]>;
  isPromising = false;
  selectedGroupName: any;
  subscription: any;
  searchOn = false;
  @Input() existingRoles: string[];

  constructor(
    public tetherDialog: TetherDialog,
    private groupService: GroupService,
  ) { }

  ngOnInit() {
    this.groupService.data.subscribe(response => {
      if (response) {
        let result: {}[] = [];
        response.forEach(item => {
          if (item && item.Name && !this.existingRoles.includes(item.Name)) {
            result.push({
              id: item.Id,
              title: item.Name,
              icon: 'people',
              params: {groupName: item.Name}
            });
          }
        });
        this.roleSelectSearchResults = Observable.of([{
          title: 'EKLENEBİLECEK ROL GRUPLARI',
          list: result
        }]);
        this.isPromising = false;
      }
    }, error => {
      console.log('error');
      this.isPromising = false;
    });

    this.subscription = this.groupService.queryParamSubject.subscribe(
			params => {
        this.groupService.gotoPage(params);
        this.isPromising = true;
			},
			error => console.log(error)
    );
  }

  roleSelectSearchHandler(event) {
    if (event) {
      this.groupService.setSearch({key: 'Name', value: event});
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  submitClickHandler(event?: any) {
    this.tetherDialog.close({groupName: this.selectedGroupName});
  }

	roleSelectResultHandler(event) {
    this.selectedGroupName = event.params.groupName;
  }

	roleSelectActionHandler(event) {
	}

	roleSelectDismissHandler(event) {
  }
}
