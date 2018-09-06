import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketInfoBarComponent } from './basket-info-bar.component';

describe('BasketInfoBarComponent', () => {
  let component: BasketInfoBarComponent;
  let fixture: ComponentFixture<BasketInfoBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketInfoBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketInfoBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
