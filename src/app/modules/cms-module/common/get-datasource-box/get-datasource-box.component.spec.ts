import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetDatasourceBoxComponent } from './get-datasource-box.component';

describe('GetDatasourceBoxComponent', () => {
  let component: GetDatasourceBoxComponent;
  let fixture: ComponentFixture<GetDatasourceBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetDatasourceBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetDatasourceBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
