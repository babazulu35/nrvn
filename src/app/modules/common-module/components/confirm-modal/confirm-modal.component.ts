import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { Component, OnInit, HostBinding, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {
  @HostBinding('class.c-confirm-modal') true;

  @Input() title: string;
  @Input() description: string;
  @Input() image: string;
  @Input() confirmButton: {label: string, type?: string, theme?:string};
  @Input() dismissButton: {label: string, type?: string, theme?:string};
  @Input() feedback: {label: string, placeholder?: string, value?: string, required?: boolean};
  
  @Input() set showCloseButton(value:boolean) {
    if( typeof value === 'boolean')
      {
        this.showButton = value;
      }
      else
        {
          this.showButton = true;
        }
  }
  get buttonStatus():boolean {
    return this.showButton;
  }

  @Input() set timer(value: number) {
    if(value) {
      this.remainingTime = value;
      let self = this;
      this.intervalId = setInterval(function(){
        self.remainingTime--;
        if(self.remainingTime == 0) self.tether.dismiss(null);
      }, 1000);
    }else{
      clearInterval(this.intervalId);
    }
  }

  get formattedRemainingTime():string {
    return this.remainingTime < 10 ? "0"+this.remainingTime : this.remainingTime.toString();
  }

  intervalId: any;
  remainingTime: number;
  showButton:boolean = true;

  constructor(
    public tether: TetherDialog
  ) { }

  ngOnInit() {
  }

  confirm() {
    this.tether.close({
      feedback: this.feedback ? this.feedback.value : null
    })
  }

}
