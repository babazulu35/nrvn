import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePerformanceComponent } from './multiple-performance.component';

describe('MultiplePerformanceComponent', () => {
  let component: MultiplePerformanceComponent;
  let fixture: ComponentFixture<MultiplePerformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiplePerformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplePerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
