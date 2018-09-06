import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsComponentContainerComponent } from './cms-component-container.component';

describe('CmsComponentContainerComponent', () => {
  let component: CmsComponentContainerComponent;
  let fixture: ComponentFixture<CmsComponentContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsComponentContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsComponentContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
