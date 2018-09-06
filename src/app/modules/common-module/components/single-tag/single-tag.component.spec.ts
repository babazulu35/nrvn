import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleTagComponent } from './single-tag.component';

describe('SingleTagComponent', () => {
  let component: SingleTagComponent;
  let fixture: ComponentFixture<SingleTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
