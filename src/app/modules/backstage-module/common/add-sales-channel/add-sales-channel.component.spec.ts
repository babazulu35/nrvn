import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSalesChannelComponent } from './add-sales-channel.component';

describe('AddSalesChannelComponent', () => {
  let component: AddSalesChannelComponent;
  let fixture: ComponentFixture<AddSalesChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSalesChannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSalesChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
