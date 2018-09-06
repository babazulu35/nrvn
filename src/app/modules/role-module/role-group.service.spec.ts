import { TestBed, inject } from '@angular/core/testing';

import { RoleGroupService } from './role-group.service';

describe('RoleGroupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoleGroupService]
    });
  });

  it('should be created', inject([RoleGroupService], (service: RoleGroupService) => {
    expect(service).toBeTruthy();
  }));
});
