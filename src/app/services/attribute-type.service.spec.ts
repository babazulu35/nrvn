/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AttributeTypeService } from './attribute-type.service';

describe('AttributeTypeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AttributeTypeService]
    });
  });

  it('should ...', inject([AttributeTypeService], (service: AttributeTypeService) => {
    expect(service).toBeTruthy();
  }));
});
