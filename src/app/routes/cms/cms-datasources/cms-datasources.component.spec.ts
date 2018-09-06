import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsDatasourcesComponent } from './cms-datasources.component';

describe('CmsDatasourcesComponent', () => {
  let component: CmsDatasourcesComponent;
  let fixture: ComponentFixture<CmsDatasourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsDatasourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsDatasourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
