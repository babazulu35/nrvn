import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCapacitySelectListComponent } from './customer-capacity-select-list.component';

describe('CustomerCapacitySelectListComponent', () => {
  let component: CustomerCapacitySelectListComponent;
  let fixture: ComponentFixture<CustomerCapacitySelectListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerCapacitySelectListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerCapacitySelectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
