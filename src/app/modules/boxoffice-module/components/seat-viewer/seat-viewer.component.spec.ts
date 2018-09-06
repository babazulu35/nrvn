import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatViewerComponent } from './seat-viewer.component';

describe('SeatViewerComponent', () => {
  let component: SeatViewerComponent;
  let fixture: ComponentFixture<SeatViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeatViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeatViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
