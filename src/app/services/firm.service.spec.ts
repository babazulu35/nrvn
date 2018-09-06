/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FirmService } from './firm.service';

describe('Service: Firm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FirmService]
    });
  });

  it('should ...', inject([FirmService], (service: FirmService) => {
    expect(service).toBeTruthy();
  }));
});
