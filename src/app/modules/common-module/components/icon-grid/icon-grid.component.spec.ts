/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IconGridComponent } from './icon-grid.component';

describe('IconGridComponent', () => {
  let component: IconGridComponent;
  let fixture: ComponentFixture<IconGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
