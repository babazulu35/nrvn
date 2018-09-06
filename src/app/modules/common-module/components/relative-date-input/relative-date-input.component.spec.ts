import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelativeDateInputComponent } from './relative-date-input.component';

describe('RelativeDateInputComponent', () => {
  let component: RelativeDateInputComponent;
  let fixture: ComponentFixture<RelativeDateInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelativeDateInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelativeDateInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
