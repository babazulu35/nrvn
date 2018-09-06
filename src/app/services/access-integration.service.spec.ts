import { TestBed, inject } from '@angular/core/testing';

import { AccessIntegrationService } from './access-integration.service';

describe('AccessIntegrationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccessIntegrationService]
    });
  });

  it('should be created', inject([AccessIntegrationService], (service: AccessIntegrationService) => {
    expect(service).toBeTruthy();
  }));
});
