import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelativeProductPriceBlockComponent } from './relative-product-price-block.component';

describe('RelativeProductPriceBlockComponent', () => {
  let component: RelativeProductPriceBlockComponent;
  let fixture: ComponentFixture<RelativeProductPriceBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelativeProductPriceBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelativeProductPriceBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
