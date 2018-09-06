import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsFieldCardComponent } from './cms-field-card.component';

describe('CmsFieldCardComponent', () => {
  let component: CmsFieldCardComponent;
  let fixture: ComponentFixture<CmsFieldCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsFieldCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsFieldCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
