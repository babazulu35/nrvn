/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TicketForwardingService } from './ticket-forwarding.service';

describe('TicketForwardingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TicketForwardingService]
    });
  });

  it('should ...', inject([TicketForwardingService], (service: TicketForwardingService) => {
    expect(service).toBeTruthy();
  }));
});
