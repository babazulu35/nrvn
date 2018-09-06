import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsComponentSettingsBlockComponent } from './cms-component-settings-block.component';

describe('CmsComponentSettingsBlockComponent', () => {
  let component: CmsComponentSettingsBlockComponent;
  let fixture: ComponentFixture<CmsComponentSettingsBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsComponentSettingsBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsComponentSettingsBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
