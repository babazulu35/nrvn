/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SeatRelocateComponent } from './seat-relocate.component';

describe('SeatRelocateComponent', () => {
  let component: SeatRelocateComponent;
  let fixture: ComponentFixture<SeatRelocateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeatRelocateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeatRelocateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
