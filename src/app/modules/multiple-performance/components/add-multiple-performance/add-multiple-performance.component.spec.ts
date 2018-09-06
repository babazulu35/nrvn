import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMultiplePerformanceComponent } from './add-multiple-performance.component';

describe('AddMultiplePerformanceComponent', () => {
  let component: AddMultiplePerformanceComponent;
  let fixture: ComponentFixture<AddMultiplePerformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMultiplePerformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMultiplePerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
