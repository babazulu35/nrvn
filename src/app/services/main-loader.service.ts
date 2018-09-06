import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class MainLoaderService {
  
  private isLoading:boolean;
  private isPromising:boolean;
  private isNarrowLoad:boolean;
  private isNarrowLoadSingle:boolean;

  @Output() loadingHandler = new EventEmitter<{isloading:boolean}>();

  @Output() contentLoadingHandler = new EventEmitter<{contentLoading:boolean}>();

  @Output() promisingHandler = new EventEmitter<{ispromising:boolean}>()

  @Output() narrowLoadHandler = new EventEmitter<{isnarrow:boolean}>()
  @Output() narrowLoadHandlerSingle = new EventEmitter<{isnarrowSingle:boolean}>()

  @Output() buttonStatusHandler = new EventEmitter<{isbuttonDisabled:boolean}>()
  @Output() buttonPromisingHandler = new EventEmitter<{isbuttonPromising:boolean}>()

  @Output() statusFlagHandler = new EventEmitter<{isAddDisable:boolean,isNextDisable:boolean}>();

  constructor() { }


  updateLoading(isLoading:boolean) {
     this.loadingHandler.emit({isloading:isLoading}); 
  }

  updatePromising(isPromising:boolean) {
    this.promisingHandler.emit({ispromising:isPromising});
  }

  updateNarrow(isNarrowLoad:boolean) {
    this.narrowLoadHandler.emit({isnarrow:isNarrowLoad});
  }

  updateNarrowSingle(isNarrowLoadSingle:boolean) {
    this.narrowLoadHandlerSingle.emit({isnarrowSingle:isNarrowLoadSingle});
  }

  updateButtonStatus(isButtonDisabled:boolean) {
    this.buttonStatusHandler.emit({isbuttonDisabled: isButtonDisabled});
  }
  updateButtonPromising(isButtonPromis:boolean) {
    this.buttonPromisingHandler.emit({isbuttonPromising: isButtonPromis});
  }  

  updateFlagStatus(isAddDisable:boolean,isNextDisable:boolean) {
    this.statusFlagHandler.emit({isAddDisable:isAddDisable,isNextDisable:isNextDisable});
  }

  updateContentStatus(contentLoading:boolean) {
    this.contentLoadingHandler.emit({contentLoading:contentLoading});
  }

 getLoadingStatus() {
    return this.isLoading;
  }

  getNarrowLoadingStatus() {
    return this.isNarrowLoad;
  }
  
}
