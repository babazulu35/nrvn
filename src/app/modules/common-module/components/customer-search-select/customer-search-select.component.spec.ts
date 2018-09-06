import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSearchSelectComponent } from './customer-search-select.component';

describe('CustomerSearchSelectComponent', () => {
  let component: CustomerSearchSelectComponent;
  let fixture: ComponentFixture<CustomerSearchSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerSearchSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSearchSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
