/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProductProductService } from './product-product.service';

describe('ProductProductService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductProductService]
    });
  });

  it('should ...', inject([ProductProductService], (service: ProductProductService) => {
    expect(service).toBeTruthy();
  }));
});
