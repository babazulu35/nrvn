/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EventVisitDataComponent } from './event-visit-data.component';

describe('EventVisitDataComponent', () => {
  let component: EventVisitDataComponent;
  let fixture: ComponentFixture<EventVisitDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventVisitDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventVisitDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
