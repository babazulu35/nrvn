import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsComponentContainersComponent } from './cms-component-containers.component';

describe('CmsComponentContainersComponent', () => {
  let component: CmsComponentContainersComponent;
  let fixture: ComponentFixture<CmsComponentContainersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsComponentContainersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsComponentContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
