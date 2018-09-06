/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GeneratePdfService } from './generate-pdf.service';

describe('GeneratePdfService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeneratePdfService]
    });
  });

  it('should ...', inject([GeneratePdfService], (service: GeneratePdfService) => {
    expect(service).toBeTruthy();
  }));
});
