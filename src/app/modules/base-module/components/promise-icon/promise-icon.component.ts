import { Component, OnInit, HostBinding, Input, ElementRef, ViewChildren, Renderer } from '@angular/core';

@Component({
  selector: 'app-promise-icon',
  templateUrl: './promise-icon.component.html',
  styleUrls: ['./promise-icon.component.scss']
})
export class PromiseIconComponent implements OnInit {
  @ViewChildren('blade') blades:ElementRef[];

  @HostBinding("class.c-promise-icon") true;
  @HostBinding('class.c-promise-icon--sm') get isSmall():boolean { return this.size == 'sm'};
  @HostBinding('class.c-promise-icon--lg') get isLarge():boolean { return this.size == 'lg'};
  @HostBinding('class.c-promise-icon--xl') get isXLarge():boolean { return this.size == 'xl'};
  @HostBinding('class.c-promise-icon--autosize') get isAutosize():boolean { return this.size == 'autosize'};

  @HostBinding('class.c-promise-icon--primary') isPrimary: boolean;
  @HostBinding('class.c-promise-icon--secondary') isSecondary: boolean;
  @HostBinding('class.c-promise-icon--danger') isDanger: boolean;
  @HostBinding('class.c-promise-icon--light') isLight: boolean;
  @HostBinding('class.c-promise-icon--warning') isWarning: boolean;

  @HostBinding("class.c-promise-icon--promise")
  @Input() isPromising: boolean = false;

  @Input() iconName: string;

  @Input() size: string;
  @Input() set color(value: string) {
    this.iconColor = value;
    if(!this.blades || this.blades.length == 0) return;
    this.renderer.setElementStyle(this.element.nativeElement, 'color', this.iconColor);
    this.blades.forEach( blade => this.renderer.setElementStyle(blade.nativeElement, 'background-color', this.iconColor));
  }

  @Input() set theme(value: string){
    this.iconTheme = value;
    this.isPrimary = this.iconTheme == "primary";
    this.isSecondary = this.iconTheme == "secondary";
    this.isDanger = this.iconTheme == "danger";
    this.isLight = this.iconTheme == "light";
    this.isWarning = this.iconTheme == "warning";
  }

  iconColor: string;
  private iconTheme: string;

  constructor(
    private renderer: Renderer,
    private element: ElementRef
  ) {  }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    if(this.iconColor) this.color = this.iconColor;
  }

  public toggle() {
    this.isPromising = !this.isPromising;
  }

}
