import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalUserListComponent } from './terminal-user-list.component';

describe('TerminalUserListComponent', () => {
  let component: TerminalUserListComponent;
  let fixture: ComponentFixture<TerminalUserListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerminalUserListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminalUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
