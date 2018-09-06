import { TestBed, inject } from '@angular/core/testing';

import { SalesChannelPaymentTypeService } from './sales-channel-payment-type.service';

describe('SalesChannelPaymentTypeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SalesChannelPaymentTypeService]
    });
  });

  it('should be created', inject([SalesChannelPaymentTypeService], (service: SalesChannelPaymentTypeService) => {
    expect(service).toBeTruthy();
  }));
});
