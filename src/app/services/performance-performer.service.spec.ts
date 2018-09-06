/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PerformancePerformerService } from './performance-performer.service';

describe('Service: PerformancePerformer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PerformancePerformerService]
    });
  });

  it('should ...', inject([PerformancePerformerService], (service: PerformancePerformerService) => {
    expect(service).toBeTruthy();
  }));
});
