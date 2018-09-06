import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesSubChannelTerminalComponent } from './sales-sub-channel-terminal.component';

describe('SalesSubChannelTerminalComponent', () => {
  let component: SalesSubChannelTerminalComponent;
  let fixture: ComponentFixture<SalesSubChannelTerminalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesSubChannelTerminalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesSubChannelTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
