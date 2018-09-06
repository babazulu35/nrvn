import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesChannelsComponent } from './sales-channels.component';

describe('SalesChannelsComponent', () => {
  let component: SalesChannelsComponent;
  let fixture: ComponentFixture<SalesChannelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesChannelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesChannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
