import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsComponentCreateBoxComponent } from './cms-component-create-box.component';

describe('CmsComponentCreateBoxComponent', () => {
  let component: CmsComponentCreateBoxComponent;
  let fixture: ComponentFixture<CmsComponentCreateBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsComponentCreateBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsComponentCreateBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
