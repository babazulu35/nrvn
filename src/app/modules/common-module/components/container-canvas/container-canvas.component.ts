import { Component, OnInit, HostBinding, Input, Renderer, ElementRef } from '@angular/core';

@Component({
  selector: 'app-container-canvas',
  templateUrl: './container-canvas.component.html',
  styleUrls: ['./container-canvas.component.scss']
})
export class ContainerCanvasComponent implements OnInit {
  @HostBinding('class.c-container-canvas') true;
  
  @HostBinding('class.c-container-canvas--empty') 
  @Input() isEmpty: boolean = false;

  @HostBinding('class.c-container-canvas--footer') isFooter: boolean;
  @HostBinding('class.c-container-canvas--header') isHeader: boolean;

  @Input() set type(value: string) {
    this.isFooter = value == "footer";
    this.isHeader = value == "header";
  }

  @Input() set textAlign(value: string) {
    this.renderer.setElementStyle(this.element.nativeElement, 'text-align', value);
  }

  @Input() set backgroundColor(value: string) {
    this.renderer.setElementStyle(this.element.nativeElement, 'background-color', '#'+value);
  }

  constructor(
    private renderer: Renderer,
    private element: ElementRef
  ) { }
  
  ngOnInit() {
    
  }


  

}
