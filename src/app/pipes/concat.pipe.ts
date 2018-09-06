import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'concat'
})
export class ConcatPipe implements PipeTransform {

  transform(value: any, args?: any, seperator: string = ' '): any {
    	let variables = [];
		if(value){
			variables.push(value);
		}
		if(args){
			variables.push(args);
		}
    	return variables.join(seperator);
  }

}
