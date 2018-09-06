## Query Manager

Query Manager is extended our base data service to build Odata queries. Currently there is only one endpoint that is able to use Odata queryies which is "Entity" endpoint.
It can be used also existing endpoints but not all of functions (such as expand) is avaliable for them. 


##### Query
First you need to initilaze data service from component such as EntityService.
```sh
import { EntityService } from '../../services/entity.service';
```
Then add it to component's constructor:
```sh
	constructor(
	    ...
        private entityService : EntityService
    ) {}
```
After that, EntityService (from services), BaseDataService and QueryManager will be avaliable for querying via entityService property.
Use ngOnInit block to define initial settings and subscriber as desribed.
```sh
	ngOnInit() {
		this.entityService.setCustomEndpoint('GetAll');
		...
		this.entityService.data.subscribe(entities => {
			console.log('entities',entities)
		})
  	}
```
##### Chan Methods
Complex query sample:
```sh
this.entityService
	.fromEntity('EPerformance')
	.where('Id', '=', 471)
	.and('Code','=',"'001'")
	.or([['Code','=',"'001'"], 'and', ['Code','=',"'002'"]])
	.expand(['VenueTemplate','Venue','Town','City','Country'])
	.expand(['Event'])
	//.filterOnExpand('CodeAlpha2','=','TR', 0)
	.take(1)
	.page(1)
	.orderBy('Date','asc')
	.executeQuery();
```
######  1. fromEntity( endpointName )
This method has to be set to define base entity that you want to query. Names from swagger list can be used. Such as EEvent, EPerformance etc.

######  2. where( propertyName, operator, value, cast )
First parameter is propertyName which query conduct on, second parameter is operator which can get values from list desribed bellow and last one is desired value for where query.
| Operation | Operator |
| ------ | ------ |
| Equal | = |
| Not Equal | != |
| Lower Than | <= |
| Greater Than | >= |

Cast parameter is added to shorcut cast operation in Odata query.
To make following operation:
```sh
Status eq cast(2, Nirvana.Shared.Enums.EventStatus)
```
You need to call where with cast parameters as follows:
```sh
...where('Status','=',2,'EventStatus')
```
Cast parameter can be used in same ways for other filter methods for and() and or().

This method can be called once in query.

######  3. and( propertyName, operator, value | propertyArray, cast )
And method can get two types of values. 
First, you can pass values same as where method. In this case propertyName, operator and value should pass to method. This will add an "and" operator and following condition righth after where method. 
Secod, you can pass an propertyArray to method. This is nessesery when you want nested and operation such as:
```sh
... Id eq 4 and (Name eq 'nirvana' or 'Name' eq 'nirv')
```
Following statement after first "and" operator will derived from this propertyArray.
In this case and() is a conjuction operator which tied statement from parenthesis.
In order to crate query like above you need to call and() similar to this:
```sh
.and([ ['Name','=',"'nirvana'"], 'or', ['Name','=',"'nirv'"] ])
```
This method can be called multiple times in query.

In order to use **"and"** and **"or"** methods, you need to set **"where"** metod first. If you dont, application **will throw an QUERY MANAGER error**. 

######  3. or( propertyName, operator, value | propertyArray, cast )
Same as and() method.

######  4. expand( expandArray )
This metod expand all properties from expandArray one within the other. If you want to expand Town from Venue, you just need to pass "Town" to expand array but if you want to expand "City" from "Town" from "Venue", you need to pass same path to expandArray with keep in order like ['Venue','Town','City'].
Entity that has been set by fromEntity() should have the property that needed to expand and has to be navigatable property.
expand() method can be used multiple times to expand different properties.

######  4. filterOnExpand( propertyName, operator, value, index = 0 )
You can filter over expanded entities via this method. It takes same arguments as other filter methods such as where(). In adition to them, you can pass an index argument to identifiy whih expand method you want to use for filtering. For instance, if you have two expand method in query, you can pass index (e.g. 1) to set filter on preferred expanded property. If you set 1 in main sample, you set filters on Event entity. If you use 0, this time Country will be used for filtering.

**filterOnExpand() adds filter to last expanded entity.**
**This method has not been implemented by DT yet.**

######  4. take( number )
To set pagesize value.

######  5. page( number )
To set current page.

######  5. orderBy( property, orderType )
It can be used for ordering records. 

######  6. search( on, value )
To search in main entity. It needs two arguments, first to identify which property will use for searching and second one keyword/value to search.
```sh
.search('Name', 'nirvana')
```
######  7. searchOnExpand( on, value, index = 0 )
Same as search() but for expanded entities. It takes an index same as filterOnExpand() metthod.

######  8. executeQuery()
To finish query and execute.

######  9. Raw methods: whereRaw( query ), andRaw( query ) and orRaw( query )
Methods can be used for raw filter queries.
```sh
.andRaw('(Performances/any(p:p/Date gt 2017-01-01))')
```

######  10. Select(propertyName Array | String )
This method can be used to select spesific resources on root entity property.

```sh
.fromEntity('EEvent')
.select(['Localization','Performances'])
```
This will execute select on EEvent entity.

######  11. SelectOnExpand(value Array, index = 0 )
This method can be used for selecting spesific resources on expanded navigation property. 
```sh
.expand(['Localization'])
.expand(['Performances','VenueTemplate','Venue','Localization'])
.selectOnExpand(['VenueTemplate','Date'],1)
```
Above, selectOnExpand() metod will apply select in first property on second expanded row which is 'Performances'.
