/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { VenueSelectBarComponent } from './venue-select-bar.component';

describe('VenueSelectBarComponent', () => {
  let component: VenueSelectBarComponent;
  let fixture: ComponentFixture<VenueSelectBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VenueSelectBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VenueSelectBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
