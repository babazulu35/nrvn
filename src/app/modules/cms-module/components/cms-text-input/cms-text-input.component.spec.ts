import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsTextInputComponent } from './cms-text-input.component';

describe('CmsTextInputComponent', () => {
  let component: CmsTextInputComponent;
  let fixture: ComponentFixture<CmsTextInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsTextInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsTextInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
