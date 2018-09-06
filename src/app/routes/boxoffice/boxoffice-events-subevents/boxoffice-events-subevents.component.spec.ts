/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BoxofficeEventsSubeventsComponent } from './boxoffice-events-subevents.component';

describe('BoxofficeEventsSubeventsComponent', () => {
  let component: BoxofficeEventsSubeventsComponent;
  let fixture: ComponentFixture<BoxofficeEventsSubeventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxofficeEventsSubeventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxofficeEventsSubeventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
