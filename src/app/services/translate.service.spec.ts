/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TranslateService } from './translate.service';

describe('TranslateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranslateService]
    });
  });

  it('should ...', inject([TranslateService], (service: TranslateService) => {
    expect(service).toBeTruthy();
  }));
});
