import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPillGroupComponent } from './product-pill-group.component';

describe('ProductPillGroupComponent', () => {
  let component: ProductPillGroupComponent;
  let fixture: ComponentFixture<ProductPillGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductPillGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductPillGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
