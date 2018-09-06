import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleGroupSettingsComponent } from './role-group-settings.component';

describe('RoleGroupSettingsComponent', () => {
  let component: RoleGroupSettingsComponent;
  let fixture: ComponentFixture<RoleGroupSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleGroupSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleGroupSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
