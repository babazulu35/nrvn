import { TestBed, inject } from '@angular/core/testing';

import { ReportPerformanceService } from './report-performance.service';

describe('ReportPerformanceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportPerformanceService]
    });
  });

  it('should be created', inject([ReportPerformanceService], (service: ReportPerformanceService) => {
    expect(service).toBeTruthy();
  }));
});
