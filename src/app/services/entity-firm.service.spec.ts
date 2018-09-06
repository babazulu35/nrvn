/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EntityFirmService } from './entity-firm.service';

describe('EntityFirmService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityFirmService]
    });
  });

  it('should ...', inject([EntityFirmService], (service: EntityFirmService) => {
    expect(service).toBeTruthy();
  }));
});
