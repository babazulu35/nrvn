/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CrmAnonymousUserService } from './crm-anonymous-user.service';

describe('CrmAnonymousUserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CrmAnonymousUserService]
    });
  });

  it('should ...', inject([CrmAnonymousUserService], (service: CrmAnonymousUserService) => {
    expect(service).toBeTruthy();
  }));
});
