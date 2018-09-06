import { Component, OnInit, Input, HostBinding, AfterViewInit } from '@angular/core';
import { MockService } from '../../../../services/mock.service';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';
import { Observable } from 'rxjs/Observable';
import { CrmMemberService } from '../../../../services/crm-member.service';
import { NotificationService } from '../../../../services/notification.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { ActivatedRoute } from '@angular/router';

enum ErrorType {
  Timeout = 0,
  WrongCode = 1
}


@Component({
  selector: 'app-otp-validation-box',
  templateUrl: './otp-validation-box.component.html',
  styleUrls: ['./otp-validation-box.component.scss'],
  providers: [CrmMemberService]
})
export class OtpValidationBoxComponent implements OnInit, AfterViewInit {

  @HostBinding('class.c-otp-validation-box') true;
  @Input() phoneNumber: string;
  @Input() memberId: number;
  @Input() expiresIn: number;
  @Input() oldPhone?: string;
  @Input() isPhoneValidation: boolean;

  otp: string;
  isValid = false;
  isLoading: boolean;
  counter: number;
  error: {
    status: boolean,
    type: ErrorType,
    messageHeader: string,
    messageDesc: string,
    messageAction: string,
  }

  constructor(
    private crmMemberService: CrmMemberService,
    public tetherDialog: TetherDialog,
    private notificationService: NotificationService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {

    let timer = setInterval(() => {
      this.counter -= 1;
      if (this.counter < 1) {
        this.showError(ErrorType.Timeout);
        clearInterval(timer);
      }
    }, 1000);
  }

  ngAfterViewInit() {
    this.counter = this.expiresIn;
  }

  inputChangeHandler(event, name) {
    let pat = /^\d{4}$/;
    this.isValid = false;
    if (event && pat.test(event)) {
      this.otp = event;
      this.isValid = true;
    }
  }

  submitClickHandler(event) {
    if (this.isPhoneValidation) {
      if (this.oldPhone) {
        this.validateAndChangeDefaultMemberPhone();
      } else {
        this.validateMemberPhone();
      }
    } else {
      this.validateOtp();
    }
  }

  showError(type: ErrorType) {
    this.error = { status: true, type: type, messageHeader: '', messageDesc: '', messageAction: ''};
    switch (this.error.type) {
      case ErrorType.Timeout:
        this.error.messageHeader = 'Süre doldu.';
        this.error.messageDesc = 'İşlem onayı için verilen süre doldu.';
        this.error.messageAction = 'Yeni kod isteyin.';
        break;
      case ErrorType.WrongCode:
        this.error.messageHeader = 'Girilen kod hatalı.';
        this.error.messageDesc = 'Yeniden deneyin.';
        this.error.messageAction = 'Yeni kod isteyin.';
        break;
      default:
        break;
    }
  }

  validateOtp() {
    this.crmMemberService.validateOTP(this.phoneNumber, this.otp).subscribe(
      response => {
        this.authService.setOtpValidatedMemberId(this.memberId);
        this.tetherDialog.close();
      }, error => {
        this.showError(ErrorType.WrongCode);
      }
    );
  }

  validateMemberPhone() {
    this.crmMemberService.validateMemberPhoneForBackOffice(this.memberId, this.phoneNumber, this.otp).subscribe(
      response => {
        this.tetherDialog.close('success');
      }, error => {
        if (error) {
          if (error.Data && error.Data.MessageCodeNumber === 37) {
            this.tetherDialog.dismiss();
            this.notificationService.add({
              text: `${error.ErrorCode}: ${error.Message}`,
              type: 'danger'
            });
          } else {
            this.showError(ErrorType.WrongCode);
          }
        } else {
          this.showError(ErrorType.WrongCode);
        }
      }
    );
  }

  validateAndChangeDefaultMemberPhone() {
    this.crmMemberService.validateMemberPhoneForBackOffice(this.memberId, this.phoneNumber, this.otp, this.oldPhone).subscribe(
      response => {
        this.tetherDialog.close('success');
      }, error => {
        if (error) {
          if (error.Data && error.Data.MessageCodeNumber === 37) {
            this.tetherDialog.dismiss();
            this.notificationService.add({
              text: `${error.ErrorCode}: ${error.Message}`,
              type: 'danger'
            });
          } else {
            this.showError(ErrorType.WrongCode);
          }
        } else {
          this.showError(ErrorType.WrongCode);
        }
      }
    );
  }

}
