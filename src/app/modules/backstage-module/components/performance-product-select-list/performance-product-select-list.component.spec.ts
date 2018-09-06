import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceProductSelectListComponent } from './performance-product-select-list.component';

describe('PerformanceProductSelectListComponent', () => {
  let component: PerformanceProductSelectListComponent;
  let fixture: ComponentFixture<PerformanceProductSelectListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceProductSelectListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceProductSelectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
