import { AuthDialogBoxComponent } from './../../../modules/common-module/components/auth-dialog-box/auth-dialog-box.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
    selector: 'app-password-recovery',
    templateUrl: './password-recovery.component.html',
    styleUrls: ['./password-recovery.component.scss']
})
export class PasswordRecoveryComponent implements OnInit {
    @ViewChild(AuthDialogBoxComponent) authDialogBox: AuthDialogBoxComponent;

    authAlert: { type: string, title: string, description: string }
    isPasswordSended: boolean;

    constructor(
        private authenticationService: AuthenticationService
    ) { }

    ngOnInit() {
    }

    authSubmitEventHandler($event) {
        let {username, email} = $event;
        console.log(username, email)
        this.authenticationService.recoverPassword(username, email).subscribe(
            response => {
                this.authDialogBox.reset();
                this.authAlert = {
                    type: "success",
                    title: "Tebrikler",
                    description: "Parola sıfırlama bilgileriniz ${email} adresine gönderilmiştir."
                }
                this.isPasswordSended = true;
            }, error => {
                this.authDialogBox.reset();
                this.authAlert = {
                    type: "warning",
                    title: "Böyle bir kullanıcı veya email bulunamadı",
                    description: "Yeniden deneyin ya da sistem yöneticinize başvurun."
                }
            }
        )
    }

}
