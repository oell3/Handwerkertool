import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Objektverwalung } from './objektverwalung';

describe('Objektverwalung', () => {
  let component: Objektverwalung;
  let fixture: ComponentFixture<Objektverwalung>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Objektverwalung],
    }).compileComponents();

    fixture = TestBed.createComponent(Objektverwalung);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
