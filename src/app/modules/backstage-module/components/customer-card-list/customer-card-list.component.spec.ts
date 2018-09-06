import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCardListComponent } from './customer-card-list.component';

describe('CustomerCardListComponent', () => {
  let component: CustomerCardListComponent;
  let fixture: ComponentFixture<CustomerCardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerCardListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
