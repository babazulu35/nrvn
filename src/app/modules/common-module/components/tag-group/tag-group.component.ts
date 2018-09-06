import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tag-group',
  templateUrl: './tag-group.component.html',
  styleUrls: ['./tag-group.component.scss']
})
export class TagGroupComponent implements OnInit {
  @HostBinding('class.c-tag-group') true;

  @Output() actionEvent:EventEmitter<{action: string, data?: any}> = new EventEmitter();
  @Output() changeEvent:EventEmitter<{name: string, label: string, type?: any, params?: any}[]> = new EventEmitter();

  @HostBinding('class.c-tag-group--primary') 
  isPrimary: boolean;

  @HostBinding('class.c-tag-group--secondary') 
  isSecondary: boolean;

  @Input() tags: {name: string, label: string, type?: any, params?: any}[];
  @Input() canBeDeleted: boolean = true;

 
  
  @Input() set theme(value: string) {
    this.isPrimary = value == "primary";
    this.isSecondary = value == "secondary";
    
  }

  constructor() { }

  ngOnInit() {
    
  }

  removeTag(tag){
    this.tags.splice(this.tags.indexOf(tag), 1);
    this.actionEvent.emit({action: 'remove', data: tag});
    this.changeEvent.emit(this.tags);
  }

}
