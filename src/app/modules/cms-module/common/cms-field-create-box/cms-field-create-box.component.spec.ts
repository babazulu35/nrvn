import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsFieldCreateBoxComponent } from './cms-field-create-box.component';

describe('CmsFieldCreateBoxComponent', () => {
  let component: CmsFieldCreateBoxComponent;
  let fixture: ComponentFixture<CmsFieldCreateBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsFieldCreateBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsFieldCreateBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
