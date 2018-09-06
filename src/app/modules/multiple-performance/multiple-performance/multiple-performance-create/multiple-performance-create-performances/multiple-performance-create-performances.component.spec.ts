import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePerformanceCreatePerformancesComponent } from './multiple-performance-create-performances.component';

describe('MultiplePerformanceCreatePerformancesComponent', () => {
  let component: MultiplePerformanceCreatePerformancesComponent;
  let fixture: ComponentFixture<MultiplePerformanceCreatePerformancesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiplePerformanceCreatePerformancesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplePerformanceCreatePerformancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
