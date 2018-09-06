import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService }            from './services/auth-guard.service';
import { AuthenticationService }          from './services/authentication.service';
import { AppComponent } from './app.component';
import { LoginComponent } from './routes/login/login.component';
import { PasswordRecoveryComponent } from './routes/login/password-recovery/password-recovery.component';
import { LockComponent } from './routes/login/lock/lock.component';

const loginRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LoginComponent, data: {action:"logout"}},
  { path: 'login/password-recovery', component: PasswordRecoveryComponent },
  { path: 'login/lock', component: LockComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(loginRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AuthGuardService,
    AuthenticationService
  ]
})
export class LoginRoutingModule {} 