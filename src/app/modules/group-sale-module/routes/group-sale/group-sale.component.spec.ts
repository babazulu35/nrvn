import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSaleComponent } from './group-sale.component';

describe('GroupSaleComponent', () => {
  let component: GroupSaleComponent;
  let fixture: ComponentFixture<GroupSaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupSaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
