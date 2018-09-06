import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleGroupSelectionBoxComponent } from './role-group-selection-box.component';

describe('RoleGroupSelectionBoxComponent', () => {
  let component: RoleGroupSelectionBoxComponent;
  let fixture: ComponentFixture<RoleGroupSelectionBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleGroupSelectionBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleGroupSelectionBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
