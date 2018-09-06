import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmsEditComponent } from './firms-edit.component';

describe('FirmsEditComponent', () => {
  let component: FirmsEditComponent;
  let fixture: ComponentFixture<FirmsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirmsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirmsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
