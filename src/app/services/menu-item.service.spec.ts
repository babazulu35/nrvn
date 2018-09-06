/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MenuItemService } from './menu-item.service';

describe('MenuItemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MenuItemService]
    });
  });

  it('should ...', inject([MenuItemService], (service: MenuItemService) => {
    expect(service).toBeTruthy();
  }));
});
