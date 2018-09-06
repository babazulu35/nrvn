import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalUsersComponent } from './terminal-users.component';

describe('TerminalUsersComponent', () => {
  let component: TerminalUsersComponent;
  let fixture: ComponentFixture<TerminalUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerminalUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminalUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
