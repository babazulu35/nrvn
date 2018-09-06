import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceCustomerInfoBoxComponent } from './invoice-customer-info-box.component';

describe('InvoiceCustomerInfoBoxComponent', () => {
  let component: InvoiceCustomerInfoBoxComponent;
  let fixture: ComponentFixture<InvoiceCustomerInfoBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceCustomerInfoBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceCustomerInfoBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
