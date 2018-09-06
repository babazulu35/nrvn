import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { SUser } from '../../../models/suser';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: [UserService],
})
export class UserListComponent implements OnInit, OnDestroy {

  // Template
  isLoading = false;
  isPromising = false;
  noDataInContent = false;
  startScreen = false;
  noDataTitle = 'Yukarıdaki arama çubuğundan arama yapabilirsiniz';
  noDataDescription = 'Arama çubuğundan kullanıcı adına göre arama yapabilirsiniz';

  // Service
  users: any;
  subscription: any;

  @Output() userSelectedForEdit = new EventEmitter<SUser>();

  // Pagination
  currentPage: 1;
  pageSize: 10;
  count: number;
  showPagination = true;
  pageSizes = [{text: '10', value: 10}, {text: '20', value: 20}];

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
  ) {
    this.startScreen = true;
    this.userService.flushFilter();
    this.userService.setCustomEndpoint('GetSUSers');
    this.userService.setQueryParams({pageSize: this.pageSize, page : this.currentPage});
  }

  ngOnInit() {
    this.isLoading = true;

    this.userService.data.subscribe(response => {
      if (response) {
        this.users = response;
        this.noDataInContent = this.users.length === 0;
        this.updateNoDataMessages();
        this.isLoading = false;
        this.isPromising = false;
      }
    }, error => {
      this.isLoading = false;
      this.isPromising = false;
      this.showErrorNotification(error);
    });

    this.subscription = this.userService.queryParamSubject.subscribe(
      params => {
        this.isPromising = true;
        this.updateLocalParams(params);
        this.userService.gotoPage(params);
    });



    this.userService.getCount().subscribe(count => this.count = count, error => console.log(error));
  }

  ngOnDestroy() {
		if (this.subscription) this.subscription.unsubscribe();
  }

  updateNoDataMessages() {
    if (this.startScreen) {
      this.noDataTitle = 'Yukarıdaki arama çubuğundan arama yapabilirsiniz';
      this.noDataDescription = 'Arama çubuğundan kullanıcı adına göre arama yapabilirsiniz';
    } else {
      this.noDataTitle = 'Aramanız ile eşleşen kullanıcı kaydı bulunamadı';
      this.noDataDescription = 'Arama kriterini değiştirerek yeniden deneyebilirsiniz';
    }
  }

  // Functionality
  userSelected(user) {
    this.userSelectedForEdit.emit(user);
  }

  // Helpers
  private getLetters(firstName: string, lastName: string): string {
    let letters = '';
    if (firstName && firstName.length) {
      letters += firstName.charAt(0).toUpperCase();
    }
    if (lastName && lastName.length) {
      letters += lastName.charAt(0).toUpperCase();
    }
    return letters;
  }

  private showErrorNotification(error) {
    if (error && error['ErrorCode'] && error['ErrorCode']) {
      this.notificationService.add({
        type: 'danger',
        text: `${error['ErrorCode']}: ${error['Message']}`
      });
    }
  }

  private updateLocalParams(params: Object = {}) {
		this.currentPage = params['page'] ? params['page'] : 0
		this.pageSize = params['pageSize'] ? params['pageSize'] : 10
  }

  // Searching
  search(event) {
    if (event && event.length && event.length > 2) {
      this.startScreen = false;
      this.userService.setSearch({key: 'UserName', value: event});
    } else {
      this.startScreen = true;
      this.updateNoDataMessages();
    }
	}

  // Sorting
  toggleSortTitle(sort) {
		if (sort) {
			this.userService.setOrder(sort, true);
		} else {
			this.userService.flushOrder();
		}
	}

  // Pagination
	transistPage(page) {
		this.userService.setPage(page);
	}

	changePageSize(pageSize) {
		this.userService.setPageSize(pageSize);
	}

}
