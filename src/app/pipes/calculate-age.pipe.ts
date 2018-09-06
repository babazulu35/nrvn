import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calculateAge'
})
export class CalculateAgePipe implements PipeTransform {

  transform(value: Date): any {
    
    let timeDifference = Math.abs(Date.now() - value.getTime());

    let age = Math.floor((timeDifference / (1000 * 3600 * 24) / 365));

    return age;
  }

}