import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelBlockSelectProductBoxComponent } from './cancel-block-select-product-box.component';

describe('CancelBlockSelectProductBoxComponent', () => {
  let component: CancelBlockSelectProductBoxComponent;
  let fixture: ComponentFixture<CancelBlockSelectProductBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelBlockSelectProductBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelBlockSelectProductBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
