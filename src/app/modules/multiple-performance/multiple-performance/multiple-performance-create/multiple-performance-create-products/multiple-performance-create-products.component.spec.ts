import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePerformanceCreateProductsComponent } from './multiple-performance-create-products.component';

describe('MultiplePerformanceCreateProductsComponent', () => {
  let component: MultiplePerformanceCreateProductsComponent;
  let fixture: ComponentFixture<MultiplePerformanceCreateProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiplePerformanceCreateProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplePerformanceCreateProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
