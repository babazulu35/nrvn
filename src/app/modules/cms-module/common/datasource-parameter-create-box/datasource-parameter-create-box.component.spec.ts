import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasourceParameterCreateBoxComponent } from './datasource-parameter-create-box.component';

describe('DatasourceParameterCreateBoxComponent', () => {
  let component: DatasourceParameterCreateBoxComponent;
  let fixture: ComponentFixture<DatasourceParameterCreateBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasourceParameterCreateBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasourceParameterCreateBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
