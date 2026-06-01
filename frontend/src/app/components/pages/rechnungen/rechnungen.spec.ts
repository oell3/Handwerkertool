import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rechnungen } from './rechnungen';

describe('Rechnungen', () => {
  let component: Rechnungen;
  let fixture: ComponentFixture<Rechnungen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rechnungen],
    }).compileComponents();

    fixture = TestBed.createComponent(Rechnungen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
