/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PerformerService } from './performer.service';

describe('Service: Performer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PerformerService]
    });
  });

  it('should ...', inject([PerformerService], (service: PerformerService) => {
    expect(service).toBeTruthy();
  }));
});
