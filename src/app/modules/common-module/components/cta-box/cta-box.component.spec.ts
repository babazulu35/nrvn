/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CtaBoxComponent } from './cta-box.component';

describe('CtaBoxComponent', () => {
  let component: CtaBoxComponent;
  let fixture: ComponentFixture<CtaBoxComponent>;

  beforeEach(async(() => { 
    TestBed.configureTestingModule({
      declarations: [ CtaBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtaBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
