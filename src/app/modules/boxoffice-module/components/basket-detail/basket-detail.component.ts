import { Component, OnInit ,ChangeDetectionStrategy,Input,OnChanges,Output,EventEmitter} from '@angular/core';

import {Observable} from 'rxjs/Observable';



// Basket Item Model its just part of what i need based from swagger api/BReservation

export class Event {
  public eventId:string;
  public eventName:string;
  public eventSeatsCanBeUpdate:boolean;
  public eventDetails:Performance[]
}

export class Performance {
  public performanceId:string;
  public performanceName:string;
  public price:string;
  public maxCapacities:number;
  public userDetail:UserDetail[]
}


export class UserDetail{
  public id:string;
  public userName:string;
  public userSeat:string;
  public rezervationDate:string;
  public noExpire:boolean;
  public expirationDate:string;
  public userPhone:string;

};

@Component({
  selector: 'app-basket-detail',
  templateUrl: './basket-detail.component.html',
  styleUrls: ['./basket-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasketDetailComponent implements OnInit {
  basketItem: Event[] = [
    {
        eventId:"45678AdERs",
        eventName:"BOMONTİ ADA",
        eventSeatsCanBeUpdate:true,
        eventDetails:[{
          performanceId:"144578974",
          performanceName:"Katatonia",
          maxCapacities:26,
          price:"12,10",
          userDetail:[{
              id:"Xyz789",
              userName:"Hakan Hüriyet",
              userSeat:"25A",
              rezervationDate:"2016-12-29T07:32:00.053Z",
              noExpire:true,
              expirationDate:"2016-12-29T07:32:00.053Z",
              userPhone:"5554546789"
              },
              {
              id:"7897465",
              userName:"Osman Orhan",
              userSeat:"26A",
              rezervationDate:"2016-12-29T07:32:00.053Z",
              noExpire:true,
              expirationDate:"2016-12-29T07:32:00.053Z",
              userPhone:"5554546789"
              },
              {
              id:"23234343",
              userName:"Coşkun Baltacı",
              userSeat:"27A",
              rezervationDate:"2016-12-29T07:32:00.053Z",
              noExpire:false,
              expirationDate:"2016-12-29T07:32:00.053Z",
              userPhone:"5554546789"
              }
              ],

        }],
    },
      {
        eventId:"45678AdER",
        eventName:"BOMONTİ ADA",
        eventSeatsCanBeUpdate:true,
        eventDetails:[{
          performanceId:"78945789",
          performanceName:"Katatonia",
          maxCapacities:23,
          price:"12,10",
          userDetail:[{
              id:"Xyz789",
              userName:"Hakan Hüriyet",
              userSeat:"25A",
              rezervationDate:"2016-12-29T07:32:00.053Z",
              noExpire:true,
              expirationDate:"2016-12-29T07:32:00.053Z",
              userPhone:"5554546789"
              },
              {
              id:"7897465",
              userName:"Osman Orhan",
              userSeat:"26A",
              rezervationDate:"2016-12-29T07:32:00.053Z",
              noExpire:true,
              expirationDate:"2016-12-29T07:32:00.053Z",
              userPhone:"5554546789"
              },
              {
              id:"23234343",
              userName:"Coşkun Baltacı",
              userSeat:"27A",
              rezervationDate:"2016-12-29T07:32:00.053Z",
              noExpire:false,
              expirationDate:"2016-12-29T07:32:00.053Z",
              userPhone:"5554546789"
            }]

          }]
      }];

  veri:Observable<Array<number>>;
  public clickStatus:Array<boolean> = [];
  @Output () getTheSelectedRows: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() thisRowsAreSelected: Array<any>;
  public selectBoxOptions:Array<any> = [];
  public itemCollector:Array<any> = [];
  constructor() {

  }

  timeBomb(event:any){
    this.getTheSelectedRows.emit(event);
  }


  ngOnInit() {
    this.setOptions();
  }
  ngOnChanges(){
    console.log("onchanges" + this.itemCollector);
    return this.itemCollector
  }
  selectItem(event:any,rowIndex){
    /**
     * @return Array<boolean>
     */
    this.clickStatus[event] = !this.clickStatus[event];

    /**
     * @return Array
     */

    if(this.itemCollector.map(el => el).indexOf(event) === -1 )
    {
      this.itemCollector.push(event);
    }
    else
    {
      this.itemCollector.splice(event,1).sort();
    }
    return this.itemCollector.sort();

  }
  /**
   * Seppetten SelectBox Verisine Göre  Koltuk Silme
   * @return number
   */
  removeEventFromBasket(thisIndex){
    if(this.getArrayIndex(thisIndex) == -1) {
      console.log("Böyle ir index yok");
    }
    else {
       this.basketItem.splice(this.getArrayIndex(thisIndex),1);
    }
  }

  /**
   * Kapasite Sayısına Göre Selectboxa Bilet Adedi Ekliyor
   * @return Array
   */
  setOptions() {
  for (var i = 0; i < this.basketItem[1]['eventDetails'][0]['maxCapacities']; i++) {
     this.selectBoxOptions.push({"value":i+1,"text":i + 1 +' Adet'});
   }
   return this.selectBoxOptions
  }

  /**
   * SelectBox Optionsın Kaç Adet Olacağını Selectbox Komponentine gönderiyor
   * @return Array
   */
  getOptions()
  {
   return this.selectBoxOptions;

  }
  sumPrice(price:string) {
    console.log(price);
  }

  /**
   * Arrayın Indexi alınıyor
   * @return number
   */
  getArrayIndex(value:string){
    return this.basketItem.map(el => el.eventId).indexOf(value);
  }

  /**
   * Bilet Koltuk Ekliyor
   */
  addOrRemoveUser(quantity:number,pushToThisEvent){
    let basketIndex = this.getArrayIndex(pushToThisEvent);

    // Seçilen Adet ile Mevcut Adet Farkları işleniyor.
    if(this.basketItem[basketIndex]['eventDetails'][0]['userDetail'].length < quantity)
    {
      // Mevcut Adedin üzerine Seçilen ile arasında ki fark kadar ürün ekleniyor.
      for (var i = this.basketItem[basketIndex]['eventDetails'][0]['userDetail'].length; i < quantity; i++)
      {
        // Dummy Veri Ekliyor
        this.basketItem[basketIndex]['eventDetails'][0]['userDetail'].push(
        {
                  id:"qwqw232",
                  userName:"Samantha Fox",
                  userSeat:"35C",
                  rezervationDate:"2016-12-29T07:32:00.053Z",
                  noExpire:true,
                  expirationDate:"2016-12-29T07:32:00.053Z",
                  userPhone:"5554546789"

        });
      }
    }
    else
    {

      /**
       * Sepetten Kayıt Silme
       * @return Array
       */

      this.basketItem[basketIndex]['eventDetails'][0]['userDetail'].splice(quantity,this.basketItem[basketIndex]['eventDetails'][0]['userDetail'].length - quantity );
    }
  }

}
