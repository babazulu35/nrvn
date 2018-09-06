import { Component, OnInit, Input, OnChanges, SimpleChanges, ComponentRef, ComponentFactoryResolver, Injector, Inject, ViewChild, ViewChildren, QueryList, ChangeDetectorRef, Output, EventEmitter}
          from '@angular/core';
import { SUser } from '../../../models/suser';
import { AccountService } from '../../../services/account.service';
import { TetherDialog } from '../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { FirmService } from '../../../services/firm.service';
import { Firm } from '../../../models/firm';
import { EntityService } from '../../../services/entity.service';
import { PromoterSelectionBoxComponent } from '../../../modules/boxoffice-module/common/promoter-selection-box/promoter-selection-box.component';
import { UserPromoterService } from '../../../services/user-promoter.service';
import { RoleGroupSelectionBoxComponent } from '../../../modules/boxoffice-module/common/role-group-selection-box/role-group-selection-box.component';
import { NotificationService } from '../../../services/notification.service';
import { cloneDeep } from 'lodash';
import { PhoneInputComponent } from '../../../modules/common-module/components/phone-input/phone-input.component';
import { TextInputComponent } from '../../../modules/base-module/components/text-input/text-input.component';
import { GroupService } from '../../../services/group.service';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  entryComponents: [PromoterSelectionBoxComponent, RoleGroupSelectionBoxComponent],
  providers: [
    AccountService,
    EntityService,
    UserPromoterService,
    GroupService,
  ],
})
export class UserEditComponent implements OnInit, OnChanges {

  @Input() selectedUser: SUser;
  @Output() selectedUserChanged: EventEmitter<any> = new EventEmitter();
  listUser: SUser;
  user: SUser;
  isEditMode = false;
  firms: any[] = [];
  listFirms: any[] = [];
  isLoading = false;
  @ViewChild('phone') phone: PhoneInputComponent;
  @ViewChildren(TextInputComponent) textInputs: QueryList<TextInputComponent>;
  
  pageSizes: Array<Object> = [{text: '5', value: 5}, {text: '10', value: 10}];
  pageSize = 5;
  currentPage = 1;
  subscription: any;
  count = 0;
  firmsToShow = [];

  essentialRoles: any;

  validation: {
		UserName: { isValid: any},
		FirstName: { isValid: any},
    LastName: { isValid: any},
    Email: { isValid: any },
    HasError: { isValid: any},
    PhoneNumber: { isValid: any },
    Password: { isValid: any },
    Roles: { isValid: any }
	} = {
		UserName: {
			isValid(): any {
        return this.user && this.user.isValid('UserName', false) && this.user.UserName.trim() !== '';
			}
		},
		FirstName: {
			isValid(): any {
				return this.user && this.user.isValid('FirstName', false) && this.user.FirstName.trim() !== '';
			}
    },
		LastName: {
			isValid(): any {
        return this.user && this.user.isValid('LastName', false) && this.user.LastName.trim() !== '';
			}
    },
    Email: {
      isValid(): any {
        return this.user && this.user.isValid('Email', false) && this.user.Email.trim() !== '';
      }
    },
    Roles: {
      isValid(): any {
        return this.user && this.user.Roles && this.user.Roles.length === 1;
      }
    },
    HasError: {
      isValid(): any {
        return this.textInputs ? !this.textInputs.toArray().some( item => {return item.hasError}) : true;
      }
    },
    PhoneNumber: {
      isValid(): any {
        return this.user && ((this.phone && this.phone.phoneInput) ? this.phone.phoneInput.isValid : true)
                         && this.user.isValid('PhoneNumber', false)
                         && !isNaN(Number(this.user.PhoneNumber));
      }
    },
    Password: {
      isValid(): any {
        return this.isEditMode ? true : this.user && this.user.isValid('Password', false) && this.user.Password.length >= 6;
      }
    }
  };

	get isValid(): boolean {
    if (this.user && this.validation && this.validation.UserName.isValid.call(this)
                  && this.validation.FirstName.isValid.call(this)
                  && this.validation.LastName.isValid.call(this)
                  && this.validation.Email.isValid.call(this)
                  && this.validation.HasError.isValid.call(this)
                  && this.validation.PhoneNumber.isValid.call(this)
                  && this.validation.Roles.isValid.call(this)
                  && this.validation.Password.isValid.call(this)) {
                    return true;
		} else {
			return false;
		}
	};

  constructor(
    private accountService: AccountService,
    public tetherDialog: TetherDialog,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private entityService: EntityService,
    private userPromoterService: UserPromoterService,
    private groupService: GroupService,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef,
    private roleService: RoleService,

  ) {
    this.entityService.setCustomEndpoint('GetAll');
    this.entityService.setQueryParams({page: this.currentPage, pageSize: this.pageSize});
  }

  ngOnInit() {
    this.isLoading = true;
    this.roleService.fromEntity('Role')
                    .whereRaw("Type eq cast('1', Nirvana.Shared.Enums.RoleType)")
                    .and('IsActive', '=', true)
                    .take(5)
                    .page(1)
                    .executeQuery();
    this.roleService.data.skip(1).first().subscribe(response => {
      this.essentialRoles = response;
      this.essentialRoles.forEach(element => {
        element.isChecked = false;
        this.isLoading = false;
      });
    }, error => {
      this.isLoading = false;
      console.log('Data tipindeki roller alınamadı. Error: ' + error);
    })

    this.subscription = this.entityService.queryParamSubject.subscribe(
      params => {
        this.updateLocalParams(params);
        let query = this.entityService.fromEntity('SUserPromoter')
                                      .expand(['Promoter', 'Localization'])
                                      .take(1000).page(1);

        if (params['filter'] && params['filter'].length > 0 && params['filter'][0].filter) {
          query.whereRaw(params['filter'][0].filter);
          query.executeQuery();
        }
    });

    this.entityService.data.subscribe(entities => {
      this.firms = cloneDeep(entities);
      this.resetFirmsToShow();
      this.listFirms = entities;
      this.changeDetector.detectChanges();
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      console.log(error)
    });

    this.entityService.getCount().subscribe(
			count => this.count = count,
			error => console.log(error)
		);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedUser.currentValue) {
      this.user = cloneDeep(changes.selectedUser.currentValue);
      if (this.user.Roles && this.user.Roles.length > 0) this.user.Roles = [this.user.Roles[0]];
      this.listUser = changes.selectedUser.currentValue;
      this.isEditMode = true;
      this.isLoading = true;
      this.setCheckboxes();
      this.entityService.setFilter({filter: `UserId eq ${this.user.Id}`});
    } else {
      this.clearForm();
    }
  }

  private setCheckboxes() {
    if (this.essentialRoles) {
      if (this.user.Roles && this.user.Roles.length) {
        this.essentialRoles.forEach(element => {
          element.isChecked = this.user.Roles.includes(element.Name);
        });
      } else {
        this.essentialRoles.forEach(element => {
          element.isChecked = false;
        });
      }
    }
  }

  private clearForm() {
    this.user = new SUser({
      UserName: null,
      Password: null,
      FirstName: null,
      LastName: null,
      Images: null,
      Email: null,
      Groups: [],
      PhoneNumber: null,
      PromoterList: [],
      Roles: []
    });
    this.setCheckboxes();
    this.listUser = null;
    this.firms = [];
    this.firmsToShow = [];
    this.isEditMode = false;
    this.phone.value = null;
    this.changeDetector.detectChanges();
    this.phone.countryCode = 'TR';
    if (this.essentialRoles) this.essentialRoles.forEach(element => {element.isChecked = false;});
  }

  checkAction (e, roleName) {
    if (!roleName) return;
    this.user.Roles = [roleName];
    this.essentialRoles.forEach(element => {
      if (element.Name === roleName) {
        element.isChecked = true;
      } else {
        element.isChecked = false;
      }
    });
  }

  inputChangeHandler(e, type) {
    if (this.isEditMode && !this.user) return;

    if (type === 'Images') {
      this.user.Images = e.data;
    }  else {
      this.user[type] = e;
    }

    this.changeDetector.detectChanges();
  }

  updateOrSaveUser(event?: any) {
    this.isLoading = true;
    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.saveUser();
    }
  }

  handleError(error) {
    this.isLoading = false;
    if (error && error.Type === 2) {
      this.notificationService.add({
        type: 'danger',
        text: `${error['ErrorCode']}: ${error['Message']}`
    });
    } else {
      this.notificationService.add({
        type: 'danger',
        text: `İşlem yapılırken bir sorun oluştu.`
      });
    }
  }

  updateUser() {
    this.accountService.updateUser(this.user).subscribe(response => {
      for (let k in this.user) {
        if (k !== 'Groups' && k !== 'Roles') {
          this.listUser[k] = this.user[k];
        }
      }
      this.updateUserPromoters();
    }, error => this.handleError(error));
  }

  saveUser() {
    this.user.PromoterList = this.firms.map(f => f.PromoterId);
    this.accountService.registerUser(this.user).subscribe(response => {
      if (response && response > 0 ) this.user.Id = response;
      this.updateEssentialRoles();
    }, error => this.handleError(error));
  }

  updateRoles() {
    let rolesToAdd = [];
    if (this.isEditMode) {
      if (this.user.Groups && this.user.Groups.length) {
        rolesToAdd = this.user.Groups.filter(r => {
          if (this.listUser.Groups && this.listUser.Groups.includes(r)) {
            return false;
          } else {
            return true;
          }
        })
      }
    } else {
      rolesToAdd = this.user.Groups;
    }

    if (rolesToAdd.length > 0) {
      for (let i = 0; i < rolesToAdd.length; i++) {
        this.accountService.addUserToGroup(this.user.UserName, rolesToAdd[i]).subscribe(response => {
          if (this.listUser) {
            if (!this.listUser.Groups) this.listUser.Groups = [];
            this.listUser.Groups.push(rolesToAdd[i]);
          }
          if (i === rolesToAdd.length - 1) {
            console.log('Roller başarıyla eklendi.');
            this.deleteRoles();
          }
        }, error => {
          this.handleError(error);
        });
      }
    } else {
      this.deleteRoles();
    }
  }

  deleteRoles() {
    let successMessage = 'Kullanıcı başarıyla güncellendi.';
    let rolesToDelete = [];
    if (this.listUser) {
      if (this.listUser.Groups && this.listUser.Groups.length) {
        rolesToDelete = this.listUser.Groups.filter(r => {
          if (this.user.Groups.includes(r)) {
            return false;
          } else {
            return true;
          }
        });
      }
    } else {
      successMessage = 'Kullanıcı başarıyla oluşturuldu.'
    }

    if (rolesToDelete.length > 0) {
      for (let i = 0; i < rolesToDelete.length; i++) {
        this.accountService.removeUserFromGroup(this.user.UserName, rolesToDelete[i]).subscribe(response => {
          let rIndex = this.listUser.Groups.findIndex(r => r === rolesToDelete[i]);
          if (rIndex > -1) {
            this.listUser.Groups.splice(rIndex, 1);
          }
          if (i === rolesToDelete.length - 1) {
            console.log('Roller başarıyla silindi.');
            this.notificationService.add({type: 'success', text: successMessage});
            this.discard();
            this.isLoading = false;
          }
        }, error => {
          this.handleError(error);
        });
      }
    } else {
      this.notificationService.add({type: 'success', text: successMessage});
      this.discard();
      this.isLoading = false;
    }
  }

  updateEssentialRoles() {
    let roleToAdd;
    if (this.isEditMode) {
      if (this.user.Roles && this.user.Roles.length) {
        if (!(this.listUser && this.listUser.Roles && this.listUser.Roles.length && this.listUser.Roles.includes(this.user.Roles[0]))) {
          roleToAdd = this.user.Roles[0];
        }
      }
    } else {
      roleToAdd = this.user.Roles && this.user.Roles.length ? this.user.Roles[0] : null;
    }

    if (roleToAdd) {
        this.accountService.addRoleToUser(this.user.UserName, roleToAdd).subscribe(response => {
          if (this.listUser) {
            if (!this.listUser.Roles) this.listUser.Roles = [];
            this.listUser.Roles.push(roleToAdd);
          }
          console.log('Basit rol başarıyla eklendi.');
          this.deleteEssentialRoles();
        }, error => {
          this.handleError(error);
        });
    } else {
      this.deleteEssentialRoles();
    }
  }

  deleteEssentialRoles() {
    let rolesToDelete = [];
    if (this.listUser) {
      if (this.listUser.Roles && this.listUser.Roles.length) {
        rolesToDelete = this.listUser.Roles.filter(r => {
          if (this.user.Roles.includes(r)) {
            return false;
          } else {
            return true;
          }
        });
      }
    } 

    if (rolesToDelete.length > 0) {
      for (let i = 0; i < rolesToDelete.length; i++) {
        this.accountService.removeRoleFromUser(this.user.UserName, rolesToDelete[i]).subscribe(response => {
          let rIndex = this.listUser.Roles.findIndex(r => r === rolesToDelete[i]);
          if (rIndex > -1) {
            this.listUser.Roles.splice(rIndex, 1);
          }
          if (i === rolesToDelete.length - 1) {
            console.log('Basit roller başarıyla silindi.');
            this.updateRoles();
            this.isLoading = false;
          }
        }, error => {
          this.handleError(error);
        });
      }
    } else {
      this.updateRoles();
      this.isLoading = false;
    }
  }

  updateUserPromoters() {
    let firmsToAdd = [];
    if (this.firms && this.firms.length) {
      firmsToAdd = this.firms.filter(f => {
        if (this.listFirms.some(l => l.PromoterId === f.PromoterId)) {
          return false;
        } else {
          return true;
        }
      })
    }

    if (firmsToAdd.length > 0) {
      let payLoad = [];
      firmsToAdd.forEach(i => payLoad.push({'UserId': this.user.Id, 'PromoterId': i.PromoterId, 'IsDefault': false}));
      this.userPromoterService.setCustomEndpoint('PostAll');
      this.userPromoterService.save(payLoad).subscribe(response => {
        console.log('Firmalar başarıyla eklendi.');
        this.deleteUserPromoters();
      }, error => this.handleError(error));
    } else {
      this.deleteUserPromoters();
    }
  }

  deleteUserPromoters() {
    let promotersToDelete = [];
    if (this.listFirms && this.listFirms.length) {
        promotersToDelete = this.listFirms.filter(f => {
        if (this.firms.some(l => l.PromoterId === f.PromoterId)) {
          return false;
        } else {
          return true;
        }
      });
    }

    if (promotersToDelete.length > 0) {
      for (let i = 0; i < promotersToDelete.length; i++) {
        this.userPromoterService.flushCustomEndpoint();
        this.userPromoterService.delete(`${this.user.Id}/${promotersToDelete[i].PromoterId}`).subscribe(response => {
          if (i === promotersToDelete.length - 1) {
            console.log('Firmalar başarıyla silindi.');
            this.updateEssentialRoles();
          }
        }, error => {
          this.handleError(error);
        });
      }
    } else {
      this.updateEssentialRoles();
    }
  }

  openFirmSelectionBox(e) {
      let component: ComponentRef<PromoterSelectionBoxComponent>;
      component = this.resolver.resolveComponentFactory(PromoterSelectionBoxComponent).create(this.injector);
      component.instance.existingPromoters = this.firms;

      this.tetherDialog.modal(component, { escapeKeyIsActive: true, dialog: { style: { maxWidth: '600px', width: '80vw', height: '50vh' }}})
                       .then(result => {
                         if (result && result.promoter) {
                           let firmIndex = this.firms.findIndex(f => f.PromoterId === result.promoter.PromoterId);
                           if (firmIndex > -1) {
                             console.log('Bu firma zaten tanımlı.')
                           } else {
                            this.firms.push({
                              IsDefault: false,
                              Promoter: result.promoter,
                              PromoterId: result.promoter.Id,
                              User: null,
                              UserId: this.user.Id
                            });
                            this.resetFirmsToShow();
                           }
                         }
                        })
                       .catch(reason => console.log('Firm Selection Modal dismiss reason: ', reason));
  }

  deleteFirm(firm) {
    let firmIndex = this.firms.findIndex(f => f.PromoterId === firm.PromoterId);
    if (firmIndex >= 0) {
      this.firms.splice(firmIndex, 1);
    }
    this.resetFirmsToShow();
  }

  resetFirmsToShow() {
    this.firmsToShow = this.firms.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    if (this.firms && this.firms.length > 0 && this.firmsToShow.length === 0 && this.currentPage > 0) {
      this.currentPage--;
      this.firmsToShow = this.firms.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    }
  }

  openRoleGroupSelectionBox(e) {
    if (!this.user.Groups) this.user.Groups = [];
    let component: ComponentRef<RoleGroupSelectionBoxComponent>;
      component = this.resolver.resolveComponentFactory(RoleGroupSelectionBoxComponent).create(this.injector);
      component.instance.existingRoles = this.user.Groups;

      this.tetherDialog.modal(component, { escapeKeyIsActive: true, dialog: { style: { maxWidth: '600px', width: '80vw', height: '50vh' }}})
                       .then(result => {
                         if (result && result.groupName) {
                            if (this.user.Groups.includes(result.groupName)) {
                              this.notificationService.add({
                                type: 'warning', text: 'Kullanıcı bu rol grubundan tanımlıdır. Baika bir rol grubu seçiniz.'
                              });
                            } else {
                              this.user.Groups.push(result.groupName);
                            }
                         }
                        })
                       .catch(reason => console.log('Refund Reason Modal dismiss reason: ', reason));
  }

  deleteRole(groupName) {
    this.tetherDialog.confirm({
			title: 'Rol Grubundan Çıkar',
			description: 'Kullanıcıyı ' + groupName + ' rol grubundan çıkarmak istediğinizden emin misiniz?',
			confirmButton: { label: 'EVET', theme: 'danger' },
		}).then(result => {
			let roleIndex = this.user.Groups.findIndex(f => f === groupName);
      if (roleIndex >= 0) {
        this.user.Groups.splice(roleIndex, 1);
      }
		}).catch(reason => {
			console.log('Delete Role Modal dismiss reason: ', reason)
		});
  }

  transistPage(page) {
    this.currentPage = page;
    this.resetFirmsToShow();
	}

	changePageSize(pageSize) {
    this.pageSize = pageSize;
    this.resetFirmsToShow();
  }

  updateLocalParams(params: Object = {}) {
		this.currentPage = params['page'] ? params['page'] : 1
		this.pageSize = params['pageSize'] ? params['pageSize'] : 5
	}

  discard(event?: any) {
    this.clearForm();
    this.selectedUserChanged.emit();
  }
}
