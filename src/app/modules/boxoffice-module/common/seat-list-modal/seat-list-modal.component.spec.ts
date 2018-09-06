import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatListModalComponent } from './seat-list-modal.component';

describe('SeatListModalComponent', () => {
  let component: SeatListModalComponent;
  let fixture: ComponentFixture<SeatListModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeatListModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeatListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
