import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Termine } from './termine';

describe('Termine', () => {
  let component: Termine;
  let fixture: ComponentFixture<Termine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Termine],
    }).compileComponents();

    fixture = TestBed.createComponent(Termine);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
