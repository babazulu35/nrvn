import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintTicketV2Component } from './print-ticket-v2.component';

describe('PrintTicketV2Component', () => {
  let component: PrintTicketV2Component;
  let fixture: ComponentFixture<PrintTicketV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintTicketV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintTicketV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
