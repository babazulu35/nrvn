import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHallBoxComponent } from './create-hall-box.component';

describe('CreateHallBoxComponent', () => {
  let component: CreateHallBoxComponent;
  let fixture: ComponentFixture<CreateHallBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateHallBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateHallBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
