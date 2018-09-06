import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockCapacityBoxComponent } from './block-capacity-box.component';

describe('BlockCapacityBoxComponent', () => {
  let component: BlockCapacityBoxComponent;
  let fixture: ComponentFixture<BlockCapacityBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockCapacityBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockCapacityBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
