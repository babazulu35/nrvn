import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandableTreeBlockComponent } from './expandable-tree-block.component';

describe('ExpandableTreeBlockComponent', () => {
  let component: ExpandableTreeBlockComponent;
  let fixture: ComponentFixture<ExpandableTreeBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpandableTreeBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandableTreeBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
