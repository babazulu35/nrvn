import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-wizard-header',
  templateUrl: './page-wizard-header.component.html',
  styleUrls: ['./page-wizard-header.component.scss']
})
export class PageWizardHeaderComponent implements OnInit {
  @HostBinding('class.c-page-wizard-header') true;

  @Output() changeEvent: EventEmitter<{currentLevel: any, levels: any}> = new EventEmitter();

  @Input() levels: Level[];

  @Input('currentLevel') set setCurrentLevelByKey(key: string){
    let existLevel = this.levels.find( item => item.key == key);
    let index = this.levels.indexOf(existLevel);
    this.currentIndex = index;
    //this.currentLevel = this.levels[this.currentIndex];
  }

  get currentLevel(): Level { return this.levels ? this.levels[this.currentIndex] : null}

  @Input() hasAction: boolean;

  status: string;

  // currentLevel: Level;
  currentIndex: number = 0;

  constructor() { 
    
  }

  ngOnInit() {}

  getLevelStatus(level:any) {
    let index = this.levels.indexOf(level);
    let status: string = "active";
    if(index < this.currentIndex) status = "prev";
    if(index > this.currentIndex) status = "next";
    return status;
  }

  itemClickHandler(level: Level) {
    if(!level || level.isDisabled || !level.hasAction) return;
    this.setCurrentLevelByKey = level.key;
    this.changeEvent.emit({currentLevel: this.currentLevel, levels: this.levels});
  }

}

class Level {
  key: string;
  label: string;
  icon?: string;
  hasError?: boolean;
  hasAction?: boolean;
  isDisabled?: boolean;
}