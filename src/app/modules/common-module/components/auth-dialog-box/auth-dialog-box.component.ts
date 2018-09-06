import { Component, OnInit, HostBinding, Input, Output, Injector, EventEmitter, HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-auth-dialog-box',
  templateUrl: './auth-dialog-box.component.html',
  styleUrls: ['./auth-dialog-box.component.scss']
})
export class AuthDialogBoxComponent implements OnInit {
  @HostBinding('class.c-auth-dialog-box') true;
  @HostListener('keyup.enter') clickHandler(){
    this.submit();
  };

  @Output() submitEvent: EventEmitter<any> = new EventEmitter();

  @Input() headerLogo: string;
  @Input() headerBackgroundColor: string;
  @Input() alert: {type: string, title: string, description: string};
  @Input() authForm: FormGroup;

  submitted: boolean;

  constructor() {
    this.authForm = new FormGroup({});
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    if(this.authForm) this.authForm = null;
  }

  reset() {
    this.authForm.reset();
    this.authForm.enable();
  }

  submit() {
    if(this.authForm.disabled) return;
    this.submitted = true;
    //this.authForm.disable();
    this.submitEvent.emit(this.authForm.value);
  }

}
