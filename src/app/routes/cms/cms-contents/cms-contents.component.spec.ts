import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsContentsComponent } from './cms-contents.component';

describe('CmsContentsComponent', () => {
  let component: CmsContentsComponent;
  let fixture: ComponentFixture<CmsContentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsContentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
