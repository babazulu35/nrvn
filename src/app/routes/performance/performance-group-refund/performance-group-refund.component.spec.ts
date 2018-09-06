import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceGroupRefundComponent } from './performance-group-refund.component';

describe('PerformanceGroupRefundComponent', () => {
  let component: PerformanceGroupRefundComponent;
  let fixture: ComponentFixture<PerformanceGroupRefundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceGroupRefundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceGroupRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
