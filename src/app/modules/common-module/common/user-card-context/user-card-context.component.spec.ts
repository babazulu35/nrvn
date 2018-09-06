import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCardContextComponent } from './user-card-context.component';

describe('UserCardContextComponent', () => {
  let component: UserCardContextComponent;
  let fixture: ComponentFixture<UserCardContextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserCardContextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCardContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
