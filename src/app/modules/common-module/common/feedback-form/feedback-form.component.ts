import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { Component, OnInit,Output,Input,EventEmitter,ElementRef,ViewChild } from '@angular/core';

@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss']
})
export class FeedbackFormComponent implements OnInit {
  public _tetherService: TetherDialog;
  public confirm:boolean = false;
  public feedback:boolean = false;
  public isvalid:boolean = true;
  public get tetherService():TetherDialog {
    return this._tetherService;
  }
  @ViewChild('feedbackForm') textarea: ElementRef;
  @Output() onFeedBackSend: EventEmitter<any> = new EventEmitter();
  @Input() data: {}[];
  public modalType: string;
  constructor(_tetherService: TetherDialog) {
    this._tetherService= _tetherService;
   }

   get items(): {}[] {
     return this.data;
   }
  ngOnInit() {
     this.data.filter( item => {
       this.modalType = item['type'];
     });    
     switch(this.modalType) {
       case("confirm"):
        this.confirm = true;
       break;
       case("feedback"):
         this.feedback = true;
     }
  }
  sendFeed($event,action?:Array<Object>) {
    
    if(action['action'] == 'send' && this.modalType == 'feedback') {
      if(action['textarea'] == '' || action['textarea'] == 'undefined') {
        this.isvalid = false;
      }
      else {
        this.isvalid = true;
        this.onFeedBackSend.emit({
            modalType:this.modalType, // Sadece kontrol amaçlı eklendi gerekli değildir
            feedbackText: action['textarea']
        })          
      }
    }
    else if(action['action'] == 'send' && this.modalType == 'confirm') {
        this.onFeedBackSend.emit({
            modalType: this.modalType, // Sadece kontrol amaçlı eklendi gerekli değildir
            confirmed: true
        })   
    }
    else if(action['action'] == 'cancel') {
      this.tetherService.dismiss('Cancel Button Clicked');
    }

  }

}
