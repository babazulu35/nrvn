import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthenticationService, private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    return this.checkLogin(url, route.data);
  }
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }
  checkLogin(url: string, routeData: {}): boolean {
    if (this.authService.getToken && this.authService.getAuthenticatedUser()) {
    	return routeData && routeData["userRoles"] ? this.authService.roleHasAuthenticate(routeData["userRoles"]) : true;
    }else{
    	url = 'login';
    }
    this.router.navigate([url]);
    return false;

  }
}