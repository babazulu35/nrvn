/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TownService } from './town.service';

describe('Service: Town', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TownService]
    });
  });

  it('should ...', inject([TownService], (service: TownService) => {
    expect(service).toBeTruthy();
  }));
});
