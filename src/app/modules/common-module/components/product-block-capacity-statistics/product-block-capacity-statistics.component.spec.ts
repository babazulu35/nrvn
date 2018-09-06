import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBlockCapacityStatisticsComponent } from './product-block-capacity-statistics.component';

describe('ProductBlockCapacityStatisticsComponent', () => {
  let component: ProductBlockCapacityStatisticsComponent;
  let fixture: ComponentFixture<ProductBlockCapacityStatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductBlockCapacityStatisticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductBlockCapacityStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
