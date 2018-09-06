import { AuthDialogBoxComponent } from './../../../modules/common-module/components/auth-dialog-box/auth-dialog-box.component';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss']
})
export class LockComponent implements OnInit {
  @ViewChild(AuthDialogBoxComponent) authDialogBox: AuthDialogBoxComponent;

  authAlert: {type: string, title: string, description: string}
  isAuthenticatedUser: boolean;

  constructor() { }

  ngOnInit() {
  }

  authSubmitEventHandler($event) {
    if($event.username == "demo" && $event.password == "demo") {
      this.isAuthenticatedUser = true;
      console.log("Kullanıcı girişi yapıldı. Sayfa yönlendirmesi yapılabilir");
    }else{
      this.authDialogBox.reset();
      this.authAlert = {
        type: "warning",
        title: "Kullanıcı adı veya parolanız hatalı",
        description: "Yeniden deneyin ya da parolamı unuttum linkine tıklayarak parolanızı sıfırlaryın."
      }
    }
  }

}
