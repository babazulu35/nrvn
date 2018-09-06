import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsContentTypesComponent } from './cms-content-types.component';

describe('CmsContentTypesComponent', () => {
  let component: CmsContentTypesComponent;
  let fixture: ComponentFixture<CmsContentTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsContentTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsContentTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
