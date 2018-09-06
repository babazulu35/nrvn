import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSaleSeatEditorComponent } from './group-sale-seat-editor.component';

describe('GroupSaleSeatEditorComponent', () => {
  let component: GroupSaleSeatEditorComponent;
  let fixture: ComponentFixture<GroupSaleSeatEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupSaleSeatEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSaleSeatEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
