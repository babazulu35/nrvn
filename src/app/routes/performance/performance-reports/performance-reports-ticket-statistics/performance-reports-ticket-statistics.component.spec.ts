import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceReportsTicketStatisticsComponent } from './performance-reports-ticket-statistics.component';

describe('PerformanceReportsTicketStatisticsComponent', () => {
  let component: PerformanceReportsTicketStatisticsComponent;
  let fixture: ComponentFixture<PerformanceReportsTicketStatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceReportsTicketStatisticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceReportsTicketStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
