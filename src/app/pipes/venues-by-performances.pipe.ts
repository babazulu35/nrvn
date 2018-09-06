import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'venuesByPerformances'
})
export class VenuesByPerformancesPipe implements PipeTransform {

  transform(performances: any, args?: any): any {
	  	if(!performances) return null;
       	let venues = [],
    	venueString = '';
    	if(args === 'odata'){
    		performances.forEach(performance => {
    			if(performance['VenueTemplate']['Venue']['Localization']){
    				let venue = {
	    							Id: performance['VenueTemplate']['Venue']['Id'],
	    							Name: performance['VenueTemplate']['Venue']['Localization']['Name'],
	    							VenueCityName: performance['VenueTemplate']['Venue']['Town']['City']['Name'],
	    							VenueTownName: performance['VenueTemplate']['Venue']['Town']['Name'],
    							}
    				venues.push(venue);
    			}
	    	});
    	}else{
    		performances.forEach(performance => {
    			venues.push(performance.Venue);
	    	});
    	}

    	if(venues.length == 0){
    		return '-';
    	}
    	if(venues.length == 1 ){
    		venueString = venues[0].Name + ' / ' + venues[0].VenueCityName;
    	}else if(venues.length > 1){
    		let city = (venues[0]) ? venues[0]['VenueCityName'] : '';
    		let inSameCity = false;
    		inSameCity = venues.every(venue => {
    			return (venue['VenueCityName'] == city)
    		})
    		if(!inSameCity){
    			venueString = 'Birçok Mekan'
    		}else{
    			let venueId = venues[0]['Id'],
    				uniqeVenues = [],
    				seen = {};
				uniqeVenues = venues.filter(item => {
					let k = JSON.stringify(item);
				    return seen.hasOwnProperty(k) ? false : (seen[k] = true);
				});
    			let isInSameVenue = (uniqeVenues.length == 1 ) ? true : false;
    			if(isInSameVenue){
    				venueString = venues[0].Name + ' / ' + venues[0].VenueCityName;
    			}else{
    				venueString += venues[0]['VenueCityName'];
	    			let uniqeTowns = [];
	    			uniqeVenues.forEach(item => {
	    				if(uniqeTowns.indexOf(item['VenueTownName']) == -1){
	    					uniqeTowns.push(item['VenueTownName'])
	    				}
	    			})
	    			venueString += (uniqeTowns) ? ' ' + uniqeTowns.join(' / ') : ' ';
    			}
    		}
		}
    	return venueString;
  }

}