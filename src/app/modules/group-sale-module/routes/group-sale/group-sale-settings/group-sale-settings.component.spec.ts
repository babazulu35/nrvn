import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSaleSettingsComponent } from './group-sale-settings.component';

describe('GroupSaleSettingsComponent', () => {
  let component: GroupSaleSettingsComponent;
  let fixture: ComponentFixture<GroupSaleSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupSaleSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSaleSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
