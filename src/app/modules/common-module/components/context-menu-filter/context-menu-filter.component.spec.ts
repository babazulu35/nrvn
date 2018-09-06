import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuFilterComponent } from './context-menu-filter.component';

describe('ContextMenuFilterComponent', () => {
  let component: ContextMenuFilterComponent;
  let fixture: ComponentFixture<ContextMenuFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContextMenuFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextMenuFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
