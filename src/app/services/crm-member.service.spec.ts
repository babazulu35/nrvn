/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CrmMemberService } from './crm-member.service';

describe('CrmMemberService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CrmMemberService]
    });
  });

  it('should ...', inject([CrmMemberService], (service: CrmMemberService) => {
    expect(service).toBeTruthy();
  }));
});
