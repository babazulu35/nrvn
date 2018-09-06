import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateCreateWizardComponent } from './template-create-wizard.component';

describe('TemplateCreateWizardComponent', () => {
  let component: TemplateCreateWizardComponent;
  let fixture: ComponentFixture<TemplateCreateWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateCreateWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateCreateWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
