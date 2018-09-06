import { TestBed, inject } from '@angular/core/testing';

import { ReportParentEventService } from './report-parent-event.service';

describe('ReportParentEventService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportParentEventService]
    });
  });

  it('should be created', inject([ReportParentEventService], (service: ReportParentEventService) => {
    expect(service).toBeTruthy();
  }));
});
