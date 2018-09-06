import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsComponentContainerCardComponent } from './cms-component-container-card.component';

describe('CmsComponentContainerCardComponent', () => {
  let component: CmsComponentContainerCardComponent;
  let fixture: ComponentFixture<CmsComponentContainerCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsComponentContainerCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsComponentContainerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
