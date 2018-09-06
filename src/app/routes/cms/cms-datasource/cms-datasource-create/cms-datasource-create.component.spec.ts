import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsDatasourceCreateComponent } from './cms-datasource-create.component';

describe('CmsDatasourceCreateComponent', () => {
  let component: CmsDatasourceCreateComponent;
  let fixture: ComponentFixture<CmsDatasourceCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsDatasourceCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsDatasourceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
