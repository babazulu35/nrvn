import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsContentCreateComponent } from './cms-content-create.component';

describe('CmsContentCreateComponent', () => {
  let component: CmsContentCreateComponent;
  let fixture: ComponentFixture<CmsContentCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsContentCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsContentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
