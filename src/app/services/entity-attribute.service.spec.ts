/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EntityAttributeService } from './entity-attribute.service';

describe('EntityAttributeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityAttributeService]
    });
  });

  it('should ...', inject([EntityAttributeService], (service: EntityAttributeService) => {
    expect(service).toBeTruthy();
  }));
});
