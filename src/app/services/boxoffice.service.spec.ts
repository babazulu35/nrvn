import { TestBed, inject } from '@angular/core/testing';

import { BoxofficeService } from './boxoffice.service';

describe('BoxofficeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoxofficeService]
    });
  });

  it('should be created', inject([BoxofficeService], (service: BoxofficeService) => {
    expect(service).toBeTruthy();
  }));
});
