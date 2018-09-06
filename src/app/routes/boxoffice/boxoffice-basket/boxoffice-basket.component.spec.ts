import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxofficeBasketComponent } from './boxoffice-basket.component';

describe('BoxofficeBasketComponent', () => {
  let component: BoxofficeBasketComponent;
  let fixture: ComponentFixture<BoxofficeBasketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxofficeBasketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxofficeBasketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
