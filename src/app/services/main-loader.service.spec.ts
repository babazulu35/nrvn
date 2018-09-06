/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MainLoaderService } from './main-loader.service';

describe('MainLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MainLoaderService]
    });
  });

  it('should ...', inject([MainLoaderService], (service: MainLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
