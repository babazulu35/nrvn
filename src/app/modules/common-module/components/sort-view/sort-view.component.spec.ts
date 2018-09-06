/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SortViewComponent } from './sort-view.component';

describe('SortViewComponent', () => {
  let component: SortViewComponent;
  let fixture: ComponentFixture<SortViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SortViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
