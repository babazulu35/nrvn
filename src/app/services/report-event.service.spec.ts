import { TestBed, inject } from '@angular/core/testing';

import { ReportEventService } from './report-event.service';

describe('ReportEventService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportEventService]
    });
  });

  it('should be created', inject([ReportEventService], (service: ReportEventService) => {
    expect(service).toBeTruthy();
  }));
});
