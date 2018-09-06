import { TestBed, inject } from '@angular/core/testing';

import { GroupSaleService } from './group-sale.service';

describe('GroupSaleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupSaleService]
    });
  });

  it('should be created', inject([GroupSaleService], (service: GroupSaleService) => {
    expect(service).toBeTruthy();
  }));
});
