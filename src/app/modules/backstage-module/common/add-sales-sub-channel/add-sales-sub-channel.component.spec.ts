import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSalesSubChannelComponent } from './add-sales-sub-channel.component';

describe('AddSalesSubChannelComponent', () => {
  let component: AddSalesSubChannelComponent;
  let fixture: ComponentFixture<AddSalesSubChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSalesSubChannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSalesSubChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
