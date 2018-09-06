import { Component, OnInit, HostBinding, ContentChild, ElementRef, Renderer, Input } from '@angular/core';

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.scss']
})
export class DialogBoxComponent implements OnInit {
  @HostBinding('class.c-dialog-box') true;

  @ContentChild('header')
  header:ElementRef;

  @ContentChild('body')
  body:ElementRef;

  @ContentChild('footer')
  footer:ElementRef;
  
  @HostBinding('class.main-loader')
  @Input() isLoading: boolean;
  
  constructor(
    private renderer:Renderer
  ) { }

  ngOnInit() {
    
  }

  ngAfterViewChecked(){
    this.position();
  }

  public position(){
    if(this.body) {
      let stickyHeight:number = 0;
      if(this.header) stickyHeight += this.header.nativeElement.offsetHeight;
      if(this.footer) stickyHeight += this.footer.nativeElement.offsetHeight;

      this.renderer.setElementStyle(this.body.nativeElement, "height", (this.body.nativeElement.offsetParent.offsetHeight - stickyHeight) + "px");
    }
  }

}
