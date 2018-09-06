import { Component, OnInit, ComponentRef, ComponentFactoryResolver, Injector, OnDestroy, ViewChild } from '@angular/core';
import { HeaderTitleService } from '../../../services/header-title.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OtpValidationBoxComponent } from '../../../modules/boxoffice-module/common/otp-validation-box/otp-validation-box.component';
import { TetherDialog } from '../../../modules/common-module/modules/tether-dialog/tether-dialog';
import { NotificationService } from '../../../services/notification.service';
import { EntityService } from '../../../services/entity.service';
import { TransactionServiceService } from '../../../services/transaction-service.service';
import { CrmMemberService } from '../../../services/crm-member.service';
import { AppSettingsService } from '../../../services/app-settings.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { Response } from '@angular/http/src/static_response';
import { TextInputComponent } from '../../../modules/base-module/components/text-input/text-input.component';
import { SelectboxComponent } from '../../../modules/base-module/components/selectbox/selectbox.component';
import { PhoneInputComponent } from '../../../modules/common-module/components/phone-input/phone-input.component';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.scss'],
  entryComponents: [OtpValidationBoxComponent],
  providers: [
    EntityService,
    TransactionServiceService,
    CrmMemberService
  ]
})
export class MemberEditComponent implements OnInit, OnDestroy {

  breadcrumbs;
  isLoading = false;
  memberId;

  // Member Info --MT
  member;
  memberLetters;

  defaultPhoneNumber;

  // Member Transactions - MT
  transactionsLoading = false;
  transactions = [];

  // Transactions Pagination -- MT
  count: number;
  showPagination = true;
  pageSizes: Array<Object>;
  pageSize: number;
  currentPage: number;
  noDataInContent: boolean;

  // SMS Verification -- MT
  expiresIn: number;

  @ViewChild('newEmail') newEmail: TextInputComponent;
  @ViewChild('newPhoneNumber') newPhoneNumber: PhoneInputComponent;
  @ViewChild('newDefaultPhone') newDefaultPhone: PhoneInputComponent;
  isDefaultPhoneChanged: boolean;

  constructor(
    private headerTitleService: HeaderTitleService,
    private crmMemberService: CrmMemberService,
    public entityService: EntityService,
    private transactionService: TransactionServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tetherDialog: TetherDialog,
    private notificationService: NotificationService,
    private authService: AuthenticationService,
    private settingsService: AppSettingsService,
  ) {

  }

  ngOnInit() {
    this.headerTitleService.setTitle('Müşteriler');
    this.headerTitleService.setLink('/members');
    this.breadcrumbs = [{title: 'Müşteri Detayı'}];
    this.pageSizes = [
      {text: '10', value: 10},
      {text: '20', value: 20}
    ];
    this.pageSize = 10;
    this.currentPage = 1;

    this.expiresIn = this.settingsService.getLocalSettings('timeoutForSMSVerification');

    this.route.params.subscribe(params => {
      this.memberId = +params['id'];

      this.getMemberDetails();

      this.getMemberTransactions();

    });
  }

  private getMemberDetails() {
    this.isLoading = true;

    this.crmMemberService.getMemberDetailScreenModel(this.memberId).subscribe(
      data => {
        if (data && data.EntityModel) {
          this.member = data.EntityModel;
          if (this.member) {
            if (this.member.MemberPhones && this.member.MemberPhones.length > 0) {
              this.defaultPhoneNumber = this.member.MemberPhones.find(p => p.IsDefault);
            }
            this.memberLetters = this.getmemberLetters();
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.notificationService.add({
            type: 'danger',
            text: 'Müşteri bilgileri getirilirken bir sorun oluştu.'
          });
        }
      },
      error => {
        this.isLoading = false;
        if (error && error.Type === 2) {
          this.notificationService.add({
            type: 'danger',
            text: `${error['ErrorCode']}: ${error['Message']}`
        });
        } else {
          this.notificationService.add({
            type: 'danger',
            text: `Müşteri bilgileri getirilirken bir sorun oluştu.`
          });
        }
      }
    );

    this.isLoading = false;
  }

  private getmemberLetters(): string {
    let letters = '';
    if (this.member.Name && this.member.Name.length) {
      letters += this.member.Name.charAt(0).toUpperCase();
    }
    if (this.member.Surname && this.member.Surname.length) {
      letters += this.member.Surname.charAt(0).toUpperCase();
    }
    return letters;
  }

  private getMemberTransactions() {
    this.entityService.setOrder({ sortBy: 'PaymentDate', type: 'desc'});
    this.entityService.setCustomEndpoint('GetAll');

    this.entityService.queryParamSubject.subscribe(
      params => {
        this.transactionsLoading = true;
        this.updateLocalParams(params);

        let query = this.entityService.fromEntity('TBasket')
                                      .where('MemberLoginId', '=', this.memberId)
                                      .expand(['Currency'])
                                      .expand(['SalesChannel'])
                                      .take(this.pageSize)
                                      .page(this.currentPage);

        let sort = params['sort'] ? (typeof params['sort'] === 'string' ? JSON.parse(params['sort']) : params['sort']) : null;

        if (sort && sort[0]) {
          query.orderBy(sort[0]['sortBy'], sort[0]['type'])
        }

        query.executeQuery();

      },
      error => {
        if (error && error.Type === 2) {
          this.notificationService.add({
            type: 'danger',
            text: `${error['ErrorCode']}: ${error['Message']}`
          });
        } else {
          this.notificationService.add({
            type: 'danger',
            text: `Müşteri işlemleri getirilirken bir sorun oluştu.`
          });
        }
      }
    );

    this.entityService.data.subscribe(entities => {
      if (entities && entities.length < 1) {
        this.noDataInContent = true;
      } else {
        this.transactions = entities;
        this.noDataInContent = false;
      }
      this.transactionsLoading = false;
    }, error => {
      this.transactionsLoading = false;
      console.log(error)
    });
    this.entityService.getCount().subscribe(
      count => this.count = count,
      error => console.log(error)
    );
  }

  private updateLocalParams(params: Object = {}) {
    this.currentPage = params['page'] ? params['page'] : 1;
    this.pageSize = params['pageSize'] ? params['pageSize'] : 20;
  }

  transistPage(page) {
    this.entityService.setPage(page);
  }

  changePageSize(pageSize) {
    this.entityService.setPageSize(pageSize);
  }

  toggleSortTitle(sort) {
    if (sort) {
      this.entityService.setOrder(sort, true);
    } else {
    this.entityService.flushOrder();
		}
  }

  openItemContextMenu(e, transaction) {
		let content = {
			title: 'İŞLEMLER',
			data: [
				{ label: 'Fatura E-Postası Gönder', icon: 'mail', action: 'sendEmail' },
        { label: 'Konfirmasyon SMS\'i Gönder', icon: 'sms', action: 'sendSMS' },
				{ label: 'Detayları Gör', icon: 'launch', action: 'goToTransaction' }
			]
		};

		this.tetherDialog.context(content, {
			target: e.target,
			attachment: 'top right',
			targetAttachment: 'top right',
		}).then(result => {
			if (result) {
        switch (result['action']) {
          case 'sendEmail':
            this.sendEmail(transaction.RefId);
            break;
          case 'sendSMS':
            this.sendSMS(transaction.RefId);
            break;
          case 'goToTransaction':
            this.router.navigate(['/transaction', transaction.Id]);
            break;
        }
			}
		}).catch(reason => console.log('dismiss reason : ', reason));
  }

  private sendEmail(refId: string): void {

    this.isLoading = true;

    this.transactionService.sendEInvoiceMail(refId).subscribe(response => {
      this.isLoading = false;
      this.notificationService.add({
        text: 'Fatura E-Postası gönderilmiştir.',
        type: 'success'
      });
    }, error => {
      this.isLoading = false;
      if (error && error.Type === 2) {
        this.notificationService.add({
          type: 'danger',
          text: `${error['ErrorCode']}: ${error['Message']}`

      });
      } else {
        this.notificationService.add({
          type: 'danger',
          text: `Fatura E-Postası gönderilirken bir sorun oluştu.`
        });
      }
    });
  }

  private sendSMS(refId: string): void {

    this.isLoading = true;

    this.transactionService.sendConfirmationSMS(refId).subscribe(response => {
      this.isLoading = false;
      this.notificationService.add({
        text: 'Konfirmasyon SMS\'i gönderilmiştir.',
        type: 'success'
        });
      }, error => {
        this.isLoading = false;
        if (error && error.Type === 2) {
          this.notificationService.add({
            type: 'danger',
            text: `${error['ErrorCode']}: ${error['Message']}`

        });
        } else {
          this.notificationService.add({
            type: 'danger',
            text: `Konfirmasyon SMS\'i gönderilirken bir sorun oluştu.`
          });
        }
      });
  }

  disconnectSocialMedia(socialMedia: string) {
    this.isLoading = true;

    this.crmMemberService.disconnectSocialMedia(this.memberId, socialMedia).subscribe(
      response => {
        this.isLoading = false;
        switch (socialMedia) {
          case 'Facebook':
            this.member.FacebookConnected = false;
            break;
          case 'Spotify':
            this.member.SpotifyConnected = false;
            break;
          default:
            break;
        }
        this.notificationService.add({
          text: `${socialMedia} bağlantısı kaldırılmıştır.`,
          type: 'success'
        });
      }, error => {
        this.isLoading = false;
        if (error && error.Type === 2) {
          this.notificationService.add({
            type: 'danger',
            text: `${error['ErrorCode']}: ${error['Message']}`

        });
        } else {
          this.notificationService.add({
            type: 'danger',
            text: `${socialMedia} bağlantısı kaldırılırken bir sorun oluştu.`
          });
        }
      }
    );
  }

  removeMemberLicense(license) {
    this.isLoading = true;

    this.crmMemberService.removeMemberLicense(this.memberId, license.LastConfirmedLicenseId).subscribe(
      response => {
        this.isLoading = false;
        license.IsLatestLicenseConfirmed = false;
        this.notificationService.add({
          text: 'Lisans onayı kaldırılmıştır.',
          type: 'success'
        });
      }, error => {
        this.isLoading = false;
        if (error && error.Type === 2) {
          this.notificationService.add({
            type: 'danger',
            text: `${error['ErrorCode']}: ${error['Message']}`

        });
        } else {
          this.notificationService.add({
            type: 'danger',
            text: `Lisans onayı kaldırılırken bir sorun oluştu.`
          });
        }
      }
    );
  }

  addMemberEmail() {

    if (!this.newEmail) {
      return;
    }

    if (!this.newEmail.value) {
      return;
    }

    this.isLoading = true;

    this.crmMemberService.addMemberEmailForBackOffice(this.memberId, this.newEmail.value, false, false).subscribe(
      response => {
        this.isLoading = false;
        this.member.MemberEmails.push({
          EmailAddress: this.newEmail.value,
          IsActivated: false,
          IsDefault: false
        });
        this.newEmail.value = '';
        this.notificationService.add({
          text: 'E-posta adresi eklenmiştir.',
          type: 'success'
        });
      }, error => {
        this.isLoading = false;
        if (error && error.Type === 2) {
          this.notificationService.add({
            type: 'danger',
            text: `${error['ErrorCode']}: ${error['Message']}`

        });
        } else {
          this.notificationService.add({
            type: 'danger',
            text: 'E-posta eklenirken bir sorun oluştu.'
          });
        }
      }
    );
  }

  inputChangeHandler(e) {
    this.isDefaultPhoneChanged = e !== this.defaultPhoneNumber.PhoneNumber;
  }

  addMemberPhone(isDefault: boolean) {

    let phoneNumber: string;

    if (isDefault) {
      if (!this.newDefaultPhone || !this.newDefaultPhone.value) {
        return;
      } else {
        phoneNumber = this.newDefaultPhone.value;
      }
    } else {
      if (!this.newPhoneNumber || !this.newPhoneNumber.phoneNumber) {
        return;
      } else {
        phoneNumber = this.newPhoneNumber.value;
      }
    }
    this.isLoading = true;

    this.crmMemberService.addMemberPhoneForBackOffice(this.memberId, 3274, false, false,
                                                      '', '', '', phoneNumber).subscribe(
      response => {
        this.openOtpValidationBox(isDefault);
      } , error => {
        if (error)  {
          if ( error.Data && error.Data.MessageCodeNumber === 82) {
            this.notificationService.add({
              text: 'Aktif bir SMS kodunuz bulunmaktadır. Cep telefonunuza gelen son SMS kodunu kullanabilirsiniz.',
              type: 'success'
            });
            this.openOtpValidationBox(isDefault);
          } else if (error.Type === 2) {
            this.isLoading = false;
            this.newDefaultPhone.value = this.defaultPhoneNumber.PhoneNumber;
            this.notificationService.add({
              type: 'danger',
              text: `${error['ErrorCode']}: ${error['Message']}`
            });
          } else {
            this.isLoading = false;
            this.newDefaultPhone.value = this.defaultPhoneNumber.PhoneNumber;
            this.notificationService.add({
              type: 'danger',
              text: `${error['ErrorCode']}: Telefon eklenirken bir sorun oluştu.`
            });
          }
        } else {
          this.isLoading = false;
          this.newDefaultPhone.value = this.defaultPhoneNumber.PhoneNumber;
          this.notificationService.add({
            type: 'danger',
            text: `Telefon numarası eklenirken bir sorun oluştu.`
          });
        }
      }
    );
  }

  openOtpValidationBox(isDefault: boolean) {
    let component: ComponentRef<OtpValidationBoxComponent>;

    component = this.resolver
                    .resolveComponentFactory(OtpValidationBoxComponent)
                    .create(this.injector);

    component.instance.phoneNumber = isDefault ? this.newDefaultPhone.value : this.newPhoneNumber.value;
    component.instance.expiresIn = this.expiresIn;
    component.instance.memberId = +this.memberId;
    component.instance.oldPhone = isDefault ?  this.defaultPhoneNumber.PhoneNumber : null;
    component.instance.isPhoneValidation = true;

    this.tetherDialog.modal(component, {
      escapeKeyActive: true,
      dialog: {
        style: {
          width: '400px',
          height: '420px'
        }
      }
    }).then(
      result => {
        this.isLoading = false;
        if (result === 'success') {
          if (isDefault) {
            this.defaultPhoneNumber.PhoneNumber = this.newDefaultPhone.value;
            this.isDefaultPhoneChanged = false;
          } else {
            this.member.MemberPhones.push({
              PhoneNumber: this.newPhoneNumber.value,
              PhoneTypeId: 3274,
              PhoneType: 'Cep Telefonu',
              IsActivated: true,
              IsDefault: false
            });
            this.newPhoneNumber.value = '';
            this.newPhoneNumber.countryCode = 'TR';
            this.notificationService.add({
              text: 'Telefon numarası eklenmiştir.',
              type: 'success'
            });
          }
        }
      }).catch(error => {
        this.isLoading = false;
        console.log('OTP Validation Box dismiss reason: ' + error);
    });
  }

  exit(event) {
    this.router.navigate(['member', this.memberId]);
  }

  ngOnDestroy() {
    this.authService.resetOtpValidatedMemberInfo();
  }
}
