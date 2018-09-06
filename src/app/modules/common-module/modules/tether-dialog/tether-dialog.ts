import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {
  Injectable
} from '@angular/core';

import { TetherOptions } from './tether-options';
import { TetherDialogComponent } from './tether-dialog.component';
import { AuthenticationService } from '../../../../services/authentication.service';

@Injectable()
export class TetherDialog {

  dialogComponent: TetherDialogComponent;
  action$: BehaviorSubject<{action: string, params?: {}}>;

  get component(){
    return this.dialogComponent;
  }

  tetherOptions: TetherOptions;

  public get isBodyLocked() {
    return this.component.isBodyLocked;
  }

  constructor(
    private authenticationService: AuthenticationService,
  ) { }

  modal(content:any, options?:{}):Promise<any> {
    this.tetherOptions = new TetherOptions("modal", options);
    return this.open(content, this.tetherOptions);
  }

  drawer(content:any, options?:{}):Promise<any> {
    this.tetherOptions = new TetherOptions("drawer", options);
    return this.open(content, this.tetherOptions);
  }

  tooltip(content:any, options?:{}):Promise<any> {
    this.tetherOptions = new TetherOptions("tooltip", options);
    return this.open(content, this.tetherOptions);
  }

  context (content: any, options?: {}): Promise<any> {
    this.tetherOptions = new TetherOptions('context', options);
    if (content['data']) {
      content['data'] = content['data'].filter(e => {
        if (e && e['role']) {
          if (this.authenticationService.roleHasAuthenticate(e['role'])) return e;
        } else {
          return e;
        }
      })
      return this.component.openContext(content, this.tetherOptions).activeDialog.promise;
    } else {
      return this.open(content, this.tetherOptions);
    }
  }

  content(content:any, options?:{}):Promise<any> {
    this.tetherOptions = new TetherOptions("content", options);
    return this.open(content, this.tetherOptions);
  }

  tether(content:any, options?:{}):Promise<any> {
    this.tetherOptions = new TetherOptions("tether", options);
    return this.open(content, this.tetherOptions);
  }

  confirm(confirmOptions: {title: string, confirmButton?: {label: string, theme?: string, type?:string}, dismissButton?: {label: string, theme?: string, type?:string}, description?: string, image?: string, feedback?: {label: string, required?: boolean}, timer?: number,showCloseButton?: boolean}, options?:any):Promise<any> {
    if(!options) options = {dialog: null, outsideClickIsActive: false};
    if(!options.dialog) options.dialog = {
        style: {
          width: "40vw",
          height: "auto",
          minHeight: "100px",
          maxWidth: "auto",
          backgroundColor: null
        }
      }
    this.tetherOptions = new TetherOptions("modal", options);
    return this.component.openConfirm(confirmOptions, this.tetherOptions).activeDialog.promise;
  }

  position() {
    if(this.component) this.component.position();
  }

  open(content:any, options:TetherOptions):Promise<any>{
    if(!this.component) {
      throw new Error("Missing tether component, add <app-tether-dialog></app-tether-dialog> on application template");
    }
    this.action$ = new BehaviorSubject({action: "open"});
    return this.component.open(content, options).activeDialog.promise;
  }

  close(result?: any): void {
    if(this.component) {
      try {
        this.component.activeDialog.resolve(result);  
      }catch(e) {
        console.log(e);
      }
      if(this.action$) this.action$.next({action: "close"});
      this.component.close();
    }
  };

  dismiss(reason?: any): void {
    if(this.component && this.component.activeDialog) {
      if(this.action$) this.action$.next({action: "dismiss"});
      if(this.component.activeDialog.settings.dismissConfirm) {
          this.dismissConfirm(reason);
      }else if(reason && reason.target == "overlay" && this.component.activeDialog.settings.overlay && this.component.activeDialog.settings.overlay.dismissConfirm) {
          this.dismissConfirm(reason);
      }else {
        if(this.component.activeDialog.reject) this.component.activeDialog.reject(reason);
        this.component.close();
      }
    }
  };

  dismissConfirm(reason?:any):void{
    if(window.confirm(this.tetherOptions.settings.dismissConfirmMessage)) {
      if(this.component) {
        if(reason && this.component.activeDialog.reject) {
          this.component.activeDialog.reject(reason);
        }
        this.component.close();
      }
    }
  };

  registerComponent(tetherDialogComponent: TetherDialogComponent) { this.dialogComponent = tetherDialogComponent;}

}