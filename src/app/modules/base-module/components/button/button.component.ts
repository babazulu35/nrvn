import { Component, OnInit, HostBinding, Input, ChangeDetectorRef, HostListener, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {

  buttonTheme: string;

  @Input() type = 'button';
  @Input() label: string;
  @Input() icon: string;

  @HostBinding('class.c-button') true;

  @HostBinding('class.c-button--primary') isPrimary: boolean;

  @HostBinding('class.c-button--secondary') isSecondary: boolean;

  @HostBinding('class.c-button--danger') isDanger: boolean;

  @HostBinding('class.c-button--light') isLight: boolean;

  @HostBinding('class.c-button--warning') isWarning: boolean;

  @HostBinding('class.c-button--icon') get isIcon(): boolean { return this.icon && this.icon.length > 0; };

  @HostBinding('class.c-button--shape') hasShape: boolean;

  @HostBinding('class.c-button--circle') isCircle: boolean;

  @HostBinding('class.c-button--rounded') isRounded: boolean;

  @HostBinding('class.c-button--full-width') isFullWidth: boolean;

  @HostBinding('class.c-button--autosize') isAutosize: boolean;

  @HostBinding('class.c-button--disabled') @Input() isDisabled: boolean;

  @HostBinding('class.c-button--promising') @Input() isPromising: boolean;

  @HostBinding('class.c-button--lg') @Input() isLg: boolean;

  @HostBinding('class.c-button--md') @Input() isMd: boolean;

  @HostBinding('class.c-button--sm') @Input() isSm: boolean;

  @HostBinding('class.c-button--xl') @Input() isXl: boolean;

  @HostBinding('class.c-button--xlg') @Input() isXlg: boolean;

  @HostBinding('class.c-button--xs') @Input() isXs: boolean;

  @Output() clickEvent: EventEmitter<any> = new EventEmitter();
  @HostListener('click', ['$event']) clickHandler(event) {
    if (!this.isDisabled && !this.isPromising) {
      this.clickEvent.emit(event);
    }
  }

  @Input()
  set theme(value: string){
    this.buttonTheme = value;
    this.isPrimary = this.buttonTheme === 'primary';
    this.isSecondary = this.buttonTheme === 'secondary';
    this.isDanger = this.buttonTheme === 'danger';
    this.isLight = this.buttonTheme === 'light';
    this.isWarning = this.buttonTheme === 'warning';
  }

  @Input()
  set shape(value: string){
    this.hasShape = value && value.length > 0;
    this.isCircle = value === 'circle';
    this.isRounded = value === 'rounded';
  }

  @Input()
  set size(value: string) {
    this.isFullWidth = value === 'full-width';
    this.isAutosize = value === 'autosize';
    this.isLg = value === 'lg';
    this.isMd = value === 'md';
    this.isSm = value === 'sm';
    this.isXl = value === 'xl';
    this.isXs = value === 'xs';
    this.isXlg = value === 'xlg';
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    if (!this.buttonTheme) this.theme = 'primary';
    this.changeDetector.detectChanges();
  }

}
