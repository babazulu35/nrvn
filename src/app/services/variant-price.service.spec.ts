/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VariantPriceService } from './variant-price.service';

describe('VariantPriceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VariantPriceService]
    });
  });

  it('should ...', inject([VariantPriceService], (service: VariantPriceService) => {
    expect(service).toBeTruthy();
  }));
});
