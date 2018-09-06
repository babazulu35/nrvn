import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentOptionsComponent } from './installment-options.component';

describe('InstallmentOptionsComponent', () => {
  let component: InstallmentOptionsComponent;
  let fixture: ComponentFixture<InstallmentOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstallmentOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallmentOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
