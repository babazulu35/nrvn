import { TestBed, inject } from '@angular/core/testing';

import { CmsDataService } from './cms-data.service';

describe('CmsDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CmsDataService]
    });
  });

  it('should be created', inject([CmsDataService], (service: CmsDataService) => {
    expect(service).toBeTruthy();
  }));
});
