import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class RefreshStateService {
  
  @Output() refreshStateHandler = new EventEmitter<{data:any}>();
  constructor() { }

  refreshState(data) {
    this.refreshStateHandler.emit(data);
  }

}
