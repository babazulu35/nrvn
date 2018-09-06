import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageWizardHeaderComponent } from './page-wizard-header.component';

describe('PageWizardHeaderComponent', () => {
  let component: PageWizardHeaderComponent;
  let fixture: ComponentFixture<PageWizardHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageWizardHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageWizardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
