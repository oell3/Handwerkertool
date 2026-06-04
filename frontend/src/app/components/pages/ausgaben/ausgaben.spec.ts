import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AusgabenComponent } from './ausgaben';

describe('AusgabenComponent', () => {
  let component: AusgabenComponent;
  let fixture: ComponentFixture<AusgabenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AusgabenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AusgabenComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
