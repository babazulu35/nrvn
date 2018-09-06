import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsLovsComponent } from './cms-lovs.component';

describe('CmsLovsComponent', () => {
  let component: CmsLovsComponent;
  let fixture: ComponentFixture<CmsLovsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsLovsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsLovsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
