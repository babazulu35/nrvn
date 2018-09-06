import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductItemLineBoxofficeComponent } from './product-item-line-boxoffice.component';

describe('ProductItemLineBoxofficeComponent', () => {
  let component: ProductItemLineBoxofficeComponent;
  let fixture: ComponentFixture<ProductItemLineBoxofficeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductItemLineBoxofficeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductItemLineBoxofficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
