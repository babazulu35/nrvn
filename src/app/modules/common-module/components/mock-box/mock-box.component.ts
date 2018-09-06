import { Component, OnInit, HostBinding, Input, Renderer, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-mock-box',
  //templateUrl: './mock-box.component.html',
  //styleUrls: ['./mock-box.component.scss']
  template: `
    <style>
      .c-mock-box {
        display: inline-block;
        width: 100%;
        height: auto;
        min-height: 36px;
        min-width: 60px;

        padding: 1em 1.5em 0.75em;
        background-color: #f7f7f7;
        color: #3d3d3d;

        h1 {
            font-size: 22px;
        }
        p {
            font-size: 14px;
        }
      }
    </style>
    <div #box class="c-mock-box">
      <h1 *ngIf='title' [innerHTML]='title'></h1>
      <p *ngIf='description' [innerHTML]='description'></p>
    </div>
  `
})
export class MockBoxComponent implements OnInit {
  @ViewChild('box') box: ElementRef;

  @Input() title: string;
  @Input() description: string;
  
  @Input() 
  set width(value: string) {
    this.renderer.setElementStyle(this.box.nativeElement, 'width', value);
  };
  
  @Input()
  set height(value: string) {
    this.renderer.setElementStyle(this.box.nativeElement, 'height', value);
  };

  @Input() 
  set color(value: string) {
    this.renderer.setElementStyle(this.box.nativeElement, 'color', value);
  };
  
  @Input() 
  set backgroundColor(value: string) {
    this.renderer.setElementStyle(this.box.nativeElement, 'background-color', value);
  };

  constructor(
    private elementRef: ElementRef, 
    private renderer: Renderer
  ) { }

  ngOnInit() {
  }

}
