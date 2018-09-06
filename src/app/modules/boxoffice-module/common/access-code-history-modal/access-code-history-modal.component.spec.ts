import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessCodeHistoryModalComponent } from './access-code-history-modal.component';

describe('AccessCodeHistoryModalComponent', () => {
  let component: AccessCodeHistoryModalComponent;
  let fixture: ComponentFixture<AccessCodeHistoryModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessCodeHistoryModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessCodeHistoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
