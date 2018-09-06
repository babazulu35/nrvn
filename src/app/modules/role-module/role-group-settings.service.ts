import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';

@Injectable()
export class RoleGroupSettingsService {
  data: BehaviorSubject<any> = new BehaviorSubject([]);
  resetData: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor() { }


  setRoleGroupSettings(roleSettings) {
    this.data.next(roleSettings);
  }

  setResetData(flag:boolean) {
    this.resetData.next(flag);
  }

}
