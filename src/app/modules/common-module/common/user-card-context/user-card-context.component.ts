import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { TetherDialog } from '../../modules/tether-dialog/tether-dialog';

@Component({
  selector: 'app-user-card-context',
  templateUrl: './user-card-context.component.html',
  styleUrls: ['./user-card-context.component.scss']
})
export class UserCardContextComponent implements OnInit {

  @HostBinding('class.c-usercard-context__view') true;
  @Output() actionEvent: EventEmitter<Object> = new EventEmitter();
  @Input() name:string;
  @Input() surname:string;
  @Input() phone:string;
  @Input() crmMemberId:number;
  @Input() isLoading:boolean = true;
  @Input() hasEntityModel:boolean = true;
  @Input() isAnonymous:boolean;
  fullname:string;
 
  constructor(public tetherService: TetherDialog) { }

  ngOnInit() {

    
  }



  callAction(item):void {
    try{
      this.tetherService.close(item);
    }catch(error) {
      console.log("tetherService aktif değil");
    }
    this.actionEvent.emit(item);
  }  

  avatarLetter(val,val2) {
    let fullname = val + '' + val2
    return fullname.charAt(0);
  }

}
