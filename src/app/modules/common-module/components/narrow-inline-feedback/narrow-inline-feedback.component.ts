import { Component, OnInit, HostBinding, Input,ChangeDetectionStrategy,ElementRef,ViewChild } from '@angular/core';

@Component({
  selector: 'app-narrow-inline-feedback',
  templateUrl: './narrow-inline-feedback.component.html',
  styleUrls: ['./narrow-inline-feedback.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class NarrowInlineFeedbackComponent implements OnInit {
  @ViewChild('allowHtmlTagsOnTitle') allowHtmlTagsOnTitle: ElementRef;
  @ViewChild('allowHtmlTagsOnDescription') allowHtmlTagsOnDescription: ElementRef;
  @HostBinding('class.c-narrow-inline-feedback') true; 
  
  @Input() 
  iconName: string;

  @Input() 
  countValue: number;

  @HostBinding('class.c-narrow-inline-feedback__side') 
  @Input()
  isInSide: boolean = false;
  
  @Input()
  title: string;

  @Input()
  description: string;

  @Input()
  iconAngle: number;

  get iconAngleClass():string {
  	return "icon__n--" + this.iconAngle;
  }
  get iconNameClass():string {
    return this.iconName;
  }

  constructor() { }

  ngOnInit() {
    this.allowHtmlTagsOnTitle.nativeElement.innerHTML = this.title;
    this.allowHtmlTagsOnDescription.nativeElement.innerHTML = this.description;
  }

}
