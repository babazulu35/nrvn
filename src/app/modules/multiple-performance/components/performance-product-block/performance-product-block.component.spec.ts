import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceProductBlockComponent } from './performance-product-block.component';

describe('PerformanceProductBlockComponent', () => {
  let component: PerformanceProductBlockComponent;
  let fixture: ComponentFixture<PerformanceProductBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceProductBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceProductBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
