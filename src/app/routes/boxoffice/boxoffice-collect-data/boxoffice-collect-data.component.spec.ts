import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxofficeCollectDataComponent } from './boxoffice-collect-data.component';

describe('BoxofficeCollectDataComponent', () => {
  let component: BoxofficeCollectDataComponent;
  let fixture: ComponentFixture<BoxofficeCollectDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxofficeCollectDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxofficeCollectDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
