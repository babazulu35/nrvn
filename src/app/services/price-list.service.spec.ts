/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PriceListService } from './price-list.service';

describe('PriceListService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PriceListService]
    });
  });

  it('should ...', inject([PriceListService], (service: PriceListService) => {
    expect(service).toBeTruthy();
  }));
});
