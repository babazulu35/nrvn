import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitySearchBoxComponent } from './entity-search-box.component';

describe('EntitySearchBoxComponent', () => {
  let component: EntitySearchBoxComponent;
  let fixture: ComponentFixture<EntitySearchBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntitySearchBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitySearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
