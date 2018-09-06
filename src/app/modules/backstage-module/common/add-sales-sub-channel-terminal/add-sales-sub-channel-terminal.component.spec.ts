import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSalesSubChannelTerminalComponent } from './add-sales-sub-channel-terminal.component';

describe('AddSalesSubChannelTerminalComponent', () => {
  let component: AddSalesSubChannelTerminalComponent;
  let fixture: ComponentFixture<AddSalesSubChannelTerminalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSalesSubChannelTerminalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSalesSubChannelTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
