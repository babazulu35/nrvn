import { TestBed, inject } from '@angular/core/testing';

import { RefreshStateService } from './refresh-state.service';

describe('RefreshStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RefreshStateService]
    });
  });

  it('should be created', inject([RefreshStateService], (service: RefreshStateService) => {
    expect(service).toBeTruthy();
  }));
});
