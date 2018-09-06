/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EntityTypeService } from './entity-type.service';

describe('EntityTypeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityTypeService]
    });
  });

  it('should ...', inject([EntityTypeService], (service: EntityTypeService) => {
    expect(service).toBeTruthy();
  }));
});
