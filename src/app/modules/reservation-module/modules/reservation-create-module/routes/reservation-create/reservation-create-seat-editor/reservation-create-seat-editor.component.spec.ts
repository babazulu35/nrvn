import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationCreateSeatEditorComponent } from './reservation-create-seat-editor.component';

describe('ReservationCreateSeatEditorComponent', () => {
  let component: ReservationCreateSeatEditorComponent;
  let fixture: ComponentFixture<ReservationCreateSeatEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservationCreateSeatEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationCreateSeatEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
