import { TestBed, inject } from '@angular/core/testing';

import { MulitplePerformanceService } from './mulitple-performance.service';

describe('MulitplePerformanceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MulitplePerformanceService]
    });
  });

  it('should be created', inject([MulitplePerformanceService], (service: MulitplePerformanceService) => {
    expect(service).toBeTruthy();
  }));
});
