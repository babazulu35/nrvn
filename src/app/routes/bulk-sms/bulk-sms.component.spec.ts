import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkSmsComponent } from './bulk-sms.component';

describe('BulkSmsComponent', () => {
  let component: BulkSmsComponent;
  let fixture: ComponentFixture<BulkSmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkSmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
