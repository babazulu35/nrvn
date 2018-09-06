/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PerformanceProductService } from './performance-product.service';

describe('PerformanceProductService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PerformanceProductService]
    });
  });

  it('should ...', inject([PerformanceProductService], (service: PerformanceProductService) => {
    expect(service).toBeTruthy();
  }));
});
