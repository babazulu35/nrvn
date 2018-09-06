import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignMonitorComponent } from './campaign-monitor.component';

describe('CampaignMonitorComponent', () => {
  let component: CampaignMonitorComponent;
  let fixture: ComponentFixture<CampaignMonitorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignMonitorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
