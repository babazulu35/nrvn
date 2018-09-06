import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleGroupListComponent } from './role-group-list.component';

describe('RoleGroupListComponent', () => {
  let component: RoleGroupListComponent;
  let fixture: ComponentFixture<RoleGroupListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleGroupListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
