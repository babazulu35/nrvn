import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HallRowComponent } from './hall-row.component';

describe('HallRowComponent', () => {
  let component: HallRowComponent;
  let fixture: ComponentFixture<HallRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HallRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HallRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
