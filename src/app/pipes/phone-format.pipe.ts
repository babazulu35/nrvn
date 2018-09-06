import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phoneFormat',
    pure: false
})
export class PhoneFormatPipe implements PipeTransform {

    transform(value: string, isHidden?: boolean): string {
        if(!value) return value;
        value = value.replace(/[^0-9\.]+/g, '')
        if (value.length == 12 && value.startsWith('90')) {
            if (isHidden) return value.replace(/(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/, "+$1 ($2) *** **$5");
            return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "+$1 ($2) $3 $4");
        } else if (value.length == 11 && value.startsWith('0')) {
            if (isHidden) return value.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, "0 ($2) *** **$5");
            return value.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "0 ($2) $3 $4");
        } else if (value.length == 10) {
            if (isHidden) return value.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "0 ($1) *** **$4");
            return value.replace(/(\d{3})(\d{3})(\d{4})/, "0 ($1) $2 $3");
        } else {
            return value;
        }
    }

}
