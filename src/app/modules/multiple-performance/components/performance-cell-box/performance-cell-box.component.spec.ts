import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceCellBoxComponent } from './performance-cell-box.component';

describe('PerformanceCellBoxComponent', () => {
  let component: PerformanceCellBoxComponent;
  let fixture: ComponentFixture<PerformanceCellBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceCellBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceCellBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
