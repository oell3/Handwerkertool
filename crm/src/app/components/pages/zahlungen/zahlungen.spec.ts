import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Zahlungen } from './zahlungen';

describe('Zahlungen', () => {
  let component: Zahlungen;
  let fixture: ComponentFixture<Zahlungen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Zahlungen],
    }).compileComponents();

    fixture = TestBed.createComponent(Zahlungen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
