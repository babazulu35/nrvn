import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalEditComponent } from './terminal-edit.component';

describe('TerminalEditComponent', () => {
  let component: TerminalEditComponent;
  let fixture: ComponentFixture<TerminalEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerminalEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminalEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
