/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VenueSeatService } from './venue-seat.service';

describe('VenueSeatService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VenueSeatService]
    });
  });

  it('should ...', inject([VenueSeatService], (service: VenueSeatService) => {
    expect(service).toBeTruthy();
  }));
});
