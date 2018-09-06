import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'object'
})
export class ObjectPipe implements PipeTransform {

  transform(value: any, args?: any): any {
  	if(args === 'toArray'){
  		let obj = [];
  		value.forEach(item => {
  			Object.keys(item).forEach(key => {
  				obj.push({key: key, value :item[key]});
  			});
  		})
  		return obj;
  	}

  }

}
