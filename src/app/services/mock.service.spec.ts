/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MockService } from './mock.service';

describe('Service: Mock', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockService]
    });
  });

  it('should ...', inject([MockService], (service: MockService) => {
    expect(service).toBeTruthy();
  }));
});
