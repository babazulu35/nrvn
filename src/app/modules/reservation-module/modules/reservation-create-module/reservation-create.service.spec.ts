import { TestBed, inject } from '@angular/core/testing';

import { ReservationCreateService } from './reservation-create.service';

describe('ReservationCreateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReservationCreateService]
    });
  });

  it('should be created', inject([ReservationCreateService], (service: ReservationCreateService) => {
    expect(service).toBeTruthy();
  }));
});
