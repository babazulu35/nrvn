import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePerformanceCreateCapacityComponent } from './multiple-performance-create-capacity.component';

describe('MultiplePerformanceCreateCapacityComponent', () => {
  let component: MultiplePerformanceCreateCapacityComponent;
  let fixture: ComponentFixture<MultiplePerformanceCreateCapacityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiplePerformanceCreateCapacityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplePerformanceCreateCapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
