import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoterSelectionBoxComponent } from './promoter-selection-box.component';

describe('PromoterSelectionBoxComponent', () => {
  let component: PromoterSelectionBoxComponent;
  let fixture: ComponentFixture<PromoterSelectionBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromoterSelectionBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromoterSelectionBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
