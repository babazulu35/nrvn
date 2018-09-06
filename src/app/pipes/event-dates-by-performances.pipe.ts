import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
@Pipe({
  name: 'eventDatesByPerformances'
})
export class EventDatesByPerformancesPipe implements PipeTransform {

	transform(performances: any, args?: any): any {
		if(performances){
			let dates = [];
			performances.forEach(performance => {
				dates.push(moment(performance.Date));
			});
			return {BeginDate:moment.min(dates).toISOString(),EndDate:moment.max(dates).toISOString()}
		}else{
			return false;
		}
  	}

}
