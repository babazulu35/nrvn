import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationCreateIndexComponent } from './reservation-create-index.component';

describe('ReservationCreateIndexComponent', () => {
  let component: ReservationCreateIndexComponent;
  let fixture: ComponentFixture<ReservationCreateIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservationCreateIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationCreateIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
