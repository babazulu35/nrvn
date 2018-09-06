import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsComponentContainerCreateComponent } from './cms-component-container-create.component';

describe('CmsComponentContainerCreateComponent', () => {
  let component: CmsComponentContainerCreateComponent;
  let fixture: ComponentFixture<CmsComponentContainerCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsComponentContainerCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsComponentContainerCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
