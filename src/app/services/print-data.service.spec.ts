import { TestBed, inject } from '@angular/core/testing';

import { PrintDataService } from './print-data.service';

describe('PrintDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrintDataService]
    });
  });

  it('should be created', inject([PrintDataService], (service: PrintDataService) => {
    expect(service).toBeTruthy();
  }));
});
