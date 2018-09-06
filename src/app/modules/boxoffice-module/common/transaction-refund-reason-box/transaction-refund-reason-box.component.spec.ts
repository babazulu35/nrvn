import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionRefundReasonBoxComponent } from './transaction-refund-reason-box.component';

describe('TransactionRefundReasonBoxComponent', () => {
  let component: TransactionRefundReasonBoxComponent;
  let fixture: ComponentFixture<TransactionRefundReasonBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionRefundReasonBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionRefundReasonBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
