import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceReportsVisitDataComponent } from './performance-reports-visit-data.component';

describe('PerformanceReportsVisitDataComponent', () => {
  let component: PerformanceReportsVisitDataComponent;
  let fixture: ComponentFixture<PerformanceReportsVisitDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceReportsVisitDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceReportsVisitDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
