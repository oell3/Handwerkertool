import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ausgaben } from './ausgaben';

describe('Ausgaben', () => {
  let component: Ausgaben;
  let fixture: ComponentFixture<Ausgaben>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ausgaben],
    }).compileComponents();

    fixture = TestBed.createComponent(Ausgaben);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
