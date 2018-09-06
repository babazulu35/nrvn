import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceCustomerCheckComponent } from './invoice-customer-check.component';

describe('InvoiceCustomerCheckComponent', () => {
  let component: InvoiceCustomerCheckComponent;
  let fixture: ComponentFixture<InvoiceCustomerCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceCustomerCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceCustomerCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
