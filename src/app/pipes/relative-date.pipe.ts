import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/tr'

@Pipe({
    name: 'relativeDate'
})
export class RelativeDatePipe implements PipeTransform {
    transform(value: any, args?: string): any {
        moment.locale('tr');
        if(Array.isArray(value)) {
            if(value.length == 0 || !value[0] || !moment(value[0]).isValid()) return "";
            let formattedDate: string;
            let formattedDays: string;
            let formattedYear: string;

            let day1 = moment(value[0]).format("DD");
            let month1 = moment(value[0]).format("MMM");
            let year1 = moment(value[0]).format("YYYY");

            let day2, month2, year2;
            if(value.length == 2 && moment(value[1]).isValid()) {
                day2 = moment(value[1]).format("DD");
                month2 = moment(value[1]).format("MMM");
                year2 = moment(value[1]).format("YYYY");
                if(year1 == year2) {
                    if(month1 == month2) {
                        formattedDays = day1 == day2 ? `${day1}` : `${day1} - ${day2}`;
                        formattedDate = `<b>${formattedDays}</b> ${moment(value[0]).format("MMMM")} ${year1}`;
                    }else{
                        formattedDays = `${day1} ${month1} - ${day2} ${month2}`;
                        formattedDate = `<b>${formattedDays}</b> ${year1}`;
                    }
                }else {
                    formattedDate = `<b>${moment(value[0]).format("DD MMM YY")} - ${moment(value[1]).format("DD MMM YY")}</b>`;
                }
            }else{
                formattedDays = `${day1} ${moment(value[0]).format("MMMM")}`;
                formattedDate = `<b>${formattedDays}</b> ${year1}`;
            }
            
            if(args=="split") {
                if(year1 != year2) {
                    if(value.length == 2) {
                        return [moment(value[0]).format("DD MMM YY"), moment(value[1]).format("DD MMM YY")];
                    }else{
                        return [formattedDays, year1];
                    }
                }else{
                    if(month1 == month2) {
                        return [formattedDays, `${moment(value[0]).format("MMMM")} ${year1}`];
                    }else{
                        return [formattedDays, year1];
                    }
                    
                }
            }else{
                return formattedDate;
            }
        }
        if(!moment(value).isValid()) return "-";
        value = moment(value);
        if (args) return moment(value).format(`${args}`)
        const diff = {
            today: moment().isSame(value.clone().startOf('day'), 'd'),
            yesterday: moment().isSame(value.clone().subtract(-1, 'days').startOf('day'), 'd'),
            tomorrow: moment().isSame(value.clone().subtract(1, 'days').startOf('day'), 'd')
        }
        if(diff.today) {
            return `Bugün, ${moment(value).format('HH:mm')}`
        }
        if(diff.yesterday) {
            return `Dün, ${moment(value).format('HH:mm')}`
        }
        if(diff.tomorrow) {
            return `Yarın, ${moment(value).format('HH:mm')}`
        }
        if(moment(value).year() == moment().year()) {
            return moment(value).format('DD MMMM, HH:mm')
        } else {
            return moment(value).format('DD MMMM YYYY, HH:mm')
        }
    }

}
