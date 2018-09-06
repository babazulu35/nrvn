import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceReportsComponent } from './performance-reports.component';

describe('PerformanceReportsComponent', () => {
  let component: PerformanceReportsComponent;
  let fixture: ComponentFixture<PerformanceReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
