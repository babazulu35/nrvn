import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceRelocationComponent } from './performance-relocation.component';

describe('PerformanceRelocationComponent', () => {
  let component: PerformanceRelocationComponent;
  let fixture: ComponentFixture<PerformanceRelocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceRelocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceRelocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
