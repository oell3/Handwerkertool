import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthServiceComponent } from './auth-service';

describe('AuthServiceComponent', () => {
  let component: AuthServiceComponent;
  let fixture: ComponentFixture<AuthServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthServiceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthServiceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
