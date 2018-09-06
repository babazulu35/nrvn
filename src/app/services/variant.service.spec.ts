/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VariantService } from './variant.service';

describe('VariantService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VariantService]
    });
  });

  it('should ...', inject([VariantService], (service: VariantService) => {
    expect(service).toBeTruthy();
  }));
});
