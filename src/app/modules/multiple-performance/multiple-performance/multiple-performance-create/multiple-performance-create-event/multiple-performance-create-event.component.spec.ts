import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePerformanceCreateEventComponent } from './multiple-performance-create-event.component';

describe('MultiplePerformanceCreateEventComponent', () => {
  let component: MultiplePerformanceCreateEventComponent;
  let fixture: ComponentFixture<MultiplePerformanceCreateEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiplePerformanceCreateEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplePerformanceCreateEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
