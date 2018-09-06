import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyValueItemCreateBoxComponent } from './key-value-item-create-box.component';

describe('KeyValueItemCreateBoxComponent', () => {
  let component: KeyValueItemCreateBoxComponent;
  let fixture: ComponentFixture<KeyValueItemCreateBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyValueItemCreateBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyValueItemCreateBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
