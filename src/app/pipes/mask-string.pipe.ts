import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskString'
})
export class MaskStringPipe implements PipeTransform {

  transform(value: any, args?: any): any {
        if(!value) return value;
        let masked = '';
        switch (args) {
        	case "email":
        		let email = value.split("@");
        		masked = "*".repeat(email[0].length - 3) + email[0].slice(-3) + "@" + email[1];
            break;
          case "natiaonalId":
            let id = value;
            masked = value.substr(0,2) + "*".repeat(7) + value.substr(-2)
            break;
          case 'password':
            masked = '*'.repeat(value.length);
            break;
        	default:
        		masked = value;
        		break;
        }
        return masked;
  }

}
