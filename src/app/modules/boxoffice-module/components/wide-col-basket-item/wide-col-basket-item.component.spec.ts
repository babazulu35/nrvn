/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WideColBasketItemComponent } from './wide-col-basket-item.component';

describe('WideColBasketItemComponent', () => {
  let component: WideColBasketItemComponent;
  let fixture: ComponentFixture<WideColBasketItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WideColBasketItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WideColBasketItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
