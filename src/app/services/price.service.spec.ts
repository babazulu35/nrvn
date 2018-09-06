/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PriceService } from './price.service';

describe('Service: Price', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PriceService]
    });
  });

  it('should ...', inject([PriceService], (service: PriceService) => {
    expect(service).toBeTruthy();
  }));
});
