import { TestBed, inject } from '@angular/core/testing';

import { RoleGroupSettingsService } from './role-group-settings.service';

describe('RoleGroupSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoleGroupSettingsService]
    });
  });

  it('should be created', inject([RoleGroupSettingsService], (service: RoleGroupSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
