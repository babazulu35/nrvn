import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmsIndexComponent } from './firms-index.component';

describe('FirmsIndexComponent', () => {
  let component: FirmsIndexComponent;
  let fixture: ComponentFixture<FirmsIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirmsIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirmsIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
