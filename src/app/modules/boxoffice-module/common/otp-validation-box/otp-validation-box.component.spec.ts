import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpValidationBoxComponent } from './otp-validation-box.component';

describe('OtpValidationBoxComponent', () => {
  let component: OtpValidationBoxComponent;
  let fixture: ComponentFixture<OtpValidationBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtpValidationBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpValidationBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
