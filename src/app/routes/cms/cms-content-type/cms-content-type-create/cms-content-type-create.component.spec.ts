import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsContentTypeCreateComponent } from './cms-content-type-create.component';

describe('CmsContentTypeCreateComponent', () => {
  let component: CmsContentTypeCreateComponent;
  let fixture: ComponentFixture<CmsContentTypeCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsContentTypeCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsContentTypeCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
