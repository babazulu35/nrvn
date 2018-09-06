import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTerminalUserBoxComponent } from './add-terminal-user-box.component';

describe('AddTerminalUserBoxComponent', () => {
  let component: AddTerminalUserBoxComponent;
  let fixture: ComponentFixture<AddTerminalUserBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTerminalUserBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTerminalUserBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
