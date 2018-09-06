import { Component, OnInit, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
  @HostBinding('class.c-avatar') true;

  @Input()
  size: string = 'autosize';

  @HostBinding('class.c-avatar--autosize')
  get isAutosize(){ return this.size == "autosize"; }
  
  @HostBinding('class.c-avatar--lg')
  get isLg(){ return this.size == "lg"; }
  
  @HostBinding('class.c-avatar--md')
  get isMd(){ return this.size == "md"; }
  
  @HostBinding('class.c-avatar--sm') 
  get isSm(){ return this.size == "sm"; }

  @HostBinding('class.c-avatar--circle')
  @Input() isCircle = true;

  @HostBinding('class.c-avatar--border')
  @Input() hasBorder = false;

  @HostBinding('class.c-avatar--primary') isPrimary: boolean;

  @HostBinding('class.c-avatar--secondary') isSecondary: boolean;

  @HostBinding('class.c-avatar--danger') isDanger: boolean;

  @HostBinding('class.c-avatar--light') isLight: boolean;

  @Input() source: string;

  @HostBinding('class.c-avatar--has-icon')
  get hasIcon():boolean {
    return !this.hasSource && this.iconName != null;
  }
  @Input('icon') iconName: string;

  @HostBinding('class.c-avatar--has-letters')
  get hasLetters():boolean {
    return !this.hasSource && this.letters != null;
  }
  @Input() letters: string;
  @Input() set title(value:string) {
    if(!value) return;
    let parts: string[] = value.split(" ");
    if(parts[0] && parts[1] && !this.letters) this.letters = parts[0].charAt(0).toLocaleUpperCase() + parts[1].charAt(0).toUpperCase();
    if(parts[0] && !this.letters) this.letters = parts[0].charAt(0).toUpperCase() + parts[0].charAt(1).toLocaleLowerCase();
  }
  
  get hasSource() : boolean{
  	return this.source && this.source.length > 0;
  }

  @Input() set theme(value: string){
    this.isPrimary = value == "primary";
    this.isSecondary = value == "secondary";
    this.isDanger = value == "danger";
    this.isLight = value == "light";
  }

  constructor() {
    
  }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    if(this.letters && this.iconName) this.iconName = null;
  }

  imageErrorHandler() {
    this.source = null;
  }

}
