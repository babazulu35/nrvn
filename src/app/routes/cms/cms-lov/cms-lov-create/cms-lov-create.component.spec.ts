import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsLovCreateComponent } from './cms-lov-create.component';

describe('CmsLovCreateComponent', () => {
  let component: CmsLovCreateComponent;
  let fixture: ComponentFixture<CmsLovCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsLovCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsLovCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
