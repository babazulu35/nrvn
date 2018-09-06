import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolInvitationsComponent } from './pool-invitations.component';

describe('PoolInvitationsComponent', () => {
  let component: PoolInvitationsComponent;
  let fixture: ComponentFixture<PoolInvitationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoolInvitationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolInvitationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
