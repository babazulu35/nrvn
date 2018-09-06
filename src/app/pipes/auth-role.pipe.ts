import { AuthenticationService } from './../services/authentication.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'authRole'
})
export class AuthRolePipe implements PipeTransform {

  constructor(private authenticationService: AuthenticationService) {

  }

  transform(value: any, args?: any): any {
    console.log(value, this.authenticationService);
    return this.authenticationService.roleHasAuthenticate(value);
  }

}
