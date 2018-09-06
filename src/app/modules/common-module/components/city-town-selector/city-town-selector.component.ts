import { SelectboxComponent } from './../../../base-module/components/selectbox/selectbox.component';

import { Component, OnInit, Input, ViewChild, OnChanges, AfterViewInit, QueryList, ContentChild,AfterContentInit,EventEmitter,Output,OnDestroy } from '@angular/core';
import { CityService } from './../../../../services/city.service';
import { TownService } from './../../../../services/town.service';
import { City } from './../../../../models/city';
import { Town } from './../../../../models/town';


@Component({
  selector: 'app-city-town-selector',
  templateUrl: './city-town-selector.component.html',
  styleUrls: ['./city-town-selector.component.scss'],
  providers:[CityService,TownService]
})
export class CityTownSelectorComponent implements OnInit {

  @ContentChild('city') city:SelectboxComponent;
  @ContentChild('town') town:SelectboxComponent;

  @Output() changeEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() cityTownEvent: EventEmitter<any> = new EventEmitter<any>();

  cityId : number;
  townId : number;

  modelCity:City[];
  modelTown:Town[];
  cityResult = [];
  subscription;
  selectBox:Array<Object>;

  @Input() set data(value: {cityId:any, townId?: any}) {
    this.cityId = value.cityId;
    this.townId = value.townId;
    if(value.cityId) this.city.select(this.cityId);
  }

  @Input() returnAsModel: boolean = false;

  constructor(
    private cityService:CityService,
    private townService:TownService
  ) { }

  ngOnInit() {
    this.city.options = [{
      'text': 'Seçiniz',
      'value': 0
    }]
    this.town.options = [{
      'text': 'Seçiniz',
      'value': 0
    }];
  }
  
  ngAfterContentInit() {
    this.cityService.query({page:0, pageSize: 82});
    this.cityService.data.subscribe(result => {
        if(result) {
          Object.keys(result).forEach(key => {
           this.modelCity = result[key];
           this.city.options.push({
             'text': this.modelCity['Name'],
             'value': this.returnAsModel ? this.modelCity : this.modelCity['Id']
           });
           
          });
          if(this.cityId){
            this.city.value = this.cityId;
            this.changeCityValue(this.cityId);
          }
        }
     })
   this.town.isDisabled = true;

   this.city.changeEvent.subscribe( value => this.changeCityValue(value));
   this.town.changeEvent.subscribe( value => {
     this.changeEvent.emit( {
       city: this.city.value,
       town: this.town.value
     });
   });
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.townService.data.unsubscribe();
    this.cityService.data.unsubscribe();
    this.city.changeEvent.unsubscribe();
    this.town.changeEvent.unsubscribe();
  }
  changeCityValue($event) {
      if(this.returnAsModel) $event = $event.Id;
      this.townService.query({page:0, pageSize:100,filter: [{filter: `CityId eq ${$event}` }]});
      this.townService.data.subscribe(towns => {
        if(towns && towns.length > 0) {
          this.town.isDisabled = false;
          this.town.options = [];
          this.town.options.unshift({
              'text': 'Seçiniz',
              'value': 0
          });
          Object.keys(towns).forEach(key => {
            this.modelTown = towns[key];
            this.town.options.push (
            {
              'text': this.modelTown['Name'],
              'value': this.returnAsModel ? this.modelTown : this.modelTown['Id']
            })
          });
    		  if(this.townId){
            let town = this.town.options.find(item =>{
              return (item["value"] === this.townId);
            });
            this.town.select(this.townId);
          }else {
            this.town.select(0);  
          }
        }else {
          this.town.select(0);
        }
      });
    }
  changeTownValue(event) {
     this.cityTownEvent.emit(event);
  }
}
