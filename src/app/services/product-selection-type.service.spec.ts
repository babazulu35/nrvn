/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProductSelectionTypeService } from './product-selection-type.service';

describe('ProductSelectionTypeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductSelectionTypeService]
    });
  });

  it('should ...', inject([ProductSelectionTypeService], (service: ProductSelectionTypeService) => {
    expect(service).toBeTruthy();
  }));
});
