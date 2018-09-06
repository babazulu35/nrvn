import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePerformanceCreateComponent } from './multiple-performance-create.component';

describe('MultiplePerformanceCreateComponent', () => {
  let component: MultiplePerformanceCreateComponent;
  let fixture: ComponentFixture<MultiplePerformanceCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiplePerformanceCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplePerformanceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
