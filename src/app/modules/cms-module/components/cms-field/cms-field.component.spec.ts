import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsFieldComponent } from './cms-field.component';

describe('CmsFieldComponent', () => {
  let component: CmsFieldComponent;
  let fixture: ComponentFixture<CmsFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
