/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GenericDataService } from './generic-data.service';

describe('Service: GenericData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GenericDataService]
    });
  });

  it('should ...', inject([GenericDataService], (service: GenericDataService) => {
    expect(service).toBeTruthy();
  }));
});
