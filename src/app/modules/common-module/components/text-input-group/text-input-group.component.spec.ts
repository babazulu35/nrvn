import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextInputGroupComponent } from './text-input-group.component';

describe('TextInputGroupComponent', () => {
  let component: TextInputGroupComponent;
  let fixture: ComponentFixture<TextInputGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextInputGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextInputGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
