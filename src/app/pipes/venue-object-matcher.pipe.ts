import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'venueObjectMatcher',
  pure: false
})
export class VenueObjectMatcherPipe implements PipeTransform {
  private icons = [
    "event_seat",
    "restaurant",
    "wc",
    "local_parking"
  ]
  transform(value: string, args?: any): any {
    let object = this.icons.filter(i => {
      return (i.indexOf(value)) >-1
    });
    return object;
  }

}
